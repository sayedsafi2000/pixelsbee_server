import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { 
  create, 
  getByProduct, 
  getRating, 
  update, 
  remove, 
  getUserReview 
} from '../controllers/reviewController.js';

const router = express.Router();

// Test route to verify reviews routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Reviews routes are working!' });
});

// Public routes
router.get('/product/:productId', getByProduct); // Get all reviews for a product
router.get('/product/:productId/rating', getRating); // Get average rating

// Protected routes (require authentication)
router.use(authenticate);

router.post('/', create); // Create a new review
router.get('/user/:productId', getUserReview); // Get user's review for a product
router.put('/:id', update); // Update a review
router.delete('/:id', remove); // Delete a review

export default router;

