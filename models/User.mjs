import mongoose from 'mongoose';
const { Schema } = mongoose;


// User.mjs
const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true,
    required: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 8
  },
  role: { 
    type: String, 
    enum: ['admin', 'standard'], 
    default: 'standard',
    required: true
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);