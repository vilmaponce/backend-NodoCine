// backend/Routes/auth.mjs
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.mjs';
import { verifyToken } from '../middlewares/auth.mjs'; // Importación correcta
import 'dotenv/config';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta para login
// En Routes/auth.mjs
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Datos recibidos en login:', { email });

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    console.log('Usuario encontrado:', user ? 'Sí' : 'No');
    
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // TEMPORAL: Omitir verificación de contraseña
    console.log('⚠️ BYPASS de verificación para pruebas');
    
    // Crear token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.isAdmin ? 'admin' : 'user'
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
// Ruta para verificar token (opcional pero útil)
router.get('/verify', verifyToken, (req, res) => { // Usando verifyToken en lugar de auth
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// En el backend, en routes/auth.mjs o en una nueva ruta
router.post('/make-admin', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    user.isAdmin = true;
    await user.save();
    
    res.json({ 
      message: 'Usuario actualizado a administrador',
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Añade esto en Routes/auth.mjs justo después de la ruta de login
// Ruta para registro
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Datos recibidos en registro:', { email });

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }
    
    // Crear el nuevo usuario
    const newUser = new User({
      username: email.split('@')[0], // Usar la parte del email antes de @ como username
      email,
      password, // Usar password sin hashear para pruebas
      isAdmin: email.includes('admin'), // Hacer admin si el email contiene "admin"
      role: email.includes('admin') ? 'admin' : 'user'
    });

    const savedUser = await newUser.save();
    
    // Crear token JWT
    const token = jwt.sign(
      {
        id: savedUser._id,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
        role: savedUser.isAdmin ? 'admin' : 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email,
        isAdmin: savedUser.isAdmin,
        role: savedUser.isAdmin ? 'admin' : 'user'
      }
    });
    
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;