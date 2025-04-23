// File: backend/Routes/profiles.mjs

import express from 'express';
import {
    createProfile,
    getProfilesByUser,
    updateProfile,
    deleteProfile,  
    addToWatchlist,
    getWatchlist,
    removeFromWatchlist,
    getAllProfiles
  } from '../controllers/profileController.mjs';
import { authenticate, checkRole } from '../middlewares/auth.mjs';

const router = express.Router();


// Ruta pública para obtener todos los perfiles (seed)
router.get('/all', getAllProfiles);
// CRUD Perfiles
router.post('/', authenticate, createProfile);



router.get('/user/:userId', authenticate, getProfilesByUser);


router.put('/:id', authenticate, updateProfile);
router.delete('/:id', authenticate, checkRole(['admin']), deleteProfile);

// Watchlist
router.post('/:id/watchlist', authenticate, addToWatchlist);
router.get('/:id/watchlist', authenticate, getWatchlist);
router.delete('/:id/watchlist/:movieId', authenticate, removeFromWatchlist);

export default router;