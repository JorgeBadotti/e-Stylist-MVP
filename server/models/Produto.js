import mongoose from 'mongoose';

const { Schema } = mongoose;

const produtoSchema = new Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    cor: {
        type: String
    },
    tamanho: {
        type: String
    },
    material: {
        type: String
    },
    foto: {
        type: String,
        default: ''
    },
    fotoPublicId: {
        type: String,
        select: false
    },
    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // Referência ao GuardaRoupa (coleção do usuário) - opcional
    guardaRoupaId: {
        type: Schema.Types.ObjectId,
        ref: 'GuardaRoupa',
        default: null
    },
    // Referência à Loja - opcional
    lojaId: {
        type: Schema.Types.ObjectId,
        ref: 'Loja',
        default: null
    }
}, {
    timestamps: true
});

const Produto = mongoose.models.Produto || mongoose.model('Produto', produtoSchema);

export default Produto;
