import Movie from '../models/Movie.mjs';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para películas (directo en /public/images/)
const imagesDir = path.join(__dirname, '../../public/images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

const movieStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir); // Guarda directamente en /public/images/
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `movie-${Date.now()}${ext}`); // Prefijo 'movie-' para identificar
  }
});

const uploadMovieImage = multer({
  storage: movieStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    allowedTypes.includes(ext) ? cb(null, true) : cb(new Error('Solo se permiten imágenes (JPEG, PNG, WEBP)'), false);
  }
}).single('image');

const normalizeImageUrl = (url, req) => {
  if (!url) return `${req.protocol}://${req.get('host')}/images/default-movie.png`;
  
  // Si es URL completa
  if (/^https?:\/\//i.test(url)) return url;
  
  // Asegurar que las rutas locales comiencen con /
  const normalizedPath = url.startsWith('/') ? url : `/${url}`;
  
  // Si ya está en /images/
  if (normalizedPath.startsWith('/images/')) {
    return `${req.protocol}://${req.get('host')}${normalizedPath}`;
  }
  
  // Para otros casos (ej: "movie.jpg")
  return `${req.protocol}://${req.get('host')}/images${normalizedPath}`;
};

// Subir imagen de película
export const uploadImage = async (req, res) => {
  uploadMovieImage(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ 
        error: err instanceof multer.MulterError 
          ? 'Error al subir la imagen' 
          : err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    const imageUrl = `/images/${req.file.filename}`; // Ruta directa a /images/
    res.json({ 
      imageUrl,
      fullUrl: normalizeImageUrl(imageUrl, req)
    });
  });
};

// Obtener todas las películas
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find().select('-__v').lean();
    
    if (!movies.length) {
      return res.status(404).json({ 
        message: 'No hay películas en la base de datos',
        suggestion: 'Agrega películas desde el panel de administración'
      });
    }

    res.json(movies.map(movie => ({
      ...movie,
      imageUrl: normalizeImageUrl(movie.imageUrl || '/images/default-movie.png', req),
      backdropUrl: normalizeImageUrl(movie.backdropUrl || '/images/default-backdrop.png', req)
    })));
    
  } catch (error) {
    console.error("Error en getMovies:", error);
    res.status(500).json({ 
      error: 'Error al obtener películas',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener detalles de película
export const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const localMovie = await Movie.findOne({ 
      $or: [{ _id: id }, { externalId: id }] 
    }).lean();

    if (!localMovie && id.startsWith('tt')) {
      return await fetchFromOMDB(id, res);
    }

    if (localMovie && !localMovie.externalId) {
      return res.json({
        ...localMovie,
        imageUrl: normalizeImageUrl(localMovie.imageUrl, req),
        backdropUrl: normalizeImageUrl(localMovie.backdropUrl, req),
        source: 'local',
        warning: 'Esta película no tiene enlace con OMDB'
      });
    }

    if (localMovie?.externalId) {
      try {
        const omdbData = await fetchOMDBData(localMovie.externalId);
        return res.json({
          ...localMovie,
          imageUrl: normalizeImageUrl(localMovie.imageUrl || omdbData.imageUrl, req),
          backdropUrl: normalizeImageUrl(localMovie.backdropUrl, req),
          ...omdbData,
          source: 'hybrid'
        });
      } catch (omdbError) {
        console.warn("Error OMDB, fallback a local:", omdbError);
        return res.json({
          ...localMovie,
          imageUrl: normalizeImageUrl(localMovie.imageUrl, req),
          backdropUrl: normalizeImageUrl(localMovie.backdropUrl, req),
          source: 'local-fallback'
        });
      }
    }

    return res.status(404).json({ 
      error: 'Película no encontrada',
      triedId: id
    });

  } catch (error) {
    console.error("Error en getMovieDetails:", error);
    res.status(500).json({ 
      error: 'Error al obtener detalles',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Crear nueva película
export const createMovie = async (req, res) => {
  try {
    const movieData = {
      ...req.body,
      imageUrl: req.body.imageUrl?.startsWith('/images/') 
        ? req.body.imageUrl 
        : `/images/${req.body.imageUrl || 'default-movie.png'}`
    };

    const newMovie = new Movie(movieData);
    await newMovie.save();
    
    res.status(201).json({ 
      message: 'Película creada con éxito', 
      movie: {
        ...newMovie.toObject(),
        imageUrl: normalizeImageUrl(newMovie.imageUrl, req),
        backdropUrl: normalizeImageUrl(newMovie.backdropUrl, req)
      }
    });
  } catch (error) {
    console.error("Error al crear película:", error);
    res.status(500).json({ 
      error: 'No se pudo crear la película', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// En controllers/moviesController.mjs
export const updateMovie = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Debug mejorado para ver qué datos están llegando
    console.log('📥 Datos recibidos para actualizar película:', {
      id,
      body: req.body
    });

    // Asegurar que los datos están en el formato correcto
    const updateData = {
      ...req.body,
      // Convertir campos numéricos si es necesario
      year: req.body.year ? Number(req.body.year) : undefined,
      rating: req.body.rating ? Number(req.body.rating) : undefined,
      // Normalizar la URL de la imagen si existe
      imageUrl: req.body.imageUrl?.startsWith('http') 
        ? req.body.imageUrl 
        : req.body.imageUrl?.startsWith('/') 
          ? req.body.imageUrl 
          : `/images/${req.body.imageUrl}`,
      // Añadir fecha de actualización
      updatedAt: new Date()
    };

    console.log('🔄 Datos procesados para actualizar:', updateData);

    // Actualizar la película en la base de datos
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      { $set: updateData },  // Usar $set para actualizar solo los campos proporcionados
      { 
        new: true,          // Devolver el documento actualizado
        runValidators: true, // Ejecutar validadores de esquema
        lean: true           // Devolver un objeto plano en lugar de un documento mongoose
      }
    );

    // Verificar si se encontró y actualizó la película
    if (!updatedMovie) {
      console.log('❌ Película no encontrada:', id);
      return res.status(404).json({ 
        success: false,
        error: 'Película no encontrada' 
      });
    }

    console.log('✅ Película actualizada correctamente:', updatedMovie);

    // Devolver respuesta exitosa
    res.json({
      success: true,
      movie: updatedMovie
    });

  } catch (error) {
    // Manejar errores detalladamente
    console.error('❌ Error al actualizar película:', {
      message: error.message,
      stack: error.stack,
      validationErrors: error.errors // Para errores de validación de Mongoose
    });
    
    res.status(500).json({
      success: false,
      error: 'Error al actualizar película',
      details: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        receivedData: req.body
      } : undefined
    });
  }
};

// Eliminar película
export const deleteMovie = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Movie.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Película no encontrada para eliminar' });
    }

    // Eliminar imagen asociada si existe y no es la default
    if (deleted.imageUrl && !deleted.imageUrl.includes('default-movie')) {
      const imagePath = path.join(imagesDir, path.basename(deleted.imageUrl));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ message: 'Película eliminada con éxito' });
  } catch (error) {
    console.error("Error al eliminar película:", error);
    res.status(500).json({ 
      error: 'No se pudo eliminar la película', 
      details: error.message 
    });
  }
};

// Helper para consultar OMDB (sin cambios)
const fetchOMDBData = async (imdbId) => {
  const response = await axios.get(
    `https://www.omdbapi.com/?i=${imdbId}&apikey=${process.env.OMDB_API_KEY}&plot=full`,
    { timeout: 3000 }
  );

  if (response.data.Response === "False") {
    throw new Error(response.data.Error || "Datos no encontrados en OMDB");
  }

  const { Title, Year, Genre, Plot, Poster, imdbRating, Director, Actors, Runtime } = response.data;
  
  return {
    omdbTitle: Title,
    year: Year,
    genre: Genre,
    plot: Plot,
    imageUrl: Poster !== 'N/A' ? Poster : null,
    rating: parseFloat(imdbRating) || 0,
    director: Director,
    actors: Actors?.split(", "),
    runtime: Runtime,
    imdbId: imdbId
  };
};