const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, default: 'author' },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour (3600s)
});

// Encrypt password before saving (same as User model)
pendingUserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('PendingUser', pendingUserSchema);
