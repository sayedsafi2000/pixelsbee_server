import express from 'express';
import { create, analytics } from '../controllers/orderController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, create); // Create order (after payment)
router.get('/analytics', authenticate, analytics); // Admin analytics

export default router;