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
 * POST /api/produtos/lotes/imagens
 * Cadastrar produtos em lotes através de imagens
 * Análise automática de imagens para extração de dados
 */
router.post('/lotes/imagens', uploadWrapper('imagens'), async (req, res) => {
    try {
        console.log('📸 [ProdutoRouter] Recebido requisição POST /lotes/imagens');
        console.log('📊 Arquivos recebidos:', req.files?.length || 0);
        console.log('🏪 lojaId:', req.body.lojaId);

        // TODO: Implementar lógica de processamento de imagens
        // 1. Validar imagens
        // 2. Enviar para análise de IA (Gemini/Claude)
        // 3. Extrair dados visuais (cor, material, estilo, etc)
        // 4. Criar SKUs automaticamente
        // 5. Salvar produtos no banco

        return res.status(200).json({
            mensagem: '⚠️ Endpoint em implementação',
            quantidade: 0,
            produtos: [],
            status: 'em_desenvolvimento'
        });
    } catch (erro) {
        console.error('❌ [ProdutoRouter] Erro ao processar lotes de imagens:', erro);
        return res.status(500).json({
            message: 'Erro ao processar imagens',
            erro: erro.message
        });
    }
});

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
