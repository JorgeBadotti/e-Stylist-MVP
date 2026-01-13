import express from 'express';
import {
    addRoupa,
    getRoupasByGuardaRoupa,
    updateRoupa,
    deleteRoupa
} from '../controllers/roupaController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(isAuthenticated);

// Rota: /api/roupas/
router.post('/', addRoupa); // Adicionar nova roupa

// Rota: /api/roupas/guarda-roupa/:guardaRoupaId
// Exemplo de uso no Front: axios.get('/api/roupas/guarda-roupa/65a...')
router.get('/guarda-roupa/:guardaRoupaId', getRoupasByGuardaRoupa);

// Rota: /api/roupas/:id (Operações diretas no item)
router.put('/:id', updateRoupa);  // Editar roupa
router.delete('/:id', deleteRoupa); // Deletar roupa

export default router;