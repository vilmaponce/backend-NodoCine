
import express from 'express';
import User from '../models/User.mjs';
import { verifyToken } from '../middlewares/auth.mjs';

const router = express.Router();

// Ruta para obtener el perfil del usuario autenticado
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Obtener usuario sin incluir la contraseña
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil de usuario:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

export default router;