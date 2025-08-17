import express from 'express';
import multer from 'multer';
import fetch from 'node-fetch';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { uploadImage, create, update, remove, listByVendor, listAll, search, fetchCategories, getProduct } from '../controllers/productController.js';
import { getProductById } from '../models/productModel.js';

const router = express.Router();
const upload = multer();

// Public: list all products
router.get('/', listAll);

// Public: search products
router.get('/search', search);

// Public: get all categories
router.get('/categories', fetchCategories);

// Vendor: list own products
router.get('/my', authenticate, authorizeRoles('vendor'), listByVendor);

// Vendor: upload image to Cloudinary
router.post('/upload', authenticate, authorizeRoles('vendor'), upload.single('image'), uploadImage);

// Vendor: create product
router.post('/', authenticate, authorizeRoles('vendor'), create);

// Vendor/Admin: update product
router.put('/:id', authenticate, authorizeRoles('vendor', 'admin'), update);

// Vendor/Admin: delete product
router.delete('/:id', authenticate, authorizeRoles('vendor', 'admin'), remove);

// Secure download endpoint
router.get('/:id/download', authenticate, async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user.id;
    
    // Get product details
    const product = await getProductById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Check if product is free
    if (product.price <= 0) {
      // Free product - allow download
      const downloadUrl = product.original_url || product.image_url;
      
      // For now, just return the download URL in the response
      // The client will handle the actual download
      res.json({ 
        downloadUrl,
        filename: `${product.title.replace(/\s+/g, '_')}.jpg`,
        message: 'Free download available'
      });
    } else {
      // For paid products, check if user has purchased
      // TODO: Implement purchase verification logic here
      // For now, we'll block all paid downloads until purchase system is implemented
      return res.status(403).json({ message: 'You must purchase this product to download the original image.' });
    }
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed' });
  }
});

export default router; 