const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendEmail = async (options) => {
    try {
        const defaultClient = SibApiV3Sdk.ApiClient.instance;
        const apiKey = defaultClient.authentications['api-key'];

        if (!process.env.EMAIL_PASS) {
            throw new Error('EMAIL_PASS API key is missing');
        }

        apiKey.apiKey = process.env.EMAIL_PASS;

        const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        let senderEmail = "noreply@cietm.online";
        if (process.env.EMAIL_FROM) {
            const match = process.env.EMAIL_FROM.match(/<(.+)>/);
            if (match && match[1]) {
                senderEmail = match[1];
            } else if (process.env.EMAIL_FROM.includes('@')) {
                senderEmail = process.env.EMAIL_FROM;
            }
        }

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        sendSmtpEmail.subject = options.subject;
        sendSmtpEmail.htmlContent = options.message;
        sendSmtpEmail.sender = { name: "CIETM 2026", email: senderEmail };
        sendSmtpEmail.to = [{ email: options.email }];

        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent successfully to ${options.email}`);
    } catch (error) {
        // Log detailed error from SDK
        const errorDetail = error.response?.body?.message || error.message;
        console.error('Brevo SDK Error:', errorDetail);
        throw new Error(`Email Service Error: ${errorDetail}`);
    }
};

module.exports = sendEmail;
