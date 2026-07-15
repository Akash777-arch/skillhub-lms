const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    
    if (uri) {
      const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`MongoDB Connected (Atlas/Local): ${conn.connection.host}`);
      return false;
    }

    console.log(`No MONGO_URI provided. Starting persistent Local MongoDB...`);
    
    const dbPath = path.join(__dirname, '..', 'data', 'db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }

    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbPath,
        dbName: 'skillhub'
      }
    });

    const localUri = `mongodb://127.0.0.1:27017/skillhub`;
    const conn = await mongoose.connect(localUri);
    console.log(`MongoDB Connected (Local Node Managed): ${conn.connection.host}`);
    return true; // Used to trigger seeding if needed
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1); 
  }
};

module.exports = connectDB;
