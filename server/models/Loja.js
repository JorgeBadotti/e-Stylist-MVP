import mongoose from 'mongoose';

const { Schema } = mongoose;

const lojaSchema = new Schema({
    nome: {
        type: String,
        required: [true, 'O nome da loja é obrigatório.'],
    },
    cnpj: {
        type: String,
        required: [true, 'O CNPJ é obrigatório.'],
        unique: true,
    },
    telefone: {
        type: String,
        required: [true, 'O telefone/WhatsApp é obrigatório.'],
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    endereco: String,
    horarios: String,
    bio: String,
    logo: String,
    fotos: [String],
}, {
    timestamps: true
});

const Loja = mongoose.model('Loja', lojaSchema);

export default Loja;
