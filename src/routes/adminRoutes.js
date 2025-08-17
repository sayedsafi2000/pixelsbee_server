import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { 
  getVendors, 
  getAllUsers, 
  getDashboardStats,
  approveVendor, 
  approveUser,
  blockVendor, 
  blockUser, 
  unblockUser, 
  getAdminProducts,
  approveProductAction,
  rejectProductAction
} from '../controllers/adminController.js';

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// Vendor management
router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/block', blockVendor);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

// Products
router.get('/products', getAdminProducts);
router.put('/products/:id/approve', approveProductAction);
router.put('/products/:id/reject', rejectProductAction);

export default router; 