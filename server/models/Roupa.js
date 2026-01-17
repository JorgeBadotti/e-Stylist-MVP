import mongoose from 'mongoose';

const { Schema } = mongoose;

const roupaSchema = new Schema({
    nome: {
        type: String,
        required: true
    },
    categoria: {
        type: String,
        required: true,
    },
    cor: { type: String },
    tamanho: { type: String },
    tecido: { type: String },

    // --- IMAGEM ---
    foto: {
        type: String, // URL pública (https://res.cloudinary...)
        default: ''
    },
    fotoPublicId: {
        type: String, // ID para deleção (ex: roupas/abc12345)
        select: false // Oculta por padrão para não poluir o retorno
    },

    guardaRoupa: {
        type: Schema.Types.ObjectId,
        ref: 'GuardaRoupa',
        required: true
    },

    // --- STATUS E VENDA C2C ---
    status: {
        type: String,
        enum: ['ativo', 'venda', 'doado'],
        default: 'ativo'
    },
    precoVenda: {
        type: Number,
        default: null,
        // Validador para garantir que o preço só seja definido se o status for 'venda'
        validate: {
            validator: function(value) {
                // Permite nulo se não estiver à venda
                if (this.status !== 'venda') {
                    return true;
                }
                // Exige um valor se estiver à venda
                return value != null && value > 0;
            },
            message: 'O preço de venda é obrigatório quando a peça está à venda e deve ser maior que zero.'
        }
    }
}, {
    timestamps: true
});

// Middleware para limpar o precoVenda se o status não for 'venda'
roupaSchema.pre('save', function() {
    if (this.status !== 'venda') {
        this.precoVenda = null;
    }
    // Retorna uma Promise ao invés de chamar next()
    return Promise.resolve();
});

const Roupa = mongoose.models.Roupa || mongoose.model('Roupa', roupaSchema);

export default Roupa;