import express from 'express';
import {
    createProduto,
    getProdutosByGuardaRoupa,
    getProdutosByLoja,
    updateProduto,
    deleteProduto
} from '../controllers/produtoController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/fileUpload.js';

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(isAuthenticated);

/**
 * POST /api/produtos
 * Criar um novo Produto
 */
router.post('/', upload.single('foto'), createProduto);

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
router.put('/:id', upload.single('foto'), updateProduto);

/**
 * DELETE /api/produtos/:id
 * Deletar um Produto
 */
router.delete('/:id', deleteProduto);

export default router;
