import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definir la carpeta de destino
const uploadDir = path.join(__dirname, '../public/images/profiles');

// Asegurar que el directorio existe
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Directorio creado: ${uploadDir}`);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${uniqueSuffix}${ext}`);
  }
});

// Filtro para permitir solo imágenes
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'), false);
  }
};

// Exportar configuración de multer
export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Función auxiliar para normalizar URLs de imágenes
export const normalizeImageUrl = (url, req) => {
  if (!url) return '/images/profile_default.png';
  if (url.startsWith('http')) return url;
  
  // Para el backend (cuando tenemos request)
  if (req) {
    return `${req.protocol}://${req.get('host')}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  // Para el frontend (fallback)
  const baseUrl = process.env.API_BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
  return `${baseUrl}${url.startsWith('/') ? url : `/images/profiles/${url}`}`;
};