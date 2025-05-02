import User from '../models/User.mjs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';



export const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Verificar si el correo ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      email, 
      password: hashedPassword,
      role: email.endsWith('@admin.com') ? 'admin' : 'standard' 
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(400).json({ error: 'Error al registrar usuario' });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validaciones...
    const user = await User.findOne({ email });
    // Verificación de contraseña...

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Considera aumentar este tiempo para desarrollo
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // Manejo de errores...
  }
};