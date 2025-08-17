import { createOrder } from '../models/orderModel.js';
import { addToDownloads } from '../models/userModel.js';

export const create = async (req, res) => {
  try {
    const { items, total, status = 'pending' } = req.body;
    const user_id = req.user._id; // Get user from auth middleware
    
    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }
    
    // Validate total
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Valid total is required' });
    }
    
    const orderData = {
      user_id,
      items,
      total,
      status
    };
    
    console.log('Creating order with data:', orderData);
    const order = await createOrder(orderData);
    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

export const analytics = async (req, res) => {
  try {
    // Basic order analytics
    const Order = (await import('../models/orderModel.js')).default;
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: 'paid' });
    
    res.json({
      totalOrders,
      paidOrders,
      message: 'Analytics endpoint working'
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// Function to add products to user downloads when order is approved/delivered
export const addOrderProductsToDownloads = async (orderId) => {
  try {
    const Order = (await import('../models/orderModel.js')).default;
    const order = await Order.findById(orderId)
      .populate('items.product_id')
      .populate('user_id');

    if (!order) {
      throw new Error('Order not found');
    }

    // Add each product to user downloads
    for (const item of order.items) {
      if (item.product_id) {
        const downloadData = {
          image_id: item.product_id._id.toString(),
          image_data: {
            title: item.product_id.title,
            description: item.product_id.description,
            image_url: item.product_id.image_url,
            original_url: item.product_id.original_url,
            category: item.product_id.category,
            price: item.price,
            order_id: orderId,
            purchased_at: order.createdAt
          }
        };

        await addToDownloads(order.user_id._id, downloadData.image_id, downloadData.image_data);
      }
    }

    console.log(`Added ${order.items.length} products to downloads for user ${order.user_id._id}`);
    return true;
  } catch (error) {
    console.error('Error adding order products to downloads:', error);
    throw error;
  }
};