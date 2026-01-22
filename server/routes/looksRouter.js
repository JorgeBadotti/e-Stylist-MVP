import { Router } from 'express';
import * as LooksController from '../controllers/looksController.js';

const router = Router();

// Middleware de auth
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: 'Não autorizado' });
};

router.use(ensureAuthenticated);

// ✅ NOVO: Criar LookSession
router.post('/create-session', LooksController.createLookSession);

router.post('/gerar', LooksController.gerarLooks);

router.post('/salvar', LooksController.salvarEscolha);

router.post('/visualizar', LooksController.visualizarLook);

// NOVOS ENDPOINTS
router.get('/', LooksController.listarMeusLooks);

router.get('/:lookId', LooksController.obterDetalhesComunsLook);

export default router;