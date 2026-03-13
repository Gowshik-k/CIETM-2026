const dotenv = require('dotenv');
dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function checkIndices() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    
    const indices = await mongoose.connection.db.collection('registrations').indexes();
    console.log('Indices on registrations collection:', JSON.stringify(indices, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkIndices();
