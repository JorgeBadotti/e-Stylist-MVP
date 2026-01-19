import mongoose from 'mongoose';

const { Schema } = mongoose;

const conviteSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    loja: {
        type: Schema.Types.ObjectId,
        ref: 'Loja',
        required: true
    },
    email: {
        type: String,
        required: true // Armazenado para referência
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    mensagem: {
        type: String,
        default: '' // Mensagem opcional do STORE_ADMIN ao convidar
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    respondidoEm: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Índice para evitar duplicatas: um usuário não pode ter dois convites pendentes da mesma loja
conviteSchema.index({ usuario: 1, loja: 1, status: 1 }, { unique: true, sparse: true });

const Convite = mongoose.models.Convite || mongoose.model('Convite', conviteSchema);

export default Convite;
