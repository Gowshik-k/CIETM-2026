const Registration = require('../models/Registration');
const sendEmail = require('../utils/sendEmail');

// @desc    Create or Update a draft registration
// @route   POST /api/registrations/draft
// @access  Private
const saveDraft = async (req, res) => {
    const { personalDetails, teamMembers, paperDetails } = req.body;
    const userId = req.user._id;

    try {
        let registration = await Registration.findOne({ userId });

        if (registration) {
            // Update existing draft
            registration.personalDetails = personalDetails || registration.personalDetails;
            registration.teamMembers = teamMembers || registration.teamMembers;
            registration.paperDetails = { ...registration.paperDetails, ...paperDetails };
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
        const registrations = await Registration.find({}).populate('userId', 'name email');
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

module.exports = {
    saveDraft,
    submitRegistration,
    getMyRegistration,
    getAllRegistrations,
    reviewPaper
};
