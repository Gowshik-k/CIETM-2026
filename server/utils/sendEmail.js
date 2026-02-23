const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Brevo / SendinBlue configuration
    const transporter = nodemailer.createTransport({
        service: 'Brevo',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        // Increase timeout for slow network handshakes
        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 45000,
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"CIETM 2026" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        console.error(`Nodemailer Error: ${error.message}`);
        throw error;
    }
};

module.exports = sendEmail;
