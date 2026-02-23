const Settings = require('../models/Settings');
const Registration = require('../models/Registration');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public/Admin
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Admin
const updateSettings = async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(settings);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Broadcast notification to all users
// @route   POST /api/settings/broadcast
// @access  Admin
const broadcastNotification = async (req, res) => {
    const { title, message, type } = req.body;
    try {
        const users = await User.find({ role: 'author' });

        const notificationPromises = users.map(user =>
            createNotification(user._id, title, message, type || 'info', '/dashboard')
        );

        await Promise.all(notificationPromises);

        res.json({ message: `Notification sent to ${users.length} users` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export registrations to CSV (simple version returning JSON for frontend to parse)
// @route   GET /api/settings/export
// @access  Admin
const exportRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find({}).populate('userId', 'name email phone');

        const csvData = registrations.map(reg => {
            const data = {
                'Principal Author Name': reg.personalDetails?.name || reg.userId?.name,
                'Principal Email': reg.personalDetails?.email || reg.userId?.email,
                'Mobile Number': reg.personalDetails?.mobile || reg.userId?.phone || 'N/A',
                'Author Type': (reg.personalDetails?.category?.toLowerCase().includes('external') || reg.personalDetails?.institution?.toLowerCase().includes('external')) ? 'External' : 'Internal / Other',
                'Author Category': reg.personalDetails?.category,
                'Affiliation (Institute/Industry)': reg.personalDetails?.institution,
                'Department': reg.personalDetails?.department,
                'Area of Specialization': reg.personalDetails?.areaOfSpecialization,
                'Paper Title': reg.paperDetails?.title,
                'Conference Track': reg.paperDetails?.track,
                'Submission Status': reg.status,
                'Payment Status': reg.paymentStatus,
                'Transaction ID': reg.transactionId || 'N/A',
                'Amount (INR)': reg.amount || 0,
                'Payment Date': reg.paymentStatus === 'Completed' ? new Date(reg.updatedAt).toLocaleDateString() : 'N/A'
            };

            // Flatten Co-Authors (Up to 5)
            for (let i = 0; i < 5; i++) {
                const member = reg.teamMembers && reg.teamMembers[i];
                const prefix = `Co-Author ${i + 1}`;
                data[`${prefix} Name`] = member?.name || '';
                data[`${prefix} Email`] = member?.email || '';
                data[`${prefix} Affiliation`] = member?.affiliation || '';
                data[`${prefix} Category`] = member?.category || '';
                data[`${prefix} Specialization`] = member?.areaOfSpecialization || '';
            }

            return data;
        });

        res.json(csvData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings,
    broadcastNotification,
    exportRegistrations
};
