import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './db.mjs';
import authRoutes from './Routes/auth.mjs';
import movieRoutes from './Routes/movies.mjs';
import profileRoutes from './Routes/profiles.mjs';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Configuración INICIAL de paths (SIEMPRE primero)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 2. Llamar a dotenv.config() para cargar las variables de entorno
dotenv.config();

// 2. Conexión a la base de datos
connectDB().then(() => {

  const app = express();

  // 3. Middlewares BÁSICOS
  app.use(express.json()); // Para parsear JSON
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));

  // 4. Servir archivos estáticos (IMPORTANTE el path correcto)

  // Servir archivos estáticos desde el directorio 'public'
  app.use('/public', express.static(path.join(__dirname, 'public')));
  // 👉 Agregá esta línea para servir la carpeta 'images'
  app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

  // 5. Rutas de la API
  app.use('/api/auth', authRoutes);
  app.use('/api/movies', movieRoutes);
  app.use('/api/profiles', profileRoutes);

  // 6. Manejo de errores (DEBE ir al final)
  app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  });

  // 7. Iniciar servidor
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`\n✅ Servidor funcionando en: http://localhost:${PORT}`);
    console.log(`✅ Ruta de imágenes: ${path.join(__dirname, 'public', 'images')}\n`);
  });
}).catch(err => {
  console.error('❌ FALLA al conectar con MongoDB:', err.message);
  process.exit(1);
});