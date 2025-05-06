// backend/Routes/movies.mjs (cambiando la extensión y la ruta para consistencia)
import express from 'express';
import Movie from '../models/Movie.mjs'; // Correcto
import { verifyToken , checkRole } from '../middlewares/auth.mjs'; // Cambiado auth por verifyToken

const router = express.Router();

// Rutas públicas - No requieren autenticación
router.get('/', async (req, res) => {
  try {
    const movies = await Movie.find().sort({ createdAt: -1 });
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener películas' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener película' });
  }
});

// Rutas protegidas - Requieren autenticación
router.post('/favorites', verifyToken, async (req, res) => { // Cambiado auth por verifyToken
  // Cualquier usuario autenticado puede añadir a favoritos
  // Lógica para añadir película a favoritos
});

// Rutas solo para administradores
router.post('/', verifyToken, checkRole('admin'), async (req, res) => { // Cambiado auth por verifyToken
  try {
    const newMovie = new Movie({
      ...req.body,
      creator: req.user.id // El ID del usuario que crea la película
    });
    
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear película' });
  }
});

router.put('/:id', verifyToken, checkRole('admin'), async (req, res) => { // Cambiado auth por verifyToken
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!updatedMovie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    
    res.json(updatedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar película' });
  }
});

router.delete('/:id', verifyToken, checkRole('admin'), async (req, res) => { // Cambiado auth por verifyToken
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    
    if (!deletedMovie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }
    
    res.json({ message: 'Película eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar película' });
  }
});

export default router;