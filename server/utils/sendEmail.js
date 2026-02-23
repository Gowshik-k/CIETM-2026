const axios = require('axios');
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const isBrevo = process.env.EMAIL_SERVICE?.toLowerCase() === 'brevo' ||
        process.env.EMAIL_PASS?.startsWith('xsmtpsib');

    if (isBrevo) {
        console.log('Attempting to send email via Brevo API...');
        try {
            // Extract email from "Name <email@example.com>" or just "email@example.com"
            let senderEmail = process.env.EMAIL_USER;
            if (process.env.EMAIL_FROM) {
                const match = process.env.EMAIL_FROM.match(/<(.+)>/);
                senderEmail = match ? match[1] : process.env.EMAIL_FROM;
            }

            // Clean sender email (remove quotes etc)
            senderEmail = senderEmail.replace(/['"]/g, '').trim();

            const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
                sender: {
                    name: "CIETM 2026",
                    email: senderEmail.includes('@') ? senderEmail : "noreply@cietm.online"
                },
                to: [{ email: options.email }],
                subject: options.subject,
                htmlContent: options.message
            }, {
                headers: {
                    'api-key': process.env.EMAIL_PASS,
                    'content-type': 'application/json',
                    'accept': 'application/json'
                },
                timeout: 15000 // 15 seconds
            });

            console.log(`Email sent via Brevo API successfully to ${options.email}`);
            return response.data;
        } catch (error) {
            const apiError = error.response?.data?.message || error.response?.data?.error || error.message;
            console.error('Brevo API Error:', apiError);
            // If API fails, we'll fall through to SMTP as backup
            console.log('Falling back to SMTP...');
        }
    }

    // SMTP Fallback
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 20000,
        socketTimeout: 20000,
    });

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"CIETM 2026" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent via SMTP successfully to ${options.email}`);
    } catch (error) {
        console.error(`SMTP Error: ${error.message}`);
        throw new Error(`Email sending failed: ${error.message}`);
    }
};

module.exports = sendEmail;
