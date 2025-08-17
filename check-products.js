import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const checkProducts = async () => {
  try {
    console.log('🔍 Checking Products in Database...');
    console.log('=====================================');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Check if products collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📚 Collections found:', collections.map(c => c.name));
    
    if (collections.some(c => c.name === 'products')) {
      // Check products collection
      const products = await mongoose.connection.db.collection('products').find({}).toArray();
      console.log(`\n📦 Products in database: ${products.length}`);
      
      if (products.length > 0) {
        products.forEach((product, index) => {
          console.log(`\n--- Product ${index + 1} ---`);
          console.log(`ID: ${product._id}`);
          console.log(`Title: ${product.title}`);
          console.log(`Price: $${product.price}`);
          console.log(`Status: ${product.status}`);
          console.log(`Vendor ID: ${product.vendor_id}`);
          console.log(`Created: ${product.createdAt}`);
          console.log(`Approved by: ${product.approved_by || 'Not approved'}`);
        });
        
        // Count by status
        const statusCounts = {};
        products.forEach(product => {
          statusCounts[product.status] = (statusCounts[product.status] || 0) + 1;
        });
        
        console.log('\n📊 Status Summary:');
        Object.entries(statusCounts).forEach(([status, count]) => {
          console.log(`${status}: ${count} products`);
        });
      } else {
        console.log('❌ No products found in database');
      }
    } else {
      console.log('❌ Products collection does not exist');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking products:', error);
    process.exit(1);
  }
};

checkProducts();
