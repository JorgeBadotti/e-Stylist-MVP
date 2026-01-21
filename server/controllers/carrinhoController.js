import Carrinho from '../models/Carrinho.js';
import Usuario from '../models/UsuarioModel.js';
import Loja from '../models/Loja.js';
import Produto from '../models/Produto.js';

/**
 * ═══════════════════════════════════════════════════════════
 * CREATE - Criar novo carrinho
 * ═══════════════════════════════════════════════════════════
 */
export const criarCarrinho = async (req, res) => {
    try {
        const { usuarioId, lojaId } = req.body;

        // Validar campos obrigatórios
        if (!usuarioId || !lojaId) {
            return res.status(400).json({
                message: 'Usuário e Loja são obrigatórios',
                required: ['usuarioId', 'lojaId']
            });
        }

        // Verificar se usuário existe
        const usuarioExiste = await Usuario.findById(usuarioId);
        if (!usuarioExiste) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Verificar se loja existe
        const lojaExiste = await Loja.findById(lojaId);
        if (!lojaExiste) {
            return res.status(404).json({ message: 'Loja não encontrada' });
        }

        // Verifica se já existe carrinho ativo para este usuário nesta loja
        const carrinhoExistente = await Carrinho.findOne({
            usuario: usuarioId,
            loja: lojaId,
            status: 'ativo'
        });

        if (carrinhoExistente) {
            return res.status(409).json({
                message: 'Já existe um carrinho ativo para este usuário nesta loja',
                carrinho: carrinhoExistente
            });
        }

        // Criar novo carrinho
        const novoCarrinho = await Carrinho.create({
            usuario: usuarioId,
            loja: lojaId,
            status: 'ativo'
        });

        // Popula os dados relacionados
        await novoCarrinho.populate('usuario', 'id email nome');
        await novoCarrinho.populate('loja', 'id nome');

        res.status(201).json({
            message: 'Carrinho criado com sucesso',
            carrinho: novoCarrinho
        });

    } catch (error) {
        console.error('❌ [criarCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao criar carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * READ - Obter ou criar carrinho do usuário atual (sem lojaId)
 * ═══════════════════════════════════════════════════════════
 */
export const obterOuCriarCarrinhoUsuario = async (req, res) => {
    try {
        const usuarioId = req.user?.id || req.user?._id;

        if (!usuarioId) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Buscar carrinho ativo (qualquer loja)
        let carrinho = await Carrinho.findOne({
            usuario: usuarioId,
            status: 'ativo'
        })
            .populate('usuario', 'id email nome')
            .populate('loja', 'id nome cnpj telefone')
            .populate('itens.produto', 'skuStyleMe categoria linha preco descricao');

        // Se não encontrar carrinho, retorna vazio (não cria automaticamente aqui)
        // O front-end pode chamar o endpoint de criar se desejar
        res.status(200).json({
            message: 'Carrinho obtido com sucesso',
            carrinho: carrinho || null,
            isEmpty: !carrinho
        });

    } catch (error) {
        console.error('❌ [obterOuCriarCarrinhoUsuario] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao obter carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * READ - Obter carrinho por ID
 * ═══════════════════════════════════════════════════════════
 */
export const obterCarrinhoById = async (req, res) => {
    try {
        const { id } = req.params;

        const carrinho = await Carrinho.findById(id)
            .populate('usuario', 'id email nome')
            .populate('loja', 'id nome cnpj telefone')
            .populate('itens.produto', 'skuStyleMe categoria linha preco descricao');

        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        res.status(200).json({
            message: 'Carrinho obtido com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [obterCarrinhoById] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao obter carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * READ - Obter carrinho ativo do usuário em uma loja específica
 * ═══════════════════════════════════════════════════════════
 */
export const obterCarrinhoAtivo = async (req, res) => {
    try {
        const { usuarioId, lojaId } = req.params;

        const carrinho = await Carrinho.findOne({
            usuario: usuarioId,
            loja: lojaId,
            status: 'ativo'
        })
            .populate('usuario', 'id email nome')
            .populate('loja', 'id nome cnpj telefone')
            .populate('itens.produto', 'skuStyleMe categoria linha preco descricao');

        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho ativo não encontrado' });
        }

        res.status(200).json({
            message: 'Carrinho obtido com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [obterCarrinhoAtivo] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao obter carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * READ - Listar todos os carrinhos de um usuário
 * ═══════════════════════════════════════════════════════════
 */
export const listarCarrinhosUsuario = async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const { status } = req.query; // Filtro opcional por status

        let filtro = { usuario: usuarioId };
        if (status) {
            filtro.status = status;
        }

        const carrinhos = await Carrinho.find(filtro)
            .populate('usuario', 'id email nome')
            .populate('loja', 'id nome')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Carrinhos obtidos com sucesso',
            total: carrinhos.length,
            carrinhos
        });

    } catch (error) {
        console.error('❌ [listarCarrinhosUsuario] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao listar carrinhos', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Adicionar item ao carrinho
 * ═══════════════════════════════════════════════════════════
 */
export const adicionarItemCarrinho = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const { produtoId, skuStyleMe, quantidade, preco_unitario } = req.body;

        // Validar campos obrigatórios
        if (!produtoId || !skuStyleMe || !quantidade || preco_unitario === undefined) {
            return res.status(400).json({
                message: 'Campos obrigatórios: produtoId, skuStyleMe, quantidade, preco_unitario',
                required: ['produtoId', 'skuStyleMe', 'quantidade', 'preco_unitario']
            });
        }

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Verificar se produto existe
        const produtoExiste = await Produto.findById(produtoId);
        if (!produtoExiste) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Adicionar item ao carrinho
        carrinho.adicionarItem(produtoId, skuStyleMe, quantidade, preco_unitario);
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');
        await carrinho.populate('itens.produto', 'skuStyleMe categoria linha preco');

        res.status(200).json({
            message: 'Item adicionado ao carrinho com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [adicionarItemCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao adicionar item', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Remover item do carrinho
 * ═══════════════════════════════════════════════════════════
 */
export const removerItemCarrinho = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const { skuStyleMe } = req.body;

        // Validar campo obrigatório
        if (!skuStyleMe) {
            return res.status(400).json({
                message: 'SKU StyleMe é obrigatório',
                required: ['skuStyleMe']
            });
        }

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Verificar se item existe
        const itemExiste = carrinho.itens.find(item => item.skuStyleMe === skuStyleMe);
        if (!itemExiste) {
            return res.status(404).json({ message: 'Item não encontrado no carrinho' });
        }

        // Remover item
        carrinho.removerItem(skuStyleMe);
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');
        await carrinho.populate('itens.produto', 'skuStyleMe categoria linha preco');

        res.status(200).json({
            message: 'Item removido do carrinho com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [removerItemCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao remover item', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Atualizar quantidade de um item
 * ═══════════════════════════════════════════════════════════
 */
export const atualizarQuantidadeItem = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const { skuStyleMe, novaQuantidade } = req.body;

        // Validar campos obrigatórios
        if (!skuStyleMe || novaQuantidade === undefined) {
            return res.status(400).json({
                message: 'Campos obrigatórios: skuStyleMe, novaQuantidade',
                required: ['skuStyleMe', 'novaQuantidade']
            });
        }

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Verificar se item existe
        const itemExiste = carrinho.itens.find(item => item.skuStyleMe === skuStyleMe);
        if (!itemExiste) {
            return res.status(404).json({ message: 'Item não encontrado no carrinho' });
        }

        // Atualizar quantidade
        carrinho.atualizarQuantidade(skuStyleMe, novaQuantidade);
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');
        await carrinho.populate('itens.produto', 'skuStyleMe categoria linha preco');

        res.status(200).json({
            message: 'Quantidade atualizada com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [atualizarQuantidadeItem] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao atualizar quantidade', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Aplicar desconto
 * ═══════════════════════════════════════════════════════════
 */
export const aplicarDesconto = async (req, res) => {
    try {
        const { carrinhoId } = req.params;
        const { desconto, cupom } = req.body;

        // Validar campos
        if (desconto === undefined || desconto < 0) {
            return res.status(400).json({
                message: 'Desconto deve ser um valor não-negativo',
                required: ['desconto']
            });
        }

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Aplicar desconto
        carrinho.desconto = desconto;
        if (cupom) {
            carrinho.cupom = cupom;
        }
        carrinho.recalcularTotais();
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');
        await carrinho.populate('itens.produto', 'skuStyleMe categoria linha preco');

        res.status(200).json({
            message: 'Desconto aplicado com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [aplicarDesconto] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao aplicar desconto', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Limpar carrinho
 * ═══════════════════════════════════════════════════════════
 */
export const limparCarrinho = async (req, res) => {
    try {
        const { carrinhoId } = req.params;

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Limpar carrinho
        carrinho.limpar();
        carrinho.desconto = 0;
        carrinho.cupom = null;
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');

        res.status(200).json({
            message: 'Carrinho limpo com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [limparCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao limpar carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Finalizar compra (mudar status)
 * ═══════════════════════════════════════════════════════════
 */
export const finalizarCompra = async (req, res) => {
    try {
        const { carrinhoId } = req.params;

        // Obter carrinho
        const carrinho = await Carrinho.findById(carrinhoId);
        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Validar se há itens no carrinho
        if (carrinho.itens.length === 0) {
            return res.status(400).json({ message: 'Não é possível finalizar compra de carrinho vazio' });
        }

        // Mudar status
        carrinho.status = 'finalizado';
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');
        await carrinho.populate('itens.produto', 'skuStyleMe categoria linha preco');

        res.status(200).json({
            message: 'Compra finalizada com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [finalizarCompra] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao finalizar compra', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * DELETE - Deletar carrinho
 * ═══════════════════════════════════════════════════════════
 */
export const deletarCarrinho = async (req, res) => {
    try {
        const { id } = req.params;

        const carrinho = await Carrinho.findByIdAndDelete(id);

        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        res.status(200).json({
            message: 'Carrinho deletado com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [deletarCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao deletar carrinho', error: error.message });
    }
};

/**
 * ═══════════════════════════════════════════════════════════
 * UPDATE - Cancelar carrinho (mudar status sem deletar)
 * ═══════════════════════════════════════════════════════════
 */
export const cancelarCarrinho = async (req, res) => {
    try {
        const { carrinhoId } = req.params;

        const carrinho = await Carrinho.findById(carrinhoId);

        if (!carrinho) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        carrinho.status = 'cancelado';
        await carrinho.save();

        // Popula os dados relacionados
        await carrinho.populate('usuario', 'id email nome');
        await carrinho.populate('loja', 'id nome');

        res.status(200).json({
            message: 'Carrinho cancelado com sucesso',
            carrinho
        });

    } catch (error) {
        console.error('❌ [cancelarCarrinho] Erro:', error.message);
        res.status(500).json({ message: 'Erro ao cancelar carrinho', error: error.message });
    }
};
