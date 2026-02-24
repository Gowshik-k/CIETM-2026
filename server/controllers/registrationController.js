const Registration = require('../models/Registration');
const sendEmail = require('../utils/sendEmail');
const { cloudinary } = require('../config/cloudinary');
const { createNotification } = require('./notificationController');
const archiver = require('archiver');
const axios = require('axios');

// @desc    Create or Update a draft registration
// @route   POST /api/registrations/draft
// @access  Private
const saveDraft = async (req, res) => {
    const { personalDetails, teamMembers, paperDetails } = req.body;
    const userId = req.user._id;

    try {
        let registration = await Registration.findOne({ userId });

        // Ensure mobile is synced from User if not provided in personalDetails
        if (personalDetails && !personalDetails.mobile && req.user.phone) {
            personalDetails.mobile = req.user.phone;
        }

        if (registration) {
            // Prevent updates if already reviewed (Accepted/Rejected)
            if (['Accepted', 'Rejected'].includes(registration.status)) {
                return res.status(403).json({ message: `Cannot modify registration as it has already been ${registration.status.toLowerCase()}.` });
            }

            // Filter team members
            if (teamMembers) {
                registration.teamMembers = teamMembers.filter(m => m && m.name && m.name.trim() !== '');
            }

            // Update existing draft
            registration.personalDetails = personalDetails || registration.personalDetails;

            // Explicitly handle merging paperDetails to avoid overwriting nested fields if partial
            if (paperDetails) {
                registration.paperDetails = {
                    ...registration.paperDetails.toObject(),
                    ...paperDetails,
                    keywords: paperDetails.keywords || registration.paperDetails.keywords
                };
            }

            registration.updatedAt = Date.now();

            await registration.save();
        } else {
            // Filter team members
            const validTeamMembers = teamMembers ? teamMembers.filter(m => m.name && m.name.trim() !== '') : [];

            // Generate a unique author ID (e.g., CIETM-123456)
            const randomCode = Math.floor(100000 + Math.random() * 900000);
            const authorId = `CIETM-${randomCode}`;

            // Create new draft
            registration = await Registration.create({
                userId,
                authorId,
                personalDetails,
                teamMembers: validTeamMembers,
                paperDetails,
                status: 'Draft'
            });
        }

        res.status(200).json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Submit final registration
// @route   POST /api/registrations/submit
// @access  Private
const submitRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({ userId: req.user._id });

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.status = 'Submitted';
        registration.paperDetails.reviewStatus = 'Submitted';
        registration.submittedAt = Date.now();

        await registration.save();

        // Create notification
        await createNotification(
            req.user._id,
            'Submission Received',
            'Your conference registration and paper details have been successfully submitted.',
            'success',
            '/dashboard'
        );

        res.status(200).json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get author registration
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({ userId: req.user._id });
        res.json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all registrations (Admin)
// @route   GET /api/registrations
// @access  Admin
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({}).populate('userId', 'name email phone');
        res.json(registrations);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Review paper (Admin)
// @route   PUT /api/registrations/:id/review
// @access  Admin
const reviewPaper = async (req, res) => {
    const { status, remarks } = req.body;

    try {
        const registration = await Registration.findById(req.params.id).populate('userId', 'email name');

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        registration.status = status;
        registration.paperDetails.reviewStatus = status;
        registration.paperDetails.reviewerComments = remarks;

        await registration.save();

        // Create notification
        await createNotification(
            registration.userId._id,
            `Paper ${status}`,
            `Your paper titled "${registration.paperDetails.title}" has been ${status.toLowerCase()}.`,
            status === 'Accepted' ? 'success' : status === 'Rejected' ? 'error' : 'info',
            '/dashboard'
        );

        // Send Notification Email
        try {
            await sendEmail({
                email: registration.userId.email,
                subject: `Your Paper Status: ${status}`,
                message: `
          <h1>Hello ${registration.userId.name},</h1>
          <p>Your paper titled "<strong>${registration.paperDetails.title}</strong>" has been <strong>${status}</strong>.</p>
          <p><strong>Remarks:</strong> ${remarks || 'None'}</p>
          <p>Please log in to your dashboard for more details.</p>
        `
            });
        } catch (err) {
            console.error("Email failed to send", err);
        }

        res.json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const sanitizeFilename = (text) => {
    return text
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/gi, '')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
};

const downloadPaper = async (req, res) => {
    try {
        const { id } = req.params;
        let registration;

        if (req.user.role === 'admin') {
            registration = await Registration.findById(id);
        } else {
            registration = await Registration.findOne({ userId: req.user._id });
        }

        if (!registration || !registration.paperDetails.fileUrl) {
            return res.status(404).json({ message: 'Paper not found or unauthorized' });
        }

        // Construct dynamic filename
        const authorName = sanitizeFilename(registration.personalDetails.name || 'author');
        const paperTitle = sanitizeFilename(registration.paperDetails.title || '');
        const basename = paperTitle ? `${authorName}_${paperTitle}` : authorName;

        // Get extension from originalName or default to docx
        const originalName = registration.paperDetails.originalName || '';
        const extension = originalName.split('.').pop() || 'docx';

        // Determine resource type - force 'raw' for word docs to be safe
        // Cloudinary private_download_url uses 'image' by default if not specified
        const isWordDoc = ['doc', 'docx'].includes(extension.toLowerCase());
        const resourceType = isWordDoc ? 'raw' : (registration.paperDetails.resourceType || 'raw');

        // For raw files, format should be empty if extension is in publicId
        const format = (resourceType === 'raw' && registration.paperDetails.publicId.endsWith(`.${extension}`)) ? '' : extension;

        const downloadUrl = cloudinary.utils.private_download_url(
            registration.paperDetails.publicId,
            format,
            {
                resource_type: resourceType,
                type: 'upload',
                attachment: `${basename}.${extension}`
            }
        );

        // Redirect to the generated Cloudinary download URL
        res.redirect(downloadUrl);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update/Upload full paper after submission
// @route   POST /api/registrations/upload-paper
// @access  Private
const updatePaper = async (req, res) => {
    const { fileUrl, publicId, resourceType, originalName } = req.body;
    try {
        const registration = await Registration.findOne({ userId: req.user._id });
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // Prevent updates if already reviewed (Accepted/Rejected)
        if (['Accepted', 'Rejected'].includes(registration.status)) {
            return res.status(403).json({ message: `Cannot update paper as it has already been ${registration.status.toLowerCase()}.` });
        }

        registration.paperDetails.fileUrl = fileUrl;
        registration.paperDetails.publicId = publicId;
        registration.paperDetails.resourceType = resourceType;
        registration.paperDetails.originalName = originalName;
        registration.updatedAt = Date.now();

        await registration.save();
        res.json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAdminAnalytics = async (req, res) => {
    try {
        const stats = await Registration.aggregate([
            {
                $group: {
                    _id: null,
                    totalRegistrations: { $sum: 1 },
                    totalAccepted: { $sum: { $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0] } },
                    totalRejected: { $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] } },
                    totalPending: { $sum: { $cond: [{ $in: ["$status", ["Submitted", "Under Review"]] }, 1, 0] } },
                    totalPayments: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Completed"] }, "$amount", 0] } },
                    completedPaymentsCount: { $sum: { $cond: [{ $eq: ["$paymentStatus", "Completed"] }, 1, 0] } }
                }
            }
        ]);

        const trackStats = await Registration.aggregate([
            { $group: { _id: "$paperDetails.track", count: { $sum: 1 } } }
        ]);

        const recentSubmissions = await Registration.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('userId', 'name email');

        res.json({
            overview: stats[0] || {},
            tracks: trackStats,
            recent: recentSubmissions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateRegistrationStatus = async (req, res) => {
    const { status, paymentStatus, transactionId, amount, attended } = req.body;
    try {
        const registration = await Registration.findById(req.params.id);
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        if (status) {
            registration.status = status;
            registration.paperDetails.reviewStatus = status;
        }
        if (paymentStatus) registration.paymentStatus = paymentStatus;
        if (transactionId) registration.transactionId = transactionId;
        if (amount) registration.amount = amount;
        if (attended !== undefined) {
            registration.attended = attended;
            if (attended && !registration.attendedAt) {
                registration.attendedAt = Date.now();
            }
        }

        await registration.save();
        res.json(registration);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Download all papers as ZIP (Admin)
// @route   GET /api/registrations/download-all
// @access  Admin
const downloadAllPapersZip = async (req, res) => {
    try {
        const registrations = await Registration.find({
            'paperDetails.fileUrl': { $exists: true, $ne: '' },
            'status': { $in: ['Submitted', 'Under Review', 'Accepted'] }
        });

        if (!registrations || registrations.length === 0) {
            return res.status(404).send('No papers found to download');
        }

        const archive = archiver('zip', { zlib: { level: 9 } });

        // Error handling for the archive
        archive.on('error', (err) => {
            throw err;
        });

        res.attachment(`CIETM_All_Manuscripts_${new Date().toISOString().split('T')[0]}.zip`);
        archive.pipe(res);

        for (const reg of registrations) {
            const authorName = sanitizeFilename(reg.personalDetails?.name || 'author');
            const paperTitle = sanitizeFilename(reg.paperDetails?.title || 'title');
            const originalName = reg.paperDetails?.originalName || '';
            const extension = originalName.split('.').pop() || 'docx';
            const fileName = `${authorName}_${paperTitle.substring(0, 50)}.${extension}`;

            try {
                const response = await axios({
                    method: 'get',
                    url: reg.paperDetails.fileUrl,
                    responseType: 'stream',
                    timeout: 30000 // 30 second timeout per file
                });

                if (response.status === 200) {
                    archive.append(response.data, { name: fileName });
                }
            } catch (err) {
                console.error(`Skipping file due to error: ${fileName}`, err.message);
            }
        }

        await archive.finalize();
    } catch (error) {
        console.error('ZIP Error:', error);
        if (!res.headersSent) {
            res.status(500).send('Error creating workspace archive');
        }
    }
};

// @desc    Verify entry for participant at venue (Admin)
// @route   GET /api/registrations/verify/:id
// @access  Admin
const verifyEntry = async (req, res) => {
    try {
        const registration = await Registration.findByIdAndUpdate(
            req.params.id,
            {
                attended: true,
                attendedAt: Date.now()
            },
            { new: true }
        ).populate('userId', 'name email phone');

        if (!registration) {
            return res.status(404).json({ message: 'Invalid ID Card or Registration not found' });
        }

        res.json(registration);
    } catch (error) {
        res.status(400).json({ message: 'Invalid QR Code data' });
    }
};

module.exports = {
    saveDraft,
    submitRegistration,
    getMyRegistration,
    getAllRegistrations,
    reviewPaper,
    downloadPaper,
    updatePaper,
    getAdminAnalytics,
    updateRegistrationStatus,
    downloadAllPapersZip,
    verifyEntry
};
