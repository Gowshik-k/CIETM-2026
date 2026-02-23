const brevo = require('@getbrevo/brevo');

const sendEmail = async (options) => {
    // Determine which service is being used. If no API key, check if we need to throw error.
    if (!process.env.BREVO_API_KEY) {
        console.warn("\n⚠️ WARNING: BREVO_API_KEY is not set in your .env file!");
        throw new Error('Email Service Error: BREVO_API_KEY is missing');
    }

    let defaultClient = brevo.ApiClient.instance;
    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    let apiInstance = new brevo.TransactionalEmailsApi();
    let sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = options.subject;
    sendSmtpEmail.htmlContent = options.message;
    // Fallback if EMAIL_USER wasn't set, default to a sensible noreply
    sendSmtpEmail.sender = { "name": "CIETM 2026", "email": process.env.EMAIL_USER || "noreply@cietm.online" };
    sendSmtpEmail.to = [
        { "email": options.email, "name": options.email.split('@')[0] }
    ];

    console.log('--- Sending Email via Brevo REST API ---');
    console.log('To:', options.email);

    try {
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log('✅ Brevo API called successfully. Message ID:', data.messageId);
    } catch (error) {
        console.error('❌ Brevo API Error:', error.response?.text || error.message);
        throw error;
    }
};

module.exports = sendEmail;
