import express from 'express';
import {
    createGuardaRoupa,
    getGuardaRoupas,
    getGuardaRoupaById,
    deleteGuardaRoupa
} from '../controllers/guardaRoupaController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js'; // Importe seu middleware

const router = express.Router();

// Aplica a proteção em TODAS as rotas deste arquivo de uma vez
router.use(isAuthenticated);

// Rota: /api/guarda-roupas/
router.post('/', createGuardaRoupa);      // Criar
router.get('/', getGuardaRoupas);     // Listar todos do usuário

// Rota: /api/guarda-roupas/:id
router.get('/:id', getGuardaRoupaById);   // Ver detalhes de um
router.delete('/:id', deleteGuardaRoupa); // Deletar

export default router;