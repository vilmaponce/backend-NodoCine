// backend/middlewares/auth.mjs
// auth.mjs
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido en formato Bearer' });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      token // Opcional: guardar el token completo
    };
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    res.status(403).json({ 
      error: 'Token inválido o expirado',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const checkRole = (roles) => (req, res, next) => {
  // Ej: checkRole(['admin'])
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};