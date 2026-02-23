const axios = require('axios');

const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_PASS) {
            throw new Error('EMAIL_PASS API key is missing');
        }

        // Clean sender email
        // Brevo requires a verified sender email address, not an SMTP username
        let senderEmail = "noreply@cietm.online";

        // If EMAIL_FROM is available, try to extract the email part
        if (process.env.EMAIL_FROM) {
            const match = process.env.EMAIL_FROM.match(/<(.+)>/);
            if (match && match[1]) {
                senderEmail = match[1];
            } else if (process.env.EMAIL_FROM.includes('@')) {
                senderEmail = process.env.EMAIL_FROM;
            }
        } else if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@') && !process.env.EMAIL_USER.includes('smtp-brevo.com')) {
            senderEmail = process.env.EMAIL_USER;
        }

        await axios.post('https://api.brevo.com/v3/smtp/email', {
            sender: { name: "CIETM 2026", email: senderEmail },
            to: [{ email: options.email }],
            subject: options.subject,
            htmlContent: options.message
        }, {
            headers: {
                'api-key': process.env.EMAIL_PASS,
                'content-type': 'application/json',
                'accept': 'application/json'
            },
            timeout: 25000
        });

        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        const errorDetail = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('Email API Error:', errorDetail);
        throw new Error(`Email Service Error: ${errorDetail}`);
    }
};

module.exports = sendEmail;
