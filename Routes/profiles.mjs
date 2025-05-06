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
import { verifyToken, verifyAdmin } from '../middlewares/auth.mjs'; // Cambiado verifyAdmin por verifyTokenAndAdmin
import { upload } from '../middlewares/upload.mjs';

const router = express.Router();

// Rutas solo para admin
router.get('/', verifyToken, verifyAdmin, getAllProfiles); // Cambiado verifyAdmin por verifyTokenAndAdmin
router.delete('/:id', verifyToken, verifyAdmin, deleteProfile); // Cambiado verifyAdmin por verifyTokenAndAdmin

// Rutas para usuarios autenticados (sin verificación de rol)
router.get('/user/:userId', verifyToken, getProfilesByUser);
router.post('/', verifyToken, upload.single('image'), createProfile);
router.put('/:id', verifyToken, upload.single('image'), updateProfile);

// Rutas de watchlist (también solo autenticación)
router.post('/:id/watchlist', verifyToken, addToWatchlist);
router.get('/:id/watchlist', verifyToken, getWatchlist);
router.delete('/:id/watchlist/:movieId', verifyToken, removeFromWatchlist);

export default router;