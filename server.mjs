// server.mjs
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db.mjs';
import { fileURLToPath } from 'url';
import authRoutes from './Routes/auth.mjs';
import movieRoutes from './Routes/movies.mjs';
import profileRoutes from './Routes/profiles.mjs';
import userRoutes from './Routes/users.mjs';



// Configuración de paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Crear directorios necesarios
const createDirs = () => {
  const dirs = [
    path.join(__dirname, 'public'),
    path.join(__dirname, 'public/images'),
    path.join(__dirname, 'public/images/profiles'),
    path.join(__dirname, 'public/images/movies')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directorio creado: ${dir}`);
    }
  });
};

createDirs();

dotenv.config();

connectDB().then(() => {
  const app = express();

  // Middlewares básicos
  app.use(express.json());
  app.use(cors({
    origin: '*',  // Permitir todas las solicitudes durante la fase de desarrollo
    credentials: true
  }));

  app.use(express.urlencoded({ extended: true }));


  // Configurar Express para servir archivos estáticos desde la carpeta public
  app.use(express.static(path.join(__dirname, 'public')));


  app.get('/', (req, res) => {
    res.json({ message: 'NodoCine API is running!' });
  });
  // Configuración específica para asegurar que las imágenes se sirvan correctamente
  app.use('/images', express.static(path.join(__dirname, 'public/images')));

  // Rutas API
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/profiles', profileRoutes);
  app.use('/api/users', userRoutes);

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
    console.log(`\n✅ Servidor funcionando en puerto: ${PORT}`);
    console.log(`✅ Ruta de imágenes: /images`);
    console.log(`✅ Ruta de perfiles: /images/profiles`);
    console.log(`✅ Ruta de películas: /images/movies`);
    console.log(`✅ Ruta de autenticación: /api/auth`);
    console.log(`✅ Modo: ${process.env.NODE_ENV || 'development'}`);
  });
  })
  .catch(err => {
    console.error('❌ FALLA al conectar con MongoDB:', err.message);
    process.exit(1);
  });