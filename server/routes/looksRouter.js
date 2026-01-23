import { Router } from 'express';
import * as LooksController from '../controllers/looksController.js';

const router = Router();

// ✅ NOVO: Middleware que permite usuários autenticados OU visitantes com sessionId
const ensureAuthenticatedOrGuest = (req, res, next) => {
    // Se está autenticado (login normal), permitir
    if (req.isAuthenticated()) {
        req.userType = 'authenticated';
        return next();
    }

    // Se tem sessionId no corpo da requisição (visitante com look session)
    // Ou no header X-Session-ID, permitir
    const sessionId = req.body?.sessionId || req.headers['x-session-id'];
    if (sessionId) {
        req.userType = 'guest';
        req.sessionId = sessionId;
        return next();
    }

    // Se tem anonymousSessionId (visitante anônimo)
    const anonSessionId = req.headers['x-anon-session-id'];
    if (anonSessionId) {
        req.userType = 'guest';
        req.sessionId = anonSessionId;
        return next();
    }

    res.status(401).json({ message: 'Não autorizado. Faça login ou use uma sessão válida.' });
};

router.use(ensureAuthenticatedOrGuest);

// ✅ NOVO: Criar LookSession
router.post('/create-session', LooksController.createLookSession);

router.post('/gerar', LooksController.gerarLooks);

router.post('/salvar', LooksController.salvarEscolha);

router.post('/visualizar', LooksController.visualizarLook);

// NOVOS ENDPOINTS
router.get('/', LooksController.listarMeusLooks);

router.get('/:lookId', LooksController.obterDetalhesComunsLook);

// ✅ NOVO: Atualizar look (PATCH)
router.patch('/:lookId', LooksController.atualizarLook);

export default router;