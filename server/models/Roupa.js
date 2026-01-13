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
        // Opcional: Você pode limitar as categorias aceitas usando 'enum'
        // enum: ['Camiseta', 'Calça', 'Vestido', 'Casaco', 'Acessório']
    },
    cor: {
        type: String
    },
    tamanho: {
        type: String // String é melhor que Number aqui para aceitar 'M', 'G', '42', etc.
    },
    tecido: {
        type: String
    },
    foto: {
        type: String // Caso queira salvar a URL de uma imagem da roupa depois
    },
    // Relacionamento: A roupa está dentro de um Guarda-Roupa específico
    guardaRoupa: {
        type: Schema.Types.ObjectId,
        ref: 'GuardaRoupa',
        required: true
    }
}, {
    timestamps: true // Cria automaticamente 'createdAt' e 'updatedAt'
});

const Roupa = mongoose.models.Roupa || mongoose.model('Roupa', roupaSchema);

export default Roupa;