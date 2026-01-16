import express from 'express';
import {
    addRoupa,
    getRoupasByGuardaRoupa,
    updateRoupa,
    deleteRoupa,
    updateRoupaStatus
} from '../controllers/roupaController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/fileUpload.js';

const router = express.Router();

// Aplica o middleware de autenticação para todas as rotas deste arquivo
router.use(isAuthenticated);

// Rota para adicionar uma nova peça de roupa
// POST /api/roupas/
router.post('/', upload.single('foto'), addRoupa);

// Rota para buscar todas as roupas de um guarda-roupa específico
// GET /api/roupas/guarda-roupa/:guardaRoupaId
router.get('/guarda-roupa/:guardaRoupaId', getRoupasByGuardaRoupa);

// Rota para atualizar os dados principais de uma peça (nome, categoria, foto, etc.)
// PUT /api/roupas/:id
router.put('/:id', upload.single('foto'), updateRoupa);

// Rota para atualizar o status de uma peça (colocar à venda, doar, etc.)
// PATCH /api/roupas/:id/status
router.patch('/:id/status', updateRoupaStatus);

// Rota para deletar uma peça de roupa
// DELETE /api/roupas/:id
router.delete('/:id', deleteRoupa);

export default router;