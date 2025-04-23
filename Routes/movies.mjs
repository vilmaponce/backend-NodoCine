import express from 'express';
import { getMovies, getMovieDetails } from '../controllers/moviesController.mjs';

const router = express.Router();

// GET /movies - Lista básica de películas (público)
router.get('/', getMovies);

// GET /movies/:id - Detalles extendidos (incluye OMDB)
router.get('/:id', getMovieDetails);

export default router;