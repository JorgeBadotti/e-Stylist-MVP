import { Router } from 'express';
import * as UsuarioController from '../controllers/usuarioController.js';

const router = Router();

// Middleware simples para garantir que só usuários logados acessem
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Não autorizado' });
};

// Aplicar middleware em todas as rotas abaixo
router.use(ensureAuthenticated);

// Rota: GET /api/usuario/perfil
router.get('/perfil', UsuarioController.getProfile);

// ✅ NOVO: Rota: GET /api/usuario/:id (com lojas_associadas populadas)
router.get('/:id', UsuarioController.getUsuarioById);

// Rota: PUT /api/usuario/medidas
router.put('/medidas', UsuarioController.updateBodyData);

// ✅ NOVO: Rota: POST /api/usuario/descrever-corpo (Análise de foto do corpo)
router.post('/descrever-corpo', UsuarioController.describeBody);

export default router;