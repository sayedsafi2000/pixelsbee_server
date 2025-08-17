import cloudinary from '../config/cloudinary.js';
import { createProduct, updateProduct, deleteProduct, getProductsByVendor, getAllProducts, getProductById, getCategories } from '../models/productModel.js';

export const uploadImage = async (req, res) => {
  console.log('Upload endpoint hit');
  console.log('File:', req.file);
  console.log('User:', req.user);
  
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  try {
    // Convert buffer to base64 string
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    console.log('Uploading to Cloudinary...');
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'pixelsbee',
      resource_type: 'auto'
    });
    
    console.log('Upload successful:', result.secure_url);
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

export const create = async (req, res) => {
  try {
    const { title, description, price, category, image_url, original_url } = req.body;
    const vendor_id = req.user.id;
    
    if (!title || !description || !price || !category || !image_url || !original_url) {
      return res.status(400).json({ message: 'All fields are required including both image URLs' });
    }
    
    const product = await createProduct({
      vendor_id,
      title,
      description,
      price,
      category,
      image_url,
      original_url
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

export const update = async (req, res) => {
  const { id } = req.params;
  const product = await getProductById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.vendor_id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await updateProduct(id, req.body);
  res.json({ message: 'Product updated' });
};

export const remove = async (req, res) => {
  const { id } = req.params;
  const product = await getProductById(id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.vendor_id.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  await deleteProduct(id);
  res.json({ message: 'Product deleted' });
};

export const listByVendor = async (req, res) => {
  const vendor_id = req.user.id;
  const products = await getProductsByVendor(vendor_id);
  res.json(products);
};

export const listAll = async (req, res) => {
  console.log('listAll endpoint called'); // Debug log
  const result = await getAllProducts();
  console.log('Products returned from getAllProducts:', result); // Debug log
  
  // Return just the products array, not the full object
  const products = result.products || result;
  console.log('Products with status:', products.map(p => ({ id: p._id, title: p.title, status: p.status }))); // Debug log
  res.json(products);
};

export const search = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: 'Search query required' });
  const result = await getAllProducts({ search: q });
  const products = result.products || result;
  res.json(products);
};

export const fetchCategories = async (req, res) => {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
}; 

export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
}; 