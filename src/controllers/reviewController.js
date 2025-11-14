import mongoose from 'mongoose';
import { 
  createReview, 
  getReviewsByProduct, 
  getReviewById, 
  updateReview, 
  deleteReview,
  getUserReviewForProduct,
  getAverageRating
} from '../models/reviewModel.js';

// Create a new review
export const create = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!product_id || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating, and comment are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Convert product_id to ObjectId if it's a string
    const productId = mongoose.Types.ObjectId.isValid(product_id) 
      ? new mongoose.Types.ObjectId(product_id) 
      : product_id;

    // Check if user already reviewed this product
    const existingReview = await getUserReviewForProduct(user_id, productId);
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product. You can update your existing review.' });
    }

    const review = await createReview({
      product_id: productId,
      user_id,
      rating,
      comment: comment.trim()
    });

    const populatedReview = await getReviewById(review._id);
    res.status(201).json(populatedReview);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

// Get all reviews for a product
export const getByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const reviews = await getReviewsByProduct(productId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Get average rating for a product
export const getRating = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const ratingData = await getAverageRating(productId);
    res.json(ratingData);
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ message: 'Failed to fetch rating', error: error.message });
  }
};

// Update a review
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const user_id = req.user.id;

    const review = await getReviewById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user_id._id.toString() !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only update your own reviews' });
    }

    const updateData = {};
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updateData.rating = rating;
    }
    if (comment !== undefined) {
      updateData.comment = comment.trim();
    }

    const updatedReview = await updateReview(id, updateData);
    res.json(updatedReview);
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Failed to update review', error: error.message });
  }
};

// Delete a review
export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const review = await getReviewById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user_id._id.toString() !== user_id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    await deleteReview(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Failed to delete review', error: error.message });
  }
};

// Get user's review for a product
export const getUserReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const user_id = req.user.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Convert productId to ObjectId if needed
    const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
      ? new mongoose.Types.ObjectId(productId) 
      : productId;

    const review = await getUserReviewForProduct(user_id, productObjectId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    console.error('Error fetching user review:', error);
    res.status(500).json({ message: 'Failed to fetch review', error: error.message });
  }
};

