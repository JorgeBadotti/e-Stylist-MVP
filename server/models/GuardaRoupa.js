import mongoose from 'mongoose';

const { Schema } = mongoose;

const guardaRoupaSchema = new Schema({
    nome: {
        type: String,
        required: true,
        default: 'Meu Guarda-Roupa'
    },
    descricao: String,
    // Relacionamento: O guarda-roupa pertence a um Usuário
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    foto: {
        type: String, // URL da imagem no Cloudinary
        default: ''   // Pode começar sem foto
    },
    fotoPublicId: {
        type: String, // Importante guardar o ID para poder deletar a foto depois se precisar
        select: false // Opcional: esconde das consultas padrões para não poluir
    }
}, {
    timestamps: true // Cria automaticamente 'createdAt' e 'updatedAt'
});

const GuardaRoupa = mongoose.models.GuardaRoupa || mongoose.model('GuardaRoupa', guardaRoupaSchema);

export default GuardaRoupa;