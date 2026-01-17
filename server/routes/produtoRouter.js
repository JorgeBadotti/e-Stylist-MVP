import express from 'express';
import {
    createProduto,
    getProdutosByGuardaRoupa,
    getProdutosByLoja,
    updateProduto,
    deleteProduto,
    getDicionarios,
    sugerirSKU
} from '../controllers/produtoController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import upload, { uploadWrapper } from '../middlewares/fileUpload.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// DICIONÁRIOS STYLEME (sem autenticação, dados públicos)
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/produtos/dicionarios/?tipo=CATEGORIA
 * Obter dicionários SKU STYLEME (público, sem autenticação)
 */
router.get('/dicionarios/', getDicionarios);

/**
 * GET /api/produtos/sku-sugestao?categoria=CAM&colecao=F24
 * Obter sugestão de próximo SKU (público, sem autenticação)
 */
router.get('/sku-sugestao/', sugerirSKU);

// Aplicar autenticação em todas as rotas abaixo deste ponto
router.use(isAuthenticated);

// ═══════════════════════════════════════════════════════════
// CRUD PRODUTOS
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/produtos
 * Criar um novo Produto com SKU STYLEME v1
 */
router.post('/', uploadWrapper('foto'), createProduto);

/**
 * GET /api/produtos/guarda-roupa/:guardaRoupaId
 * Obter produtos de um GuardaRoupa
 */
router.get('/guarda-roupa/:guardaRoupaId', getProdutosByGuardaRoupa);

/**
 * GET /api/produtos/loja/:lojaId
 * Obter produtos de uma Loja
 */
router.get('/loja/:lojaId', getProdutosByLoja);

/**
 * PUT /api/produtos/:id
 * Atualizar um Produto
 */
router.put('/:id', uploadWrapper('foto'), updateProduto);

/**
 * DELETE /api/produtos/:id
 * Deletar um Produto
 */
router.delete('/:id', deleteProduto);

export default router;
