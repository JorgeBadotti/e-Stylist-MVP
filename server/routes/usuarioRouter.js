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

// Rota: PUT /api/usuario/medidas
router.put('/medidas', UsuarioController.updateBodyData);

export default router;