import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Testing .env file loading...');
console.log('=====================================');

// Try to load .env
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.error('❌ Error loading .env file:', result.error);
} else {
  console.log('✅ .env file loaded successfully');
}

console.log('📁 Current directory:', __dirname);
console.log('📄 .env file path:', path.join(__dirname, '.env'));

// Check environment variables
console.log('\n🔑 Environment Variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Not set');
console.log('PORT:', process.env.PORT || '❌ Not set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set (' + process.env.JWT_SECRET.length + ' chars)' : '❌ Not set');

if (process.env.JWT_SECRET) {
  console.log('JWT_SECRET preview:', process.env.JWT_SECRET.substring(0, 20) + '...');
}
