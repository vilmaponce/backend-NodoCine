// File: backend/Routes/auth.mjs

import express from 'express';
import { login, register } from '../controllers/authController.mjs';

const router = express.Router();

// Registro de usuario
router.post('/register', register);

// Inicio de sesión
router.post('/login', login);

export default router;