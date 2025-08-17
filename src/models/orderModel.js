import mongoose from 'mongoose';

// Order Schema
const orderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1
    },
    price: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'shipped', 'delivered', 'paid', 'failed', 'refunded'],
    default: 'pending'
  }
}, {
  timestamps: true
});

orderSchema.index({ user_id: 1 });
orderSchema.index({ vendor_id: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.model('Order', orderSchema);

export const createOrder = async (orderData) => {
  const order = new Order(orderData);
  return await order.save();
};

export const getOrderById = async (id) => {
  return await Order.findById(id)
    .populate('user_id', 'name email')
    .populate('items.product_id', 'title image_url')
    .populate('items.vendor_id', 'name email');
};

export const getOrdersByUser = async (userId) => {
  return await Order.find({ user_id: userId })
    .populate('items.product_id', 'title image_url price')
    .populate('items.vendor_id', 'name email')
    .sort({ createdAt: -1 });
};

export const getOrdersByVendor = async (vendorId) => {
  return await Order.find({ 'items.vendor_id': vendorId })
    .populate('user_id', 'name email')
    .populate('items.product_id', 'title image_url price')
    .sort({ createdAt: -1 });
};

export const updateOrderStatus = async (id, status) => {
  return await Order.findByIdAndUpdate(id, { status }, { new: true });
};

export default Order;