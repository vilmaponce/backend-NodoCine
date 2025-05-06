// backend/Routes/auth.mjs
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.mjs';
import { verifyToken } from '../middlewares/auth.mjs'; // Importación correcta
import 'dotenv/config';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta para login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    // Crear y firmar token JWT
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin // Usar isAdmin en lugar de role
      },
      JWT_SECRET,
      { expiresIn: '1d' } // 1 día
    );

    // Enviar respuesta con token y datos básicos del usuario
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username, // Si tienes este campo
        email: user.email,
        isAdmin: user.isAdmin // Usar isAdmin en lugar de role
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

export default router;