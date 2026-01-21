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
            // Referência ao produto (pelo ObjectId)
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

            // Data de adição ao carrinho
            data_adicao: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // ═══════════════════════════════════════════════════════════
    // 💰 DESCONTOS
    // ═══════════════════════════════════════════════════════════

    // Desconto aplicado (opcional)
    desconto: {
        type: Number,
        default: 0,
        min: [0, 'Desconto não pode ser negativo']
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
    timestamps: true, // Cria automaticamente 'createdAt' e 'updatedAt'
    toJSON: { virtuals: true }, // Incluir virtuals no JSON
    toObject: { virtuals: true } // Incluir virtuals no Object
});

// ═══════════════════════════════════════════════════════════
// 📐 VIRTUAL FIELDS - CÁLCULOS DINÂMICOS
// ═══════════════════════════════════════════════════════════

/**
 * Calcula o subtotal de cada item dinamicamente
 * IMPORTANTE: Precisa ser calculado após populate() do produto
 */
carrinhoSchema.virtual('itensComSubtotal').get(function () {
    return this.itens.map(item => ({
        ...item.toObject ? item.toObject() : item,
        subtotal: item.quantidade * (item.produto?.preco || 0)
    }));
});

/**
 * Calcula o subtotal total do carrinho
 * (soma de todos os itens)
 */
carrinhoSchema.virtual('subtotal').get(function () {
    return this.itens.reduce((acc, item) => {
        const precoProduto = item.produto?.preco || 0;
        return acc + (item.quantidade * precoProduto);
    }, 0);
});

/**
 * Calcula o total final
 * (subtotal - desconto)
 */
carrinhoSchema.virtual('total').get(function () {
    return Math.max(0, this.subtotal - (this.desconto || 0));
});

// ═══════════════════════════════════════════════════════════
// 🔧 MÉTODOS DO CARRINHO
// ═══════════════════════════════════════════════════════════

/**
 * Adiciona um item ao carrinho
 * Apenas armazena produto, SKU e quantidade
 */
carrinhoSchema.methods.adicionarItem = function (produtoId, skuStyleMe, quantidade) {
    // Verifica se o item já existe
    const itemExistente = this.itens.find(item => item.skuStyleMe === skuStyleMe);

    if (itemExistente) {
        // Se existe, aumenta a quantidade
        itemExistente.quantidade += quantidade;
    } else {
        // Se não existe, adiciona um novo item
        this.itens.push({
            produto: produtoId,
            skuStyleMe,
            quantidade
        });
    }

    return this;
};

/**
 * Remove um item do carrinho pelo SKU
 */
carrinhoSchema.methods.removerItem = function (skuStyleMe) {
    this.itens = this.itens.filter(item => item.skuStyleMe !== skuStyleMe);
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
    return this;
};

/**
 * Limpa o carrinho (remove todos os itens)
 */
carrinhoSchema.methods.limpar = function () {
    this.itens = [];
    return this;
};

/**
 * Aplica desconto ao carrinho
 */
carrinhoSchema.methods.aplicarDesconto = function (valor) {
    this.desconto = Math.max(0, valor);
    return this;
};

const Carrinho = mongoose.models.Carrinho || mongoose.model('Carrinho', carrinhoSchema);

export default Carrinho;

