import mongoose from 'mongoose';

const userDownloadSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image_id: {
    type: String,
    required: true
  },
  image_data: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  downloaded_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

userDownloadSchema.index({ user_id: 1, image_id: 1 }, { unique: true });

const UserDownload = mongoose.model('UserDownload', userDownloadSchema);

export default UserDownload;
