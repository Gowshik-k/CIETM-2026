const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const extension = file.originalname.split('.').pop();
        let finalPublicId = `paper_${Date.now()}`;
        
        if (req.user && req.user._id) {
            try {
                const Registration = require('../models/Registration');
                // Get the latest registration for this user
                const registration = await Registration.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
                if (registration && registration.paperId) {
                    finalPublicId = registration.paperId;
                }
            } catch (err) {}
        }

        return {
            folder: 'conference_papers',
            resource_type: 'raw',
            public_id: `${finalPublicId}.${extension}`,
        };
    }
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

const profilePicStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const userId = req.user?._id || 'guest';
        return {
            folder: 'profile_pictures',
            resource_type: 'auto',
            public_id: `avatar_${userId}_${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
        };
    }
});

const uploadProfilePic = multer({
    storage: profilePicStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, PNG and WebP are allowed.'), false);
        }
    }
});

module.exports = { cloudinary, upload, uploadProfilePic };
