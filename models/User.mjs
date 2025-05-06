// models/User.mjs
import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    min: 3,
    max: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    max: 50
  },
  password: {
    type: String,
    required: true,
    min: 6
  },
  profilePic: {
    type: String,
    default: ""
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profiles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile'
  }]
}, { timestamps: true });

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(password) {
  return await bcryptjs.compare(password, this.password);
};

// Hash de contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("User", UserSchema);