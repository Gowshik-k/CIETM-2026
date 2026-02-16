const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user (Create PendingUser)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, phone, role } = req.body;

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
        // Note: PendingUser model has a pre-save hook that hashes the password
        pendingUserExists.name = name;
        pendingUserExists.password = password;
        pendingUserExists.phone = phone;
        pendingUserExists.role = role || 'author';
        pendingUserExists.verificationCode = verificationCode;
        pendingUserExists.createdAt = Date.now(); // Reset TTL
        await pendingUserExists.save();
    } else {
        // Create new pending user
        // Note: Password will be hashed by PendingUser pre-save hook
        await PendingUser.create({
            name,
            email,
            password,
            phone,
            role: role || 'author',
            verificationCode
        });
    }

    // Send verification email
    const nodemailer = require('nodemailer');

    // Create transporter (you'll need to configure this with your email service)
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'CIETM 2026 - Email Verification',
        html: `
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
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(201).json({
            message: 'Verification code sent to your email. Please verify to complete registration.'
        });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
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
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
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
};

// @desc    Verify email (Move from Pending -> User)
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Check PendingUser first
        const pendingUser = await PendingUser.findOne({ email });

        if (!pendingUser) {
            // Check if already verified in main User table
            const user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User already verified. Please login.' });
            }
            return res.status(400).json({ message: 'Invalid or expired verification session.' });
        }

        if (pendingUser.verificationCode !== code) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        // Create actual User from PendingUser data
        // We use insertOne to bypass Mongoose hooks because the password IS ALREADY HASHED in pendingUser
        await User.collection.insertOne({
            name: pendingUser.name,
            email: pendingUser.email,
            password: pendingUser.password, // Already hashed
            phone: pendingUser.phone,
            role: pendingUser.role,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            __v: 0
        });

        const createdUser = await User.findOne({ email });

        // Delete pending record
        await PendingUser.deleteOne({ _id: pendingUser._id });

        res.json({
            _id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: createdUser.role,
            isEmailVerified: createdUser.isEmailVerified,
            token: generateToken(createdUser._id),
            message: 'Email verified successfully'
        });
    } catch (error) {
        console.error('Error in verifyEmail:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

// @desc    Resend verification code
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = async (req, res) => {
    const { email } = req.body;

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
        // If already verified user tries to resend?
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already verified.' });
        }
        return res.status(404).json({ message: 'Pending registration not found' });
    }

    // Generate new code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    pendingUser.verificationCode = verificationCode;
    pendingUser.createdAt = Date.now(); // Reset TTL
    await pendingUser.save();

    // Send email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'CIETM 2026 - New Verification Code',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #6366f1;">New Verification Code</h2>
                <p>Hello ${pendingUser.name},</p>
                <p>Here is your new verification code:</p>
                <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
                    <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 8px; margin: 0;">${verificationCode}</h1>
                </div>
                <p>This code will expire in 1 hour.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: 'New verification code sent to your email' });
    } catch (error) {
        console.error('Email send error:', error);
        res.status(500).json({ message: 'Failed to send verification email' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    verifyEmail,
    resendVerification
};
