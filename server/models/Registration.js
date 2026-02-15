const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    personalDetails: {
        name: String,
        email: String,
        mobile: String,
        institution: String,
        category: {
            type: String,
            enum: ['Inter-college Student', 'External Student']
        }
    },
    teamMembers: [{
        name: String,
        email: String,
        affiliation: String
    }],
    paperDetails: {
        title: String,
        abstract: String,
        keywords: [String],
        track: String,
        fileUrl: String,
        publicId: String, // For Cloudinary
        resourceType: String, // 'image' or 'raw' - critical for correct download links
        originalName: String, // To preserve filename on download
        reviewStatus: {
            type: String,
            enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'],
            default: 'Draft'
        },
        reviewerComments: String
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'],
        default: 'Draft'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    transactionId: String,
    amount: Number,
    submittedAt: Date,
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Registration', registrationSchema);
