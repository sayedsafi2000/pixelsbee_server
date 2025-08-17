import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const createAdminData = async () => {
  try {
    // Generate hashed password for "Safi@102030"
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
      created_at: new Date(),
      updated_at: new Date()
    };
    
    console.log('🔐 Admin User Data for MongoDB:');
    console.log('=====================================');
    console.log('Copy this JSON and paste it into your MongoDB users collection:');
    console.log('');
    console.log(JSON.stringify(adminUser, null, 2));
    console.log('');
    console.log('📝 Instructions:');
    console.log('1. Go to MongoDB Atlas');
    console.log('2. Navigate to pixelsbeeDB > users collection');
    console.log('3. Click "Insert Document"');
    console.log('4. Paste the JSON above');
    console.log('5. Click "Insert"');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('Email: safiuddin102030@gmail.com');
    console.log('Password: Safi@102030');
    console.log('');
    console.log('✨ You can now login as admin!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin data:', error);
    process.exit(1);
  }
};

createAdminData();
