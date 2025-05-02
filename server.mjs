import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db.mjs';
import authRoutes from './Routes/auth.mjs';
import movieRoutes from './Routes/movies.mjs';
import profileRoutes from './Routes/profiles.mjs';
import cors from 'cors';
import { upload } from './middlewares/upload.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

connectDB().then(() => {
  const app = express();

  // Middlewares básicos
  app.use(express.json());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.urlencoded({ extended: true }));



// Configuración de rutas estáticas
const publicDir = path.join(__dirname, 'public');
const imagesDir = path.join(publicDir, 'images');

// Servir archivos estáticos
app.use(express.static(publicDir));  // Para servir /public

// Middleware para manejar imágenes de perfiles faltantes
app.use('/images/profiles/:imageName', (req, res, next) => {
  const imagePath = path.join(imagesDir, 'profiles', req.params.imageName);
  
  fs.access(imagePath, (err) => {
    if (err) {
      console.log('⚠️ Imagen de perfil no encontrada, usando default');
      return res.sendFile(path.join(imagesDir, 'profiles', 'default-profile.png'));
    }
    next();
  });
});

app.use('/images', express.static(path.join(__dirname, 'public', 'images')));


  // Rutas API
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/profiles', profileRoutes);

  // Manejo de errores
  app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);

    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
    }
    if (err.message.includes('Solo se permiten imágenes')) {
      return res.status(415).json({ error: err.message });
    }

    res.status(500).json({ error: 'Error interno del servidor' });
  });

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n✅ Servidor funcionando en: http://localhost:${PORT}`);
    console.log(`✅ Ruta de imágenes: http://localhost:${PORT}/images`);
    console.log(`✅ Ruta de perfiles: http://localhost:${PORT}/images/profiles`);
    console.log(`✅ Ruta de películas: http://localhost:${PORT}/images/movies`);
    console.log(`✅ Ruta de autenticación: http://localhost:${PORT}/api/auth`);
  });
})
.catch(err => {
  console.error('❌ FALLA al conectar con MongoDB:', err.message);
  process.exit(1);
});
