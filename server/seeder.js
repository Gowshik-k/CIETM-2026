const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();

        const adminUser = {
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'adminpassword123', // This will be hashed by the User model pre-save hook
            role: 'admin',
            phone: '1234567890',
            isEmailVerified: true
        };

        await User.create(adminUser);

        console.log('Admin User Created Successfully!');
        console.log('Email: admin@example.com');
        console.log('Password: adminpassword123');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await User.deleteMany();
        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
