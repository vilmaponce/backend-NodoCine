import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. Verificación básica del token
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado. No hay token.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Normalizar los datos del usuario
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      // Normalizar isAdmin considerando ambos formatos
      isAdmin: decoded.isAdmin || decoded.role === 'admin'
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// 2. Verificación de administrador (combinando isAdmin y role)
export const verifyAdmin = (req, res, next) => {
  if (req.user?.isAdmin || req.user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Se requieren permisos de administrador" });
  }
};

// 3. Middleware de roles dinámicos (opcional para futura escalabilidad)
// Modifica tu middleware checkRole en middlewares/auth.mjs
export const checkRole = (role) => {
  // Si se pasa un string, convertirlo en array
  const roles = Array.isArray(role) ? role : [role];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Usuario no autenticado' });
    }
    
    // Verificar si el usuario tiene uno de los roles permitidos
    const userRole = req.user.role || (req.user.isAdmin ? 'admin' : 'user');
    
    if (roles.includes(userRole) || (roles.includes('admin') && req.user.isAdmin)) {
      next();
    } else {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
  };
};
