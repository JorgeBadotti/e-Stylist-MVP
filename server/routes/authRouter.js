import { Router } from 'express';
import passport from 'passport'; // Caso use Passport para Google
import * as AuthController from '../controllers/AuthController.js';

const router = Router();

// Rota de Autenticação Tradicional (Email/Senha)
// router.get('/login', render...)
router.post('/login', AuthController.loginEmail);

// Rota de Autenticação via Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback que o Google chama após o login
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    AuthController.googleCallback
);

export default router;