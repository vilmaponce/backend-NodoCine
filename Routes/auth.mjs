// File: backend/Routes/auth.mjs

import express from 'express';
import jwt from 'jsonwebtoken';
import { login, register } from '../controllers/authController.mjs';
import User from '../models/User.mjs'; // Asegúrate de que la ruta sea correcta

const router = express.Router();

// Registro de usuario
router.post('/register', register);

// Inicio de sesión
router.post('/login', login);

// Verificación de token

router.get('/verify', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
  
      res.json({ 
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      console.error('Token verification error:', err);
      res.status(401).json({ error: 'Token inválido' });
    }
  });

export default router;