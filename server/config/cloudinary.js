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
        const extension = file.originalname.split('.').pop();
        const originalName = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.')
            .replace(/[^a-z0-9]/gi, '_')
            .toLowerCase();

        return {
            folder: 'conference_papers',
            resource_type: 'raw', // Use 'raw' for non-image files like Word docs
            public_id: `paper_${originalName}_${timestamp}.${extension}`,
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
