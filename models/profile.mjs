import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  imageUrl: {
    type: String,
    required: true,
  },
  isChild: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie'
  }],
  restrictions: [{
    type: String,
    enum: ['violence', 'nudity', 'language']
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Middleware para logging
profileSchema.post('find', function(docs) {
  console.log(`[Profile] Found ${docs.length} profiles`);
});

export default mongoose.model('Profile', profileSchema);