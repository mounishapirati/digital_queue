const mongoose = require('mongoose');
require('dotenv').config();

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connection successful!');
    console.log('Database:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    console.log('Port:', mongoose.connection.port);
    
    await mongoose.connection.close();
    console.log('Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MongoDB is running');
    console.log('2. Check if MongoDB is installed');
    console.log('3. Verify the connection string in .env file');
    console.log('4. For local MongoDB: mongodb://localhost:27017/digital_queue');
    process.exit(1);
  }
};

testConnection();
