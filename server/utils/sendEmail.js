const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transportConfig;

    const service = process.env.EMAIL_SERVICE?.toLowerCase();

    if (service === 'brevo' || process.env.EMAIL_HOST) {
        // Brevo or Custom SMTP
        transportConfig = {
            host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports (587)
            requireTLS: true, // Force TLS to prevent timeout
            connectionTimeout: 10000,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        };
    } else if (service === 'outlook' || service === 'outlook365' || service === 'hotmail') {
        transportConfig = {
            service: 'hotmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        };
    } else {
        // Default for Gmail and others
        transportConfig = {
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        };
    }

    const transporter = nodemailer.createTransport(transportConfig);

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"CIETM 2026" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    console.log('--- Sending Email ---');
    console.log('Service:', process.env.EMAIL_SERVICE);
    console.log('Host:', process.env.EMAIL_HOST);
    console.log('From:', mailOptions.from);
    console.log('To:', mailOptions.to);

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Nodemailer Error:', error);
        throw error;
    }
};

module.exports = sendEmail;

