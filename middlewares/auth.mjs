import jwt from 'jsonwebtoken';


export const authenticate = (req, res, next) => {
  try {
    // Obtener el token del encabezado
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Autenticación requerida' });
    }

    // Verificar el token con JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Validar la estructura básica del token
    if (!decoded.userId || !decoded.role) {
      throw new Error('Token con estructura inválida');
    }
    // Adjuntar la información del usuario al request
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      ...(decoded.email && { email: decoded.email })
    };

    next();
  } catch (err) {
    const errorMessage = err.name === 'TokenExpiredError' 
      ? 'Token expirado' 
      : err.name === 'JsonWebTokenError' 
        ? 'Token inválido' 
        : 'Error de autenticación';

    res.status(401).json({ 
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { details: err.message }) // Para más detalles en desarrollo
    });
  }
};


export const checkRole = (allowedRoles) => async (req, res, next) => {
  try {
    // Verificar si el usuario está autenticado
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Verificar si el usuario tiene un rol permitido
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    // Verificar si la ruta requiere propiedad del perfil (cuando el rol es 'user')
    if (allowedRoles.includes('user') && req.params.id) {
      // Verifica si el usuario es dueño del perfil
      const profile = await Profile.findById(req.params.id);
      
      if (!profile) {
        return res.status(404).json({ error: 'Perfil no encontrado' });
      }

      // Compara el userId del perfil con el userId del token
      if (profile.userId.toString() !== req.user.userId.toString()) {
        return res.status(403).json({ error: 'No autorizado para modificar este perfil' });
      }

      return next(); // El usuario es dueño del perfil, puede proceder
    }

    // Si el usuario no cumple con ningún requisito
    return res.status(403).json({ 
      error: 'No autorizado',
      requiredRoles: allowedRoles,
      userRole: req.user.role
    });

  } catch (error) {
    console.error('Error en checkRole:', error);
    return res.status(500).json({ error: 'Error de servidor' });
  }
};