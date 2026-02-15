const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const listResources = async () => {
    try {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'conference_papers/',
            max_results: 5
        });
        fs.writeFileSync('resources_list.txt', JSON.stringify(result, null, 2));
        console.log('Resources list saved to resources_list.txt');
    } catch (e) {
        console.log('Error:', e.message);
    }
};

listResources();
