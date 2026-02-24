const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    broadcastNotification,
    exportRegistrations,
    cleanupDatabase,
    cleanupCloudinary
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getSettings);
router.put('/', protect, admin, updateSettings);
router.post('/broadcast', protect, admin, broadcastNotification);
router.get('/export', protect, admin, exportRegistrations);
router.delete('/cleanup/database', protect, admin, cleanupDatabase);
router.delete('/cleanup/cloudinary', protect, admin, cleanupCloudinary);

module.exports = router;
