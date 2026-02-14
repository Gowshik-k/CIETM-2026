const express = require('express');
const router = express.Router();
const {
    saveDraft,
    submitRegistration,
    getMyRegistration,
    getAllRegistrations,
    reviewPaper,
} = require('../controllers/registrationController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary');

router.post('/draft', protect, saveDraft);
router.post('/submit', protect, submitRegistration);
router.get('/my', protect, getMyRegistration);
router.get('/', protect, admin, getAllRegistrations);
router.put('/:id/review', protect, admin, reviewPaper);

// File upload route
router.post('/upload', protect, upload.single('paper'), (req, res) => {
    if (req.file) {
        res.json({
            url: req.file.path,
            publicId: req.file.filename
        });
    } else {
        res.status(400).json({ message: 'File upload failed' });
    }
});

module.exports = router;
