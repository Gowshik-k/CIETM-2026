const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const extension = file.originalname.split('.').pop();

        let fileName = `anonymous_${Date.now()}`;

        if (req.user && req.user._id) {
            try {
                // Dynamically require to avoid circular dependency issues if any
                const Registration = require('../models/Registration');
                const registration = await Registration.findOne({ userId: req.user._id });

                if (registration && registration.authorId) {
                    fileName = registration.authorId; // e.g., CIETM-123456
                } else {
                    // Fallback to user ID if registration draft doesn't exist yet
                    fileName = req.user._id.toString();
                }
            } catch (err) {
                console.error("Error fetching Registration for Cloudinary upload:", err);
                fileName = req.user._id.toString();
            }
        }

        return {
            folder: 'conference_papers',
            resource_type: 'raw', // Use 'raw' for non-image files like Word docs
            public_id: `${fileName}.${extension}`,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only Microsoft Word documents (.doc, .docx) are allowed!'), false);
        }
    }
});

module.exports = { cloudinary, upload };
