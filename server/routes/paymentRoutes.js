const express = require('express');
const router = express.Router();
const { initPayment, paymentCallback } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/init', protect, initPayment);

// Route for manual verification from frontend
router.post('/verify', protect, paymentCallback);

// Route for Cashfree webhook
router.post('/webhook', paymentCallback);

module.exports = router;
