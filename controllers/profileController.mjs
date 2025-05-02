import Profile from '../models/Profile.mjs';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de directorios
const profilesDir = path.join(__dirname, '../../public/images/profiles');
if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP)'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('image');

// Normalización de URLs mejorada
const normalizeImageUrl = (url, req) => {
  if (!url) return '/images/profiles/default-profile.png';
  if (url.startsWith('http')) return url;
  
  // Para el backend
  if (req) {
    return `${req.protocol}://${req.get('host')}${url.startsWith('/') ? url : `/${url}`}`;
  }
  
  // Para el frontend (asumimos la URL base del API)
  const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  return `${baseUrl}${url.startsWith('/') ? url : `/images/profiles/${url}`}`;
};

// Crear perfil - Versión corregida
export const createProfile = async (req, res) => {
  try {
    // Verificar que el cuerpo de la solicitud tenga los campos requeridos
    if (!req.body.name) {
      return res.status(400).json({ 
        error: 'ValidationError',
        message: 'El nombre del perfil es requerido' 
      });
    }

    // Preparar datos del perfil
    const profileData = {
      name: req.body.name,
      isChild: req.body.isChild === 'true',
      userId: req.user.userId,
      imageUrl: '/images/profiles/default-profile.png'
    };

    // Manejar la imagen si fue enviada
    if (req.file) {
      // Validar tipo de archivo en el backend
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        fs.unlinkSync(req.file.path); // Eliminar archivo no válido
        return res.status(400).json({ 
          error: 'ValidationError',
          message: 'Solo se permiten imágenes JPEG, PNG o WEBP' 
        });
      }

      profileData.imageUrl = `/images/profiles/${req.file.filename}`;
    }

    // Crear y guardar el perfil
    const profile = new Profile(profileData);
    await profile.save();

    // Responder con los datos del perfil creado
    res.status(201).json({
      success: true,
      profile: {
        _id: profile._id,
        name: profile.name,
        isChild: profile.isChild,
        imageUrl: profile.imageUrl,
        userId: profile.userId
      }
    });

  } catch (error) {
    console.error('Error al crear perfil:', error);
    
    // Limpiar archivo subido si hubo error
    if (req.file?.path) {
      fs.unlinkSync(req.file.path);
    }

    // Manejar diferentes tipos de errores
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: error.name,
        message: error.message 
      });
    }

    res.status(500).json({
      error: 'ServerError',
      message: 'Error interno al crear perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener todos los perfiles (admin)
export const getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().lean();
    const processedProfiles = profiles.map(profile => ({
      ...profile,
      imageUrl: normalizeImageUrl(profile.imageUrl, req)
    }));
    res.json(processedProfiles.length > 0 ? processedProfiles : []);
  } catch (err) {
    console.error('Error en getAllProfiles:', err);
    res.status(500).json({
      error: 'Error al obtener perfiles',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Obtener perfiles por usuario (versión corregida)
// En tu profileController.mjs
export const getProfilesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const profiles = await Profile.find({ userId });
    res.json(profiles);
    
  } catch (err) {
    console.error('Error en getProfilesByUser:', err);
    res.status(500).json({ error: 'Error al obtener perfiles' });
  }
};


// Actualizar perfil
export const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Verificar que el perfil exista y pertenezca al usuario
    const profile = await Profile.findOne({
      _id: id,
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado o no autorizado' });
    }

    // 2. Actualizar campos
    profile.name = req.body.name || profile.name;
    profile.isChild = req.body.isChild || profile.isChild;

    // 3. Manejar imagen si se envió
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (profile.imageUrl && !profile.imageUrl.includes('default-profile')) {
        const oldImagePath = path.join(__dirname, '../../public', profile.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      profile.imageUrl = `/images/profiles/${req.file.filename}`;
    }

    // 4. Guardar cambios
    await profile.save();

    res.json({
      success: true,
      profile: {
        ...profile.toObject(),
        imageUrl: profile.imageUrl
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    if (req.file?.path) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

// Eliminar perfil - Versión corregida
export const deleteProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findOneAndDelete({
      _id: id,
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({ 
        error: 'Perfil no encontrado o no autorizado',
        details: `Usuario ${req.user.userId} intentó eliminar perfil ${id}`
      });
    }

    // Eliminar imagen asociada si no es la default
    if (profile.imageUrl && !profile.imageUrl.includes('default-profile')) {
      const imagePath = path.join(profilesDir, path.basename(profile.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ 
      success: true,
      message: 'Perfil eliminado exitosamente' 
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({
      error: 'Error al eliminar perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Watchlist
export const addToWatchlist = async (req, res) => {
  const { id } = req.params;
  const { movieId } = req.body;

  try {
    const profile = await Profile.findOne({
      _id: id,
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    if (profile.watchlist.includes(movieId)) {
      return res.status(400).json({ message: 'La película ya está en la watchlist' });
    }

    profile.watchlist.push(movieId);
    await profile.save();

    res.json({
      ...profile.toObject(),
      imageUrl: normalizeImageUrl(profile.imageUrl, req)
    });
  } catch (error) {
    console.error('Error al agregar a la watchlist:', error);
    res.status(500).json({
      message: 'Error al agregar la película a la watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getWatchlist = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await Profile.findOne({
      _id: id,
      userId: req.user.userId
    }).populate('watchlist');

    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    const watchlist = profile.watchlist.map(movie => ({
      ...movie.toObject(),
      imageUrl: normalizeImageUrl(movie.imageUrl, req)
    }));

    res.json(watchlist);
  } catch (error) {
    console.error('Error al obtener la watchlist:', error);
    res.status(500).json({
      message: 'Error al obtener la watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const removeFromWatchlist = async (req, res) => {
  const { id, movieId } = req.params;

  try {
    const profile = await Profile.findOne({
      _id: id,
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({ message: 'Perfil no encontrado' });
    }

    profile.watchlist = profile.watchlist.filter(movie => movie.toString() !== movieId);
    await profile.save();

    res.json({
      ...profile.toObject(),
      imageUrl: normalizeImageUrl(profile.imageUrl, req)
    });
  } catch (error) {
    console.error('Error al eliminar de la watchlist:', error);
    res.status(500).json({
      message: 'Error al eliminar la película de la watchlist',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};