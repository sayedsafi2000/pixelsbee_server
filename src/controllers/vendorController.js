import bcrypt from 'bcryptjs';
import { getUserById, findUserByEmail } from '../models/userModel.js';
import { getProductsByVendor } from '../models/productModel.js';
import { getOrdersByVendor, updateOrderStatus } from '../models/orderModel.js';
import { addOrderProductsToDownloads } from './orderController.js';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasCapital) {
    return { isValid: false, message: 'Password must contain at least one capital letter' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

export const getProfile = async (req, res) => {
  const user = await getUserById(req.user.id);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, profile_pic_url: user.profile_pic_url });
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, profile_pic_url } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
    
    // Check if email is taken by another user
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== req.user.id) return res.status(409).json({ message: 'Email already in use' });
    
    // Update user profile
    const User = (await import('../models/userModel.js')).default;
    await User.findByIdAndUpdate(req.user.id, { name, email, profile_pic_url: profile_pic_url || null });
    
    res.json({ message: 'Profile updated' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    
    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ message: passwordValidation.message });
    }
    
    const user = await getUserById(req.user.id);
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(401).json({ message: 'Old password incorrect' });
    
    const hashed = await bcrypt.hash(newPassword, 10);
    
    // Update password
    const User = (await import('../models/userModel.js')).default;
    await User.findByIdAndUpdate(req.user.id, { password: hashed });
    
    res.json({ message: 'Password changed' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
};

export const getMyProducts = async (req, res) => {
  const products = await getProductsByVendor(req.user.id);
  res.json(products);
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await getOrdersByVendor(req.user.id);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

export const updateVendorOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Update order status
    const updatedOrder = await updateOrderStatus(orderId, status);
    
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If order is approved or delivered, add products to user downloads
    if (status === 'approved' || status === 'delivered') {
      try {
        await addOrderProductsToDownloads(orderId);
        console.log(`Products added to downloads for order ${orderId} with status ${status}`);
      } catch (downloadError) {
        console.error('Error adding products to downloads:', downloadError);
        // Don't fail the order status update if download addition fails
      }
    }

    res.json({ 
      message: 'Order status updated successfully', 
      order: updatedOrder,
      downloadsAdded: (status === 'approved' || status === 'delivered')
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
}; 