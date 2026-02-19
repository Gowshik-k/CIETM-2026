const Registration = require('../models/Registration');
const { generatePayUHash, verifyPayUHash } = require('../utils/payu');

// @desc    Initialize payment (Generate Hash)
// @route   POST /api/payments/init
// @access  Private
const initPayment = async (req, res) => {
    const { registrationId } = req.body;
    const userId = req.user._id;

    try {
        const registration = await Registration.findById(registrationId);

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        if (registration.status !== 'Accepted') {
            return res.status(400).json({ message: 'Payment only allowed for accepted papers' });
        }

        const txnid = `TXN_${Date.now()}`;
        const categoryAmounts = {
            'UG/PG STUDENTS': 500,
            'FACULTY/RESEARCH SCHOLARS': 750,
            'EXTERNAL / ONLINE PRESENTATION': 300,
            'INDUSTRY PERSONNEL': 900
        };

        let totalAmount = categoryAmounts[registration.personalDetails.category] || 1000;

        if (registration.teamMembers && registration.teamMembers.length > 0) {
            registration.teamMembers.forEach(member => {
                totalAmount += categoryAmounts[member.category] || 1000;
            });
        }

        const amount = totalAmount;

        // Save amount and txnid to registration for tracking
        registration.amount = amount;
        registration.transactionId = txnid;
        await registration.save();

        const paymentData = {
            txnid,
            amount: amount.toFixed(2),
            productinfo: 'Conference Registration Fee',
            firstname: req.user.name.split(' ')[0],
            email: req.user.email
        };

        const hash = generatePayUHash(
            paymentData,
            process.env.PAYU_MERCHANT_KEY,
            process.env.PAYU_MERCHANT_SALT
        );

        res.json({
            ...paymentData,
            key: process.env.PAYU_MERCHANT_KEY,
            hash,
            surl: `${process.env.FRONTEND_URL}/payment-success`,
            furl: `${process.env.FRONTEND_URL}/payment-failure`
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Payment Callback (Verify Success/Failure)
// @route   POST /api/payments/callback
// @access  Public (Called by PayU)
const paymentCallback = async (req, res) => {
    const data = req.body;

    if (verifyPayUHash(data, process.env.PAYU_MERCHANT_SALT)) {
        if (data.status === 'success') {
            // Update registration status
            const registration = await Registration.findOne({ transactionId: data.txnid });
            if (registration) {
                registration.paymentStatus = 'Completed';
                await registration.save();

                // Trigger notification
                await require('./notificationController').createNotification(
                    registration.userId,
                    'Payment Successful',
                    'Your conference registration payment has been successfully processed.',
                    'success',
                    '/dashboard'
                );
            }
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=success`);
        } else {
            res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=fail`);
        }
    } else {
        res.status(400).send('Invalid Hash');
    }
};

module.exports = {
    initPayment,
    paymentCallback
};
