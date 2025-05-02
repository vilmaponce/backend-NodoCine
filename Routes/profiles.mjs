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
import { upload } from '../middlewares/upload.mjs';

const router = express.Router();

// Admin-only routes
router.get('/', authenticate, checkRole(['admin']), getAllProfiles);
router.delete('/:id', authenticate, checkRole(['admin']), deleteProfile);

router.put(
    '/:id',
    authenticate,                        // ✅ Verifica el token JWT
    checkRole(['admin', 'user']),        // ✅ Permite acceso solo a ciertos roles
    upload.single('image'),              // ✅ Procesa una imagen (clave: "image" en el form)
    updateProfile                        // ✅ Controlador que actualiza el perfil
);


// User profile management
router.get('/user/:userId', authenticate, getProfilesByUser);
router.post(
    '/',
    authenticate,
    checkRole(['admin', 'user']), // Permitir creación a usuarios normales
    upload.single('image'),
    createProfile
);

// Watchlist routes
router.post('/:id/watchlist', authenticate, addToWatchlist);
router.get('/:id/watchlist', authenticate, getWatchlist);
router.delete('/:id/watchlist/:movieId', authenticate, removeFromWatchlist);

export default router;