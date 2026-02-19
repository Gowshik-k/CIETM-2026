const Registration = require('../models/Registration');
const sendEmail = require('../utils/sendEmail');
const { cloudinary } = require('../config/cloudinary');
const { createNotification } = require('./notificationController');

// @desc    Create or Update a draft registration
// @route   POST /api/registrations/draft
// @access  Private
const saveDraft = async (req, res) => {
    const { personalDetails, teamMembers, paperDetails } = req.body;
    const userId = req.user._id;

    try {
        let registration = await Registration.findOne({ userId });

        if (registration) {
            // Prevent updates if already reviewed (Accepted/Rejected)
            if (['Accepted', 'Rejected'].includes(registration.status)) {
                return res.status(403).json({ message: `Cannot modify registration as it has already been ${registration.status.toLowerCase()}.` });
            }

            // Update existing draft
            registration.personalDetails = personalDetails || registration.personalDetails;
            registration.teamMembers = teamMembers || registration.teamMembers;
            registration.paperDetails = { ...registration.paperDetails, ...paperDetails };

            // Explicitly handle merging paperDetails to avoid overwriting nested fields if partial
            if (paperDetails) {
                registration.paperDetails = {
                    ...registration.paperDetails,
                    ...paperDetails,
                    resourceType: paperDetails.resourceType || registration.paperDetails.resourceType,
                    keywords: paperDetails.keywords || registration.paperDetails.keywords
                };
            }

            registration.updatedAt = Date.now();

            await registration.save();
        } else {
            // Create new draft
            registration = await Registration.create({
                userId,
                personalDetails,
                teamMembers,
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

module.exports = {
    saveDraft,
    submitRegistration,
    getMyRegistration,
    getAllRegistrations,
    reviewPaper,
    downloadPaper,
    updatePaper
};
