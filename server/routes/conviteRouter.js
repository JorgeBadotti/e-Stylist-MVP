import express from 'express';
import { 
    enviarConvite, 
    minhasInvitacoes, 
    aceitarConvite, 
    rejeitarConvite,
    listarVendedoresLoja,
    listarConvitesPendentes
} from '../controllers/ConviteController.js';
import { isAuthenticated, isStoreAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware para garantir autenticação em todas as rotas
router.use(isAuthenticated);

// ✅ STORE_ADMIN envia convite para um vendedor
router.post('/enviar', isStoreAdmin, enviarConvite);

// ✅ USER/SALESPERSON vê seus convites pendentes
router.get('/minhas', minhasInvitacoes);

// ✅ USER/SALESPERSON aceita um convite
router.put('/:conviteId/aceitar', aceitarConvite);

// ✅ USER/SALESPERSON rejeita um convite
router.put('/:conviteId/rejeitar', rejeitarConvite);

// ✅ STORE_ADMIN lista vendedores de sua loja
router.get('/loja/:lojaId/vendedores', listarVendedoresLoja);

// ✅ STORE_ADMIN lista convites pendentes de sua loja
router.get('/loja/:lojaId/pendentes', listarConvitesPendentes);

export default router;
