import mongoose from 'mongoose';

// Review Schema
const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Create indexes for better performance
reviewSchema.index({ product_id: 1 });
reviewSchema.index({ user_id: 1 });
reviewSchema.index({ product_id: 1, user_id: 1 }, { unique: true }); // One review per user per product

const Review = mongoose.model('Review', reviewSchema);

// Review Model Functions
export const createReview = async (reviewData) => {
  const review = new Review(reviewData);
  return await review.save();
};

export const getReviewsByProduct = async (productId) => {
  return await Review.find({ product_id: productId })
    .populate('user_id', 'name email profile_pic_url')
    .sort({ createdAt: -1 });
};

export const getReviewById = async (reviewId) => {
  return await Review.findById(reviewId)
    .populate('user_id', 'name email profile_pic_url')
    .populate('product_id', 'title');
};

export const updateReview = async (reviewId, updateData) => {
  return await Review.findByIdAndUpdate(
    reviewId,
    { $set: updateData },
    { new: true }
  ).populate('user_id', 'name email profile_pic_url');
};

export const deleteReview = async (reviewId) => {
  return await Review.findByIdAndDelete(reviewId);
};

export const getUserReviewForProduct = async (userId, productId) => {
  return await Review.findOne({ user_id: userId, product_id: productId })
    .populate('user_id', 'name email profile_pic_url');
};

export const getAverageRating = async (productId) => {
  // Convert productId to ObjectId if it's a string
  const productObjectId = mongoose.Types.ObjectId.isValid(productId) 
    ? new mongoose.Types.ObjectId(productId) 
    : productId;
    
  const result = await Review.aggregate([
    { $match: { product_id: productObjectId } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  if (result.length === 0) {
    return { averageRating: 0, totalReviews: 0 };
  }
  
  return {
    averageRating: result[0].averageRating,
    totalReviews: result[0].totalReviews
  };
};

export default Review;

