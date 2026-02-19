const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    let transportConfig;

    // Configuration based on service
    const service = process.env.EMAIL_SERVICE?.toLowerCase();

    if (service === 'outlook' || service === 'outlook365' || service === 'hotmail') {
        transportConfig = {
            service: 'hotmail', // Most reliable preset for Microsoft accounts
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
        from: `"CIETM 2026" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

