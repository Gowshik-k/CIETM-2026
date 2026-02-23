const axios = require('axios');

const sendEmail = async (options) => {
    try {
        if (!process.env.EMAIL_PASS) {
            throw new Error('EMAIL_PASS API key is missing');
        }

        // Clean sender email
        let senderEmail = "noreply@cietm.online";
        if (process.env.EMAIL_USER && process.env.EMAIL_USER.includes('@')) {
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
            timeout: 20000
        });

        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        const errorDetail = error.response?.data?.message || error.response?.data?.error || error.message;
        console.error('Email API Error:', errorDetail);
        throw new Error(`Email Service Error: ${errorDetail}`);
    }
};

module.exports = sendEmail;
