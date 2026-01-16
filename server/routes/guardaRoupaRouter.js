import express from 'express';
import upload from '../middlewares/fileUpload.js';
import {
    createGuardaRoupa,
    getGuardaRoupas,
    getGuardaRoupaById,
    getGuardaRoupasPublicos,
    updateGuardaRoupa,
    deleteGuardaRoupa
} from '../controllers/guardaRoupaController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js'; // Importe seu middleware

const router = express.Router();

// Rota PÚBLICA: Listar guardaroupas públicos (NÃO precisa de autenticação)
router.get('/publicos/lista', getGuardaRoupasPublicos);

// Aplica a proteção em TODAS as rotas deste arquivo de uma vez
router.use(isAuthenticated);

// Rota: /api/guarda-roupas/
router.get('/', getGuardaRoupas);     // Listar todos do usuário
router.post('/', upload.single('foto'), createGuardaRoupa);      // Criar



// Rota: /api/guarda-roupas/:id
router.get('/:id', getGuardaRoupaById);   // Ver detalhes de um
router.put('/:id', upload.single('foto'), updateGuardaRoupa);
router.delete('/:id', deleteGuardaRoupa); // Deletar

export default router;