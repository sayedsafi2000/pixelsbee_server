import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { getUserById, getUserStats } from '../models/userModel.js';
import { updateProfile, changePassword } from '../controllers/vendorController.js';
import { 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  checkFavorite,
  getDownloads,
  addDownload,
  getPurchasedProducts
} from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', async (req, res) => {
  const user = await getUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, profile_pic_url: user.profile_pic_url });
});

router.put('/profile', updateProfile);

// Password change endpoint
router.post('/change-password', changePassword);

// Stats endpoints
router.get('/stats', async (req, res) => {
  try {
    const stats = await getUserStats(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ message: 'Failed to fetch user stats' });
  }
});

// Favorites routes
router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:imageId', removeFavorite);
router.get('/favorites/:imageId/check', checkFavorite);

// Downloads routes
router.get('/downloads', getDownloads);
router.post('/downloads', addDownload);

// Purchased products route
router.get('/purchased', getPurchasedProducts);

// Cart routes - using the functions from userModel
router.get('/cart', async (req, res) => {
  try {
    const { getUserCart } = await import('../models/userModel.js');
    const cart = await getUserCart(req.user.id);
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
});

router.post('/cart/add', async (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) return res.status(400).json({ message: 'Product ID required' });
  try {
    const { addToCart } = await import('../models/userModel.js');
    await addToCart(req.user.id, productId, quantity || 1);
    res.json({ message: 'Added to cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

router.post('/cart/remove', async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'Product ID required' });
  try {
    const { removeFromCart } = await import('../models/userModel.js');
    await removeFromCart(req.user.id, productId);
    res.json({ message: 'Removed from cart' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
});

router.post('/cart/clear', async (req, res) => {
  try {
    const { clearCart } = await import('../models/userModel.js');
    await clearCart(req.user.id);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart' });
  }
});

export default router; 