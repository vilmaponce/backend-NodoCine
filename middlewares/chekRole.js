// // Middleware para verificar roles adaptado para funcionar tanto con 'role' como con 'isAdmin'
// export const checkRole = (roles = []) => {
//   // Convertir a array si es string
//   if (typeof roles === 'string') {
//     roles = [roles];
//   }
  
//   return (req, res, next) => {
//     // verifyToken middleware ya debería haber añadido req.user
//     if (!req.user) {
//       return res.status(401).json({ message: 'Usuario no autenticado' });
//     }
    
//     // Si no se especifican roles, cualquier usuario autenticado puede acceder
//     if (roles.length === 0) {
//       return next();
//     }
    
//     // Verificar 'isAdmin' si roles incluye 'admin'
//     if (roles.includes('admin') && req.user.isAdmin === true) {
//       return next();
//     }
    
//     // Verificar 'role' si existe
//     if (req.user.role && roles.includes(req.user.role)) {
//       return next();
//     }
    
//     // Caso especial: si roles incluye 'user' y el usuario no es admin, permitir acceso
//     if (roles.includes('user') && req.user.isAdmin !== true) {
//       return next();
//     }
    
//     // Si el usuario no tiene el rol requerido
//     return res.status(403).json({ message: 'Acceso prohibido: no tienes los permisos necesarios' });
//   };
// };