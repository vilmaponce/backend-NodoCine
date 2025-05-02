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
    default: '/images/profiles/default-profile.png', // Ruta relativa por defecto
    set: function(imageUrl) {
      // Si no se proporciona imagen o está vacía, usar la predeterminada
      return !imageUrl || imageUrl.trim() === '' ? 
        '/images/profiles/default-profile.png' : 
        imageUrl;
    }
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

// Middleware para asegurar URL de imagen válida
profileSchema.post('find', function(docs) {
  docs.forEach(doc => {
    if (!doc.imageUrl) {
      doc.imageUrl = '/images/profiles/default.png';
    }
  });
});

export default mongoose.model('Profile', profileSchema);