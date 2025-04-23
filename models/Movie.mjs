// models/Movie.mjs
import mongoose from '../db.mjs';

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String,
    required: true,
    default: '/images/default-movie.jpg' // Ruta relativa
  },
  director: String,
  year: Number,
  genre: String,
  rating: Number,
  externalId: String,
  duration: String,
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('Movie', movieSchema);
