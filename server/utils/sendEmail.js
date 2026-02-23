const { BrevoClient } = require('@getbrevo/brevo');

const sendEmail = async (options) => {
    if (!process.env.BREVO_API_KEY) {
        console.warn("\n⚠️ WARNING: BREVO_API_KEY is not set in your .env file!");
        throw new Error('Email Service Error: BREVO_API_KEY is missing');
    }

    const brevo = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY,
    });

    console.log('--- Sending Email via Brevo REST API ---');
    console.log('To:', options.email);

    try {
        const result = await brevo.transactionalEmails.sendTransacEmail({
            subject: options.subject,
            htmlContent: options.message,
            sender: { name: "CIETM 2026", email: process.env.EMAIL_USER || "noreply@cietm.online" },
            to: [{ email: options.email, name: options.email.split('@')[0] }]
        });
        
        console.log('✅ Brevo API called successfully. Message ID:', result?.messageId || 'Success');
    } catch (error) {
        const errorDetails = error.body ? JSON.stringify(error.body) : error.message;
        console.error('❌ Brevo API Error:', errorDetails);
        throw new Error('Email Service Error: ' + errorDetails);
    }
};

module.exports = sendEmail;
