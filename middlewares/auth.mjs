import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET;

// 1. Verificación básica del token
export const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado. No hay token.' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
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
export const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Usuario no autenticado' });
    
    const hasRole = roles.some(role => 
      req.user.role === role || (role === 'admin' && req.user.isAdmin)
    );
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Permisos insuficientes' });
    }
    next();
  };
};

