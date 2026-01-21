import express from 'express';
import {
    registerStore,
    getLojaById,
    updateLoja,
    adicionarProduto,
    listarProdutosDaLoja,
    getAllLojas
} from '../controllers/lojaController.js';
import { getProdutoBySku } from '../controllers/storeController.js';
import { isAuthenticated, isStoreAdmin } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/fileUpload.js';

const router = express.Router();

// == ROTAS DE GERENCIAMENTO DA LOJA ==
// Registra um novo lojista e sua loja
router.post('/register', registerStore);

// Lista todas as lojas (para a rota /api/lojas)
router.get('/', getAllLojas);

// Rota específica para o frontend que chama /catalog
router.get('/catalog', getAllLojas);

// 🔥 NOVO: Buscar um produto específico pelo SKU (para ProdutoDetalhe)
router.get('/catalog/:sku', getProdutoBySku);

// Busca detalhes de uma loja específica (público)
// ATENÇÃO: Esta rota genérica com :id DEVE vir DEPOIS das rotas mais específicas.
router.get('/:id', getLojaById);

// Atualiza os dados de uma loja (requer autenticação do dono da loja)
router.put('/:id', isAuthenticated, isStoreAdmin, upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'fotos', maxCount: 5 }]), updateLoja);


// == ROTAS DE GERENCIAMENTO DE PRODUTOS DO CATÁLOGO DA LOJA ==

// Adiciona um novo produto ao catálogo de uma loja
// Requer que o usuário seja o admin da loja
router.post(
    '/:lojaId/produtos',
    isAuthenticated,
    isStoreAdmin,
    upload.fields([{ name: 'fotos', maxCount: 10 }]),
    adicionarProduto
);

// Lista todos os produtos de uma loja (público)
router.get('/:lojaId/produtos', listarProdutosDaLoja);


// TODO: Adicionar rotas para ATUALIZAR e DELETAR um produto específico.
// Ex: router.put('/:lojaId/produtos/:produtoId', isAuthenticated, isStoreAdmin, updateProduto);
// Ex: router.delete('/:lojaId/produtos/:produtoId', isAuthenticated, isStoreAdmin, deleteProduto);


export default router;
