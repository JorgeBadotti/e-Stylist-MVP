import mongoose from 'mongoose';

const { Schema } = mongoose;

const carrinhoSchema = new Schema({
    // ═══════════════════════════════════════════════════════════
    // 🔑 RELACIONAMENTOS
    // ═══════════════════════════════════════════════════════════

    // Usuário que possui o carrinho
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'Usuário é obrigatório para o carrinho']
    },

    // Loja da qual os produtos estão sendo comprados
    loja: {
        type: Schema.Types.ObjectId,
        ref: 'Loja',
        required: [true, 'Loja é obrigatória para o carrinho']
    },

    // ═══════════════════════════════════════════════════════════
    // 📦 ITENS DO CARRINHO
    // ═══════════════════════════════════════════════════════════

    itens: [
        {
            // Referência ao produto (pelo SKU StyleMe)
            produto: {
                type: Schema.Types.ObjectId,
                ref: 'Produto',
                required: [true, 'Produto é obrigatório no item do carrinho']
            },

            // SKU StyleMe para fácil identificação
            skuStyleMe: {
                type: String,
                required: true
            },

            // Quantidade desejada
            quantidade: {
                type: Number,
                required: [true, 'Quantidade é obrigatória'],
                min: [1, 'Quantidade deve ser pelo menos 1'],
                default: 1
            },

            // Preço unitário do produto no momento da adição
            preco_unitario: {
                type: Number,
                required: [true, 'Preço unitário é obrigatório'],
                min: [0, 'Preço não pode ser negativo']
            },

            // Subtotal do item (quantidade * preço_unitario)
            subtotal: {
                type: Number,
                required: true,
                min: [0, 'Subtotal não pode ser negativo']
            },

            // Data de adição ao carrinho
            data_adicao: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // ═══════════════════════════════════════════════════════════
    // 💰 CÁLCULOS TOTAIS
    // ═══════════════════════════════════════════════════════════

    // Total sem descontos
    subtotal: {
        type: Number,
        default: 0,
        min: [0, 'Subtotal não pode ser negativo']
    },

    // Desconto aplicado (opcional)
    desconto: {
        type: Number,
        default: 0,
        min: [0, 'Desconto não pode ser negativo']
    },

    // Total com desconto
    total: {
        type: Number,
        default: 0,
        min: [0, 'Total não pode ser negativo']
    },

    // ═══════════════════════════════════════════════════════════
    // 📝 INFORMAÇÕES ADICIONAIS
    // ═══════════════════════════════════════════════════════════

    // Status do carrinho
    status: {
        type: String,
        enum: ['ativo', 'abandonado', 'finalizado', 'cancelado'],
        default: 'ativo',
        comment: "Status do carrinho"
    },

    // Notas ou observações adicionais
    notas: {
        type: String,
        default: ''
    },

    // Cupom de desconto aplicado (se houver)
    cupom: {
        type: String,
        default: null
    }

}, {
    timestamps: true // Cria automaticamente 'createdAt' e 'updatedAt'
});

// ═══════════════════════════════════════════════════════════
// 🔧 HOOKS PARA CÁLCULOS AUTOMÁTICOS
// ═══════════════════════════════════════════════════════════

/**
 * Recalcula subtotal e total sempre que itens mudam
 */
carrinhoSchema.methods.recalcularTotais = function () {
    // Calcula subtotal
    this.subtotal = this.itens.reduce((acc, item) => acc + item.subtotal, 0);

    // Calcula total (subtotal - desconto)
    this.total = Math.max(0, this.subtotal - this.desconto);

    return this;
};

/**
 * Adiciona um item ao carrinho
 */
carrinhoSchema.methods.adicionarItem = function (produtoId, skuStyleMe, quantidade, preco_unitario) {
    // Verifica se o item já existe
    const itemExistente = this.itens.find(item => item.skuStyleMe === skuStyleMe);

    if (itemExistente) {
        // Se existe, aumenta a quantidade
        itemExistente.quantidade += quantidade;
        itemExistente.subtotal = itemExistente.quantidade * itemExistente.preco_unitario;
    } else {
        // Se não existe, adiciona um novo item
        this.itens.push({
            produto: produtoId,
            skuStyleMe,
            quantidade,
            preco_unitario,
            subtotal: quantidade * preco_unitario
        });
    }

    // Recalcula os totais
    this.recalcularTotais();
    return this;
};

/**
 * Remove um item do carrinho pelo SKU
 */
carrinhoSchema.methods.removerItem = function (skuStyleMe) {
    this.itens = this.itens.filter(item => item.skuStyleMe !== skuStyleMe);
    this.recalcularTotais();
    return this;
};

/**
 * Atualiza a quantidade de um item
 */
carrinhoSchema.methods.atualizarQuantidade = function (skuStyleMe, novaQuantidade) {
    const item = this.itens.find(item => item.skuStyleMe === skuStyleMe);

    if (!item) {
        throw new Error('Item não encontrado no carrinho');
    }

    if (novaQuantidade <= 0) {
        return this.removerItem(skuStyleMe);
    }

    item.quantidade = novaQuantidade;
    item.subtotal = novaQuantidade * item.preco_unitario;
    this.recalcularTotais();
    return this;
};

/**
 * Limpa o carrinho (remove todos os itens)
 */
carrinhoSchema.methods.limpar = function () {
    this.itens = [];
    this.recalcularTotais();
    return this;
};

const Carrinho = mongoose.models.Carrinho || mongoose.model('Carrinho', carrinhoSchema);

export default Carrinho;
