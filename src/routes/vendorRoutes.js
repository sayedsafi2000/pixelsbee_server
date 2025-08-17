import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { getProfile, updateProfile, changePassword, getMyProducts, getMyOrders, updateVendorOrderStatus } from '../controllers/vendorController.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('vendor'));

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.get('/products', getMyProducts);
router.get('/orders', getMyOrders);
router.put('/orders/:orderId/status', updateVendorOrderStatus);

export default router; 