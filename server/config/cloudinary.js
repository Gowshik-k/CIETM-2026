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
        const timestamp = Date.now();
        const originalName = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        return {
            folder: 'conference_papers',
            resource_type: 'auto', // auto allows preview in browser
            public_id: `paper_${originalName}_${timestamp}`,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed!'), false);
        }
    }
});

module.exports = { cloudinary, upload };
