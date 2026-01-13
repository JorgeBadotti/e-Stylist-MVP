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
    }
}, {
    timestamps: true
});

const Roupa = mongoose.models.Roupa || mongoose.model('Roupa', roupaSchema);

export default Roupa;