// middlewares/errorHandler.mjs
export const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Error de validación',
        details: Object.values(err.errors).map(e => e.message)
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        error: 'Dato duplicado',
        field: Object.keys(err.keyPattern)[0]
      });
    }
    
    res.status(500).json({ 
      error: 'Error interno del servidor',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };