import express from 'express';
import {
    getMovies,
    getMovieDetails,
    createMovie,
    updateMovie,
    deleteMovie
} from '../controllers/moviesController.mjs';
import { authenticate, checkRole } from '../middlewares/auth.mjs';

const router = express.Router();

// 🟢 Obtener todas las películas (público)
router.get('/', getMovies);

// 🟢 Obtener detalles extendidos de una película (local u OMDB)
router.get('/:id', getMovieDetails);

// 🔒 Crear una nueva película (solo admin)
router.post('/', authenticate, checkRole(['admin']), createMovie);

// 🔒 Actualizar una película (solo admin)
router.put('/:id', authenticate, checkRole(['admin']), updateMovie);

// 🔒 Eliminar una película (solo admin)
router.delete('/:id', authenticate, checkRole(['admin']), deleteMovie);

export default router;
