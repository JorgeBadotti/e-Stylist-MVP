import { Router } from 'express';
import passport from 'passport';
import * as AuthController from '../controllers/AuthController.js';

const router = Router();

// ROTA REGISTRO (Opcional, se precisar criar conta local)
router.post('/register', AuthController.register);

// ROTA LOGIN LOCAL
// O passport.authenticate('local') verifica email/senha automaticamente
router.post('/login',
    passport.authenticate('local', { failWithError: true }), // Se falhar, vai pro error handler
    AuthController.loginSuccess // Se passar, chama o controller de sucesso
);

// ROTA GOOGLE INICIO
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// ROTA GOOGLE CALLBACK
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    AuthController.googleCallback
);

// ROTA LOGOUT
router.post('/logout', AuthController.logout);

// ROTA LOGIN COMO VISITANTE
router.post('/guest', AuthController.loginAsGuest);

// ROTA ME (Para o frontend saber quem está logado ao recarregar a página)
router.get('/me', AuthController.me);

export default router;