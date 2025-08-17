import { listVendors, updateUserStatus, restoreUserStatus, getUserById, getAllUsers as getAllUsersModel, getUserStats, getPlatformStats } from '../models/userModel.js';
import { getAllProducts, approveProduct, rejectProduct } from '../models/productModel.js';

// Get all vendors with their status
export const getVendors = async (req, res) => {
  try {
    const vendors = await listVendors();
    res.json(vendors);
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: 'Error fetching vendors' });
  }
};

// Get all users (for admin management)
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersModel();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const stats = await getPlatformStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};

// Approve vendor
export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid vendor ID' });
    }
    
    const vendor = await getUserById(id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    await updateUserStatus(id, 'approved');
    res.json({ message: 'Vendor approved successfully' });
  } catch (error) {
    console.error('Error approving vendor:', error);
    res.status(500).json({ message: 'Error approving vendor' });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Approving user with ID:', id); // Debug log
    
    const user = await getUserById(id);
    if (!user) {
      console.log('User not found for ID:', id); // Debug log
      return res.status(404).json({ message: 'User not found' });
    }
    
    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role,
      status: user.status
    }); // Debug log
    
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users' });
    }
    
    const updatedUser = await updateUserStatus(id, 'approved');
    console.log('User updated:', {
      id: updatedUser._id,
      email: updatedUser.email,
      status: updatedUser.status
    }); // Debug log
    
    res.json({ message: 'User approved successfully' });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ message: 'Error approving user' });
  }
};

// Block vendor
export const blockVendor = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    if (!id || id === 'undefined') {
      return res.status(400).json({ message: 'Invalid vendor ID' });
    }
    
    const vendor = await getUserById(id);
    if (!vendor || vendor.role !== 'vendor') {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    await updateUserStatus(id, 'blocked');
    res.json({ message: 'Vendor blocked successfully' });
  } catch (error) {
    console.error('Error blocking vendor:', error);
    res.status(500).json({ message: 'Error blocking vendor' });
  }
};

// Block any user
export const blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot block admin users' });
    }
    await updateUserStatus(id, 'blocked');
    res.json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Error blocking user' });
  }
};

// Unblock user
export const unblockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot modify admin users' });
    }
    
    // Restore to previous status (approved or pending)
    const restoredUser = await restoreUserStatus(id);
    if (!restoredUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      message: `User unblocked successfully. Status restored to: ${restoredUser.status}`,
      user: restoredUser
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Error unblocking user' });
  }
};

// Get all products
export const getAdminProducts = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : { status: { $ne: 'deleted' } };
    const products = await getAllProducts(filters);
    res.json(products.products || products); // Handle both paginated and non-paginated responses
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

// Approve product
export const approveProductAction = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const product = await approveProduct(id, adminId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product approved successfully', product });
  } catch (error) {
    console.error('Error approving product:', error);
    res.status(500).json({ message: 'Error approving product' });
  }
};

// Reject product
export const rejectProductAction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user.id;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const product = await rejectProduct(id, adminId, reason);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ message: 'Product rejected successfully', product });
  } catch (error) {
    console.error('Error rejecting product:', error);
    res.status(500).json({ message: 'Error rejecting product' });
  }
}; 