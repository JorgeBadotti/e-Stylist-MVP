import express from 'express';
import {
    adicionarItemAtomic,
    criarCarrinho,
    obterCarrinhoById,
    obterCarrinhoAtivo,
    obterOuCriarCarrinhoUsuario,
    listarCarrinhosUsuario,
    adicionarItemCarrinho,
    removerItemCarrinho,
    atualizarQuantidadeItem,
    aplicarDesconto,
    limparCarrinho,
    finalizarCompra,
    deletarCarrinho,
    cancelarCarrinho
} from '../controllers/carrinhoController.js';
import { isAuthenticated } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ═══════════════════════════════════════════════════════════
// CREATE - Criar novo carrinho
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/carrinhos/adicionar-item
 * Adiciona item ao carrinho (cria carrinho se não existir)
 * ATOMIC: Cria carrinho + adiciona item em uma operação
 * 
 * Body:
 * {
 *   "produtoId": "string (MongoDB ObjectId)",
 *   "skuStyleMe": "string",
 *   "quantidade": "number",
 *   "preco_unitario": "number"
 * }
 */
router.post('/adicionar-item', isAuthenticated, adicionarItemAtomic);

/**
 * POST /api/carrinhos
 * Cria um novo carrinho para um usuário em uma loja
 * 
 * Body:
 * {
 *   "usuarioId": "string (MongoDB ObjectId)",
 *   "lojaId": "string (MongoDB ObjectId)"
 * }
 */
router.post('/', isAuthenticated, criarCarrinho);

// ═══════════════════════════════════════════════════════════
// READ - Obter carrinhos
// ═══════════════════════════════════════════════════════════

/**
 * GET /api/carrinhos/meu-carrinho
 * Obter ou criar carrinho do usuário autenticado
 */
router.get('/meu-carrinho', isAuthenticated, obterOuCriarCarrinhoUsuario);

/**
 * GET /api/carrinhos/:id
 * Obter carrinho por ID com detalhes completos
 */
router.get('/:id', isAuthenticated, obterCarrinhoById);

/**
 * GET /api/carrinhos/usuario/:usuarioId/loja/:lojaId
 * Obter carrinho ativo de um usuário em uma loja específica
 */
router.get('/usuario/:usuarioId/loja/:lojaId', isAuthenticated, obterCarrinhoAtivo);

/**
 * GET /api/carrinhos/usuario/:usuarioId
 * Listar todos os carrinhos de um usuário
 * 
 * Query params (opcional):
 * - status: ativo, abandonado, finalizado, cancelado
 */
router.get('/usuario/:usuarioId/todos', isAuthenticated, listarCarrinhosUsuario);

// ═══════════════════════════════════════════════════════════
// UPDATE - Gerenciar itens do carrinho
// ═══════════════════════════════════════════════════════════

/**
 * POST /api/carrinhos/:carrinhoId/itens
 * Adicionar item ao carrinho
 * 
 * Body:
 * {
 *   "produtoId": "string (MongoDB ObjectId)",
 *   "skuStyleMe": "string",
 *   "quantidade": number,
 *   "preco_unitario": number
 * }
 */
router.post('/:carrinhoId/itens', isAuthenticated, adicionarItemCarrinho);

/**
 * DELETE /api/carrinhos/:carrinhoId/itens
 * Remover item do carrinho
 * 
 * Body:
 * {
 *   "skuStyleMe": "string"
 * }
 */
router.delete('/:carrinhoId/itens', isAuthenticated, removerItemCarrinho);

/**
 * PUT /api/carrinhos/:carrinhoId/itens/quantidade
 * Atualizar quantidade de um item
 * 
 * Body:
 * {
 *   "skuStyleMe": "string",
 *   "novaQuantidade": number
 * }
 */
router.put('/:carrinhoId/itens/quantidade', isAuthenticated, atualizarQuantidadeItem);

// ═══════════════════════════════════════════════════════════
// UPDATE - Operações no carrinho
// ═══════════════════════════════════════════════════════════

/**
 * PUT /api/carrinhos/:carrinhoId/desconto
 * Aplicar desconto ao carrinho
 * 
 * Body:
 * {
 *   "desconto": number,
 *   "cupom": "string (opcional)"
 * }
 */
router.put('/:carrinhoId/desconto', isAuthenticated, aplicarDesconto);

/**
 * DELETE /api/carrinhos/:carrinhoId/limpar
 * Limpar todos os itens do carrinho
 */
router.delete('/:carrinhoId/limpar', isAuthenticated, limparCarrinho);

/**
 * PUT /api/carrinhos/:carrinhoId/finalizar
 * Finalizar a compra (mudar status para 'finalizado')
 */
router.put('/:carrinhoId/finalizar', isAuthenticated, finalizarCompra);

/**
 * PUT /api/carrinhos/:carrinhoId/cancelar
 * Cancelar o carrinho (mudar status para 'cancelado')
 */
router.put('/:carrinhoId/cancelar', isAuthenticated, cancelarCarrinho);

// ═══════════════════════════════════════════════════════════
// DELETE - Deletar carrinho
// ═══════════════════════════════════════════════════════════

/**
 * DELETE /api/carrinhos/:id
 * Deletar carrinho permanentemente
 */
router.delete('/:id', isAuthenticated, deletarCarrinho);

export default router;
