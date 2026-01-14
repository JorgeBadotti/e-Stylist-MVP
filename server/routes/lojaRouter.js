import express from 'express';
import { registerStore, getLojaById, updateLoja } from '../controllers/lojaController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/fileUpload.js';

const router = express.Router();

// Rota pública para cadastro
router.post('/register', registerStore);

// Rota pública para ver o perfil de uma loja
router.get('/:id', getLojaById);

// Rota protegida para atualizar uma loja.
// O 'upload.fields' permite o upload de múltiplos arquivos em campos diferentes.
router.put(
    '/:id',
    isAuthenticated,
    upload.fields([
        { name: 'logo', maxCount: 1 },
        { name: 'fotos', maxCount: 5 }
    ]),
    updateLoja
);

export default router;
