import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: 'pending'
  },
  previous_status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: null
  },
  profile_pic_url: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

// Platform stats for admin dashboard
export const getPlatformStats = async () => {
  try {
    // Get total users count
    const totalUsers = await User.countDocuments({ role: 'user' });
    
    // Get total vendors count
    const totalVendors = await User.countDocuments({ role: 'vendor' });
    
    // Get total products count
    const totalProducts = await mongoose.model('Product').countDocuments({ status: 'active' });
    
    // Get total revenue (placeholder for now)
    const totalRevenue = 0;
    
    return {
      totalUsers,
      totalVendors,
      totalProducts,
      totalRevenue
    };
  } catch (error) {
    console.error('Error getting platform stats:', error);
    return {
      totalUsers: 0,
      totalVendors: 0,
      totalProducts: 0,
      totalRevenue: 0
    };
  }
};

// User Model Functions
export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const createUser = async (user) => {
  const newUser = new User(user);
  return await newUser.save();
};

export const getUserById = async (id) => {
  return await User.findById(id);
};

export const updateUserStatus = async (id, status) => {
  const user = await User.findById(id);
  if (!user) return null;
  
  // Store the current status as previous_status before updating
  const updateData = {
    status,
    previous_status: user.status
  };
  
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};

export const restoreUserStatus = async (id) => {
  const user = await User.findById(id);
  if (!user) return null;
  
  // Restore to previous status, or default to 'pending' if no previous status
  const newStatus = user.previous_status || 'pending';
  
  return await User.findByIdAndUpdate(id, { 
    status: newStatus,
    previous_status: null // Clear previous status after restoration
  }, { new: true });
};

export const listVendors = async () => {
  return await User.find({ role: 'vendor' }).sort({ createdAt: -1 });
};

export const getAllUsers = async () => {
  return await User.find().sort({ createdAt: -1 });
};

export const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return {
        downloads: 0,
        favorites: 0,
        memberSince: 'Unknown'
      };
    }

    // Get download count
    const downloadCount = await mongoose.model('UserDownload').countDocuments({ user_id: userId });

    // Get favorites count
    const favoritesCount = await mongoose.model('UserFavorite').countDocuments({ user_id: userId });

    return {
      downloads: downloadCount,
      favorites: favoritesCount,
      memberSince: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'Unknown'
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      downloads: 0,
      favorites: 0,
      memberSince: 'Unknown'
    };
  }
};

// Favorites functions
export const getUserFavorites = async (userId) => {
  try {
    const favorites = await mongoose.model('UserFavorite').find({ user_id: userId }).sort({ createdAt: -1 });
    return favorites.map(fav => ({
      ...fav.toObject(),
      image_data: fav.image_data || null
    }));
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return [];
  }
};

export const addToFavorites = async (userId, imageId, imageData) => {
  try {
    const existingFavorite = await mongoose.model('UserFavorite').findOne({ 
      user_id: userId, 
      image_id: imageId 
    });
    
    if (existingFavorite) {
      return; // Already favorited
    }
    
    const newFavorite = new mongoose.model('UserFavorite')({
      user_id: userId,
      image_id: imageId,
      image_data: imageData
    });
    
    return await newFavorite.save();
  } catch (error) {
    console.error('Error adding to favorites:', error);
    throw error;
  }
};

export const removeFromFavorites = async (userId, imageId) => {
  try {
    return await mongoose.model('UserFavorite').findOneAndDelete({ 
      user_id: userId, 
      image_id: imageId 
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    throw error;
  }
};

// Downloads functions
export const getUserDownloads = async (userId) => {
  try {
    const downloads = await mongoose.model('UserDownload').find({ user_id: userId }).sort({ downloaded_at: -1 });
    return downloads.map(download => ({
      ...download.toObject(),
      image_data: download.image_data || null
    }));
  } catch (error) {
    console.error('Error fetching user downloads:', error);
    return [];
  }
};

export const addToDownloads = async (userId, imageId, imageData) => {
  try {
    const existingDownload = await mongoose.model('UserDownload').findOne({ 
      user_id: userId, 
      image_id: imageId 
    });
    
    if (existingDownload) {
      return; // Already downloaded
    }
    
    const newDownload = new mongoose.model('UserDownload')({
      user_id: userId,
      image_id: imageId,
      image_data: imageData
    });
    
    return await newDownload.save();
  } catch (error) {
    console.error('Error adding to downloads:', error);
    throw error;
  }
};

// Cart functions
export const getUserCart = async (userId) => {
  try {
    const cartItems = await mongoose.model('UserCart').find({ user_id: userId })
      .populate('product_id')
      .sort({ added_at: -1 });
    return cartItems;
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return [];
  }
};

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    const existingCartItem = await mongoose.model('UserCart').findOne({ 
      user_id: userId, 
      product_id: productId 
    });
    
    if (existingCartItem) {
      // Update quantity if already in cart
      existingCartItem.quantity += quantity;
      return await existingCartItem.save();
    }
    
    const newCartItem = new mongoose.model('UserCart')({
      user_id: userId,
      product_id: productId,
      quantity
    });
    
    return await newCartItem.save();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    return await mongoose.model('UserCart').findOneAndDelete({ 
      user_id: userId, 
      product_id: productId 
    });
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const updateCartQuantity = async (userId, productId, quantity) => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(userId, productId);
    }
    
    return await mongoose.model('UserCart').findOneAndUpdate(
      { user_id: userId, product_id: productId },
      { quantity },
      { new: true }
    );
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    return await mongoose.model('UserCart').deleteMany({ user_id: userId });
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

export default User; 