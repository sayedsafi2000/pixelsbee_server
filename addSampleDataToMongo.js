import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Set the MongoDB URI directly
const MONGODB_URI = 'mongodb+srv://safiuddin102030:102030@cluster100.yw68q.mongodb.net/pixelsbeeDB?retryWrites=true&w=majority&appName=Cluster100';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'vendor', 'admin'], default: 'user' },
  status: { type: String, enum: ['pending', 'approved', 'blocked'], default: 'pending' },
  profile_image: { type: String, default: null }
}, { timestamps: true });

// Product Schema
const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  category: { type: String, default: 'general' },
  image_url: { type: String, required: true },
  original_url: { type: String, default: null },
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'active', 'inactive', 'rejected', 'deleted'], default: 'active' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  approved_at: { type: Date, default: null },
  rejection_reason: { type: String, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

async function addSampleData() {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a vendor user
    const hashedPassword = await bcrypt.hash('vendor123', 10);
    
    let vendor = await User.findOne({ email: 'vendor@pixelsbee.com' });
    if (!vendor) {
      vendor = new User({
        name: 'Sample Vendor',
        email: 'vendor@pixelsbee.com',
        password: hashedPassword,
        role: 'vendor',
        status: 'approved'
      });
      await vendor.save();
      console.log('✅ Created vendor user');
    } else {
      console.log('✅ Vendor user already exists');
    }

    // Add sample products
    const sampleProducts = [
      {
        title: 'Beautiful Landscape Photography',
        description: 'Stunning landscape photography with mountains and lakes',
        price: 29.99,
        category: 'landscape',
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Urban Street Photography',
        description: 'Modern urban street photography capturing city life',
        price: 19.99,
        category: 'urban',
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Portrait Photography Collection',
        description: 'Professional portrait photography for business and personal use',
        price: 39.99,
        category: 'portrait',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Nature Wildlife Photography',
        description: 'Amazing wildlife photography from around the world',
        price: 49.99,
        category: 'wildlife',
        image_url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Abstract Digital Art',
        description: 'Modern abstract digital art with vibrant colors',
        price: 25.99,
        category: 'abstract',
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Vintage Photography Style',
        description: 'Classic vintage photography with retro aesthetics',
        price: 35.99,
        category: 'vintage',
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      },
      {
        title: 'Free Sample Image',
        description: 'A free sample image for testing downloads',
        price: 0,
        category: 'free',
        image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=500&fit=crop',
        original_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop',
        vendor_id: vendor._id,
        status: 'active'
      }
    ];

    // Check if products already exist
    const existingProducts = await Product.find({ vendor_id: vendor._id });
    if (existingProducts.length === 0) {
      for (const productData of sampleProducts) {
        const product = new Product(productData);
        await product.save();
      }
      console.log(`✅ Added ${sampleProducts.length} sample products`);
    } else {
      console.log(`✅ ${existingProducts.length} products already exist`);
    }

    // Display summary
    const totalProducts = await Product.countDocuments({ status: 'active' });
    console.log(`\n📊 Database Summary:`);
    console.log(`Total active products: ${totalProducts}`);
    console.log(`Vendor email: vendor@pixelsbee.com`);
    console.log(`Vendor password: vendor123`);

  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

addSampleData();
