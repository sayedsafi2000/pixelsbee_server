import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdminDirect = async () => {
  try {
    console.log('🔐 Creating Admin User Directly in MongoDB...');
    console.log('=====================================');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Generate hashed password
    const password = "Safi@102030";
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user object
    const adminUser = {
      name: "Sayed Safi",
      email: "safiuddin102030@gmail.com",
      password: hashedPassword,
      role: "admin",
      status: "approved",
      profile_pic_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Check if user already exists
    const existingUser = await mongoose.connection.db.collection('users').findOne({ 
      email: adminUser.email 
    });
    
    if (existingUser) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Update the existing user's password
      await mongoose.connection.db.collection('users').updateOne(
        { email: adminUser.email },
        { 
          $set: { 
            password: hashedPassword,
            role: "admin",
            status: "approved",
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Admin user password updated successfully!');
    } else {
      // Insert new admin user
      await mongoose.connection.db.collection('users').insertOne(adminUser);
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('📧 Email: safiuddin102030@gmail.com');
    console.log('🔑 Password: Safi@102030');
    console.log('👤 Role: admin');
    console.log('');
    console.log('✨ You can now login as admin!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminDirect();
