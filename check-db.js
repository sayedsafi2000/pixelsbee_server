import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const checkDatabase = async () => {
  try {
    console.log('🔍 Checking MongoDB Database...');
    console.log('=====================================');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name));
    
    if (collections.some(c => c.name === 'users')) {
      // Check users collection
      const users = await mongoose.connection.db.collection('users').find({}).toArray();
      console.log(`\n👥 Users in database: ${users.length}`);
      
      if (users.length > 0) {
        users.forEach((user, index) => {
          console.log(`\n--- User ${index + 1} ---`);
          console.log(`Name: ${user.name}`);
          console.log(`Email: ${user.email}`);
          console.log(`Role: ${user.role}`);
          console.log(`Status: ${user.status}`);
          console.log(`Password hash: ${user.password ? '✅ Set' : '❌ Missing'}`);
          console.log(`Created: ${user.created_at}`);
        });
      } else {
        console.log('❌ No users found in database');
      }
    } else {
      console.log('❌ Users collection does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

checkDatabase();
