const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

// @desc    Register a new user (Create PendingUser)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    console.log('Registration request received for:', req.body.email);
    try {
        const { name, email, password, phone, role } = req.body;

        // 1. Check Database Connection
        if (mongoose.connection.readyState !== 1) {
            console.error('DB Status:', mongoose.connection.readyState);
            return res.status(500).json({
                message: 'Database connection is not ready. Please try again in a few seconds.',
                error: 'Mongoose connection state: ' + mongoose.connection.readyState
            });
        }

        // 2. Validate Inputs
        if (!email || !password || !name) {
            return res.status(400).json({ message: 'Please provide name, email and password' });
        }

        // Check if user already exists in MAIN User table
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Generate 6-digit verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Check if there is already a pending registration for this email
        const pendingUserExists = await PendingUser.findOne({ email });

        if (pendingUserExists) {
            // Update existing pending user
            pendingUserExists.name = name;
            pendingUserExists.password = password;
            pendingUserExists.phone = phone;
            pendingUserExists.role = role || 'author';
            pendingUserExists.verificationCode = verificationCode;
            pendingUserExists.createdAt = Date.now(); // Reset TTL
            await pendingUserExists.save();
        } else {
            // Create new pending user
            await PendingUser.create({
                name,
                email,
                password,
                phone,
                role: role || 'author',
                verificationCode
            });
        }

        // 3. Send Verification Email
        try {
            if (!process.env.EMAIL_PASS) {
                throw new Error('EMAIL_PASS (Brevo API Key) is not configured in environment variables.');
            }

            await sendEmail({
                email,
                subject: 'CIETM 2026 - Email Verification',
                message: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6366f1;">Welcome to CIETM 2026!</h2>
                        <p>Hello ${name},</p>
                        <p>Thank you for registering. Please verify your email to complete your account creation.</p>
                        <p>Your verification code is:</p>
                        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                            <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                        </div>
                        <p>This code will expire in 1 hour.</p>
                    </div>
                `
            });
            res.status(201).json({
                message: 'Verification code sent to your email. Please verify to complete registration.'
            });
        } catch (emailError) {
            console.error('Email send error:', emailError.message);
            return res.status(500).json({
                message: 'Account created but failed to send verification email. Please check your Brevo settings.',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Registration Error:', error.message);
        res.status(500).json({
            message: 'Internal server error during registration',
            error: error.message,
            stack: error.stack
        });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            if (!user.isEmailVerified) {
                return res.status(401).json({ message: 'Please verify your email first', isUnverified: true, email: user.email });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify email (Move from Pending -> User)
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;
        const pendingUser = await PendingUser.findOne({ email });

        if (!pendingUser) {
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already verified. Please login.' });
            }
            return res.status(400).json({ message: 'Invalid or expired verification session.' });
        }

        if (pendingUser.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await User.collection.insertOne({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password,
            phone: pendingUser.phone,
            role: pendingUser.role,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        const createdUser = await User.findOne({ email });
        await PendingUser.deleteOne({ _id: pendingUser._id });

        res.json({
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            phone: createdUser.phone,
            token: generateToken(createdUser._id),
            message: 'Email verified successfully'
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Resend verification code
const resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        const pendingUser = await PendingUser.findOne({ email });

        if (!pendingUser) {
            const user = await User.findOne({ email });
            if (user) return res.status(400).json({ message: 'User already verified.' });
            return res.status(404).json({ message: 'Pending registration not found' });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUser.verificationCode = verificationCode;
        pendingUser.createdAt = Date.now();
        await pendingUser.save();

        await sendEmail({
            email,
            subject: 'CIETM 2026 - New Verification Code',
            message: `<div style="font-family: Arial; padding: 20px;"><h2>Code: ${verificationCode}</h2></div>`
        });
        res.json({ message: 'New verification code sent' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send verification email', error: error.message });
    }
};

// @desc    Forgot Password
const forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const frontendBaseUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
        const frontendResetUrl = `${frontendBaseUrl.replace(/\/$/, '')}/reset-password/${resetToken}`;

        await sendEmail({
            email: user.email,
            subject: 'CIETM 2026 - Password Reset',
            message: `<div style="padding: 20px;"><a href="${frontendResetUrl}">Reset Password</a></div>`
        });

        res.status(200).json({ message: 'Email sent' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reset Password
const resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid token' });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password updated', token: generateToken(user._id) });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update Password
const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');
        if (!(await user.matchPassword(req.body.currentPassword))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        user.password = req.body.newPassword;
        await user.save();
        res.json({ message: 'Password updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    getUsers,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    updatePassword
};
