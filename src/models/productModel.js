import mongoose from 'mongoose';

// Product Schema
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    default: 'general'
  },
  image_url: {
    type: String,
    required: true
  },
  original_url: {
    type: String,
    default: null
  },
  vendor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'rejected', 'deleted'],
    default: 'pending'
  },
  approved_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approved_at: {
    type: Date,
    default: null
  },
  rejection_reason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Create indexes for better performance
productSchema.index({ vendor_id: 1 });
productSchema.index({ status: 1 });
productSchema.index({ category: 1 });

const Product = mongoose.model('Product', productSchema);

// Product Model Functions
export const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

export const getProductById = async (id) => {
  return await Product.findById(id).populate('vendor_id', 'name email');
};

export const getAllProducts = async (filters = {}) => {
  const { page = 1, limit = 50, vendor_id, status, search } = filters;
  const query = {};
  
  if (filters.vendor_id) {
    query.vendor_id = filters.vendor_id;
  }
  
  if (filters.status) {
    query.status = filters.status;
  } else {
    // Default to showing only active products for regular users
    // Admins can override this by passing a specific status filter
    query.status = 'active';
  }
  
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  console.log('getAllProducts query:', query); // Debug log
  
  const skip = (page - 1) * limit;
  
  const products = await Product.find(query)
    .populate('vendor_id', 'name email')
    .populate('approved_by', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
    
  const total = await Product.countDocuments(query);
  
  console.log('getAllProducts results:', { total, productsCount: products.length }); // Debug log
  console.log('Products with status:', products.map(p => ({ id: p._id, title: p.title, status: p.status }))); // Debug log
  
  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getProductsByVendor = async (vendorId, status = 'active') => {
  const query = { vendor_id: vendorId };
  if (status) {
    query.status = status;
  }
  
  return await Product.find(query).sort({ createdAt: -1 });
};

export const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProduct = async (id) => {
  return await Product.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });
};

export const approveProduct = async (id, adminId) => {
  return await Product.findByIdAndUpdate(id, {
    status: 'active',
    approved_by: adminId,
    approved_at: new Date(),
    rejection_reason: null
  }, { new: true });
};

export const rejectProduct = async (id, adminId, reason) => {
  return await Product.findByIdAndUpdate(id, {
    status: 'rejected',
    approved_by: adminId,
    approved_at: new Date(),
    rejection_reason: reason
  }, { new: true });
};

export const getProductStats = async (vendorId) => {
  try {
    const totalProducts = await Product.countDocuments({ 
      vendor_id: vendorId, 
      status: 'active' 
    });
    
    const totalDownloads = await mongoose.model('UserDownload').countDocuments({
      image_id: { $in: await Product.find({ vendor_id: vendorId }).distinct('_id') }
    });
    
    return {
      totalProducts,
      totalDownloads
    };
  } catch (error) {
    console.error('Error getting product stats:', error);
    return {
      totalProducts: 0,
      totalDownloads: 0
    };
  }
};

export const getCategories = async () => {
  return await Product.distinct('category');
};

export default Product; 