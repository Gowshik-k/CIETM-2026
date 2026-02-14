const express = require('express');
const router = express.Router();
const { initPayment, paymentCallback } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/init', protect, initPayment);
router.post('/callback', paymentCallback);

module.exports = router;
