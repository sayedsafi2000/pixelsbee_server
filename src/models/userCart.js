import mongoose from 'mongoose';

const userCartSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  added_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userCartSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

const UserCart = mongoose.model('UserCart', userCartSchema);

export default UserCart;
