const axios = require('axios');

async function testRegister() {
    try {
        console.log('Sending registration request to Production...');
        const response = await axios.post('https://cietm-2026-production.up.railway.app/api/auth/register', {
            name: 'Test Prod User',
            email: 'gowsik.k.ciet+prodtest1@gmail.com',
            password: 'password123',
            phone: '1234567890'
        });
        console.log('Success:', response.status);
        console.log('Data:', response.data);
    } catch (error) {
        console.error('Error status:', error.response?.status);
        console.error('Error data:', error.response?.data);
        console.error('Error message:', error.message);
    }
}

testRegister();
