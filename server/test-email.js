const dotenv = require('dotenv');
const path = require('path');
const sendEmail = require('./utils/sendEmail');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const runTest = async () => {
    const testRecipient = process.argv[2] || process.env.ADMIN_EMAIL || 'gowsik.k.ciet@gmail.com';

    console.log('--- Brevo Email Test ---');
    console.log(`Service: ${process.env.EMAIL_SERVICE}`);
    console.log(`Host: ${process.env.EMAIL_HOST}`);
    console.log(`User: ${process.env.EMAIL_USER}`);
    console.log(`Recipient: ${testRecipient}`);
    console.log('------------------------');

    try {
        await sendEmail({
            email: testRecipient,
            subject: 'CIETM-2026: Brevo Test Email',
            message: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px;">
                    <h2 style="color: #4f46e5;">Connection Successful!</h2>
                    <p>This is a test email sent from the <strong>CIETM-2026</strong> development environment via <strong>Brevo SMTP</strong>.</p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                    <p style="font-size: 12px; color: #64748b;">
                        Sent at: ${new Date().toLocaleString()}
                    </p>
                </div>
            `
        });
        console.log('✅ Success! Email sent successfully.');
    } catch (error) {
        console.error('❌ Failed! Error sending email:');
        console.error(error);
        if (error.response) {
            console.error('Response:', error.response);
        }
    }
};

runTest();
