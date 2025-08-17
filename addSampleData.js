import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// First create a connection without database to create the database
const createDbPool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'pixelsbee_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function addSampleData() {
  try {
    // Create database if it doesn't exist
    try {
      await createDbPool.query('CREATE DATABASE IF NOT EXISTS pixelsbee_db');
      console.log('Database created or already exists');
    } catch (error) {
      console.error('Error creating database:', error);
    }
    
    // First, let's create a vendor user
    const hashedPassword = await bcrypt.hash('vendor123', 10);
    
    // Insert a vendor user
    const [vendorResult] = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=id',
      ['Sample Vendor', 'vendor@pixelsbee.com', hashedPassword, 'vendor', 'approved']
    );
    
    let vendorId;
    if (vendorResult.insertId) {
      vendorId = vendorResult.insertId;
    } else {
      // If user already exists, get their ID
      const [existingVendor] = await pool.query('SELECT id FROM users WHERE email = ?', ['vendor@pixelsbee.com']);
      vendorId = existingVendor[0].id;
    }
    
    // Add sample products
    const sampleProducts = [
      {
        title: 'Beautiful Landscape Photography',
        description: 'Stunning landscape photography with mountains and lakes',
        price: 29.99,
        image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=500&fit=crop'
      },
      {
        title: 'Urban Street Photography',
        description: 'Modern urban street photography capturing city life',
        price: 19.99,
        image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=500&fit=crop'
      },
      {
        title: 'Portrait Photography Collection',
        description: 'Professional portrait photography for business and personal use',
        price: 39.99,
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop'
      },
      {
        title: 'Nature Wildlife Photography',
        description: 'Amazing wildlife photography from around the world',
        price: 49.99,
        image_url: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=500&h=500&fit=crop'
      },
      {
        title: 'Abstract Digital Art',
        description: 'Modern abstract digital art with vibrant colors',
        price: 25.99,
        image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=500&fit=crop'
      },
      {
        title: 'Vintage Photography Style',
        description: 'Classic vintage photography with retro aesthetics',
        price: 35.99,
        image_url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500&h=500&fit=crop'
      }
    ];
    
    for (const product of sampleProducts) {
      await pool.query(
        'INSERT INTO products (vendor_id, title, description, price, image_url) VALUES (?, ?, ?, ?, ?)',
        [vendorId, product.title, product.description, product.price, product.image_url]
      );
    }
    
    console.log('Sample data added successfully!');
    console.log('Vendor email: vendor@pixelsbee.com');
    console.log('Vendor password: vendor123');
    console.log('Added', sampleProducts.length, 'sample products');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await pool.end();
  }
}

addSampleData(); 