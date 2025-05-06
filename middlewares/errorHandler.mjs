export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  
  // Objeto base para todos los errores
  const errorResponse = {
    success: false,
    error: {
      message: 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR'
    }
  };
  
  // Personalizar según tipo de error
  if (err.name === 'ValidationError') {
    errorResponse.error.message = 'Error de validación';
    errorResponse.error.details = Object.values(err.errors).map(e => e.message);
    res.status(400).json(errorResponse);
    return;
  }
  
  if (err.code === 11000) {
    errorResponse.error.message = 'Dato duplicado';
    errorResponse.error.field = Object.keys(err.keyPattern)[0];
    res.status(400).json(errorResponse);
    return;
  }
  
  // Añadir detalles en desarrollo
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.message;
  }
  
  res.status(500).json(errorResponse);
};