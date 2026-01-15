import mongoose from 'mongoose';

const { Schema } = mongoose;

const lookSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    // Identificador único da rodada de geração (para agrupar os 3 looks gerados juntos)
    batch_id: {
        type: String,
        required: true
    },
    nome: String,
    explicacao: String,

    // Lista de itens usados no look
    itens: [{
        id: String, // ID do item no banco (Roupa)
        nome: String,
        origem: String // 'closet' ou 'store'
    }],

    // Score dado pela IA
    afinidade_ia: Number,

    // --- AQUI ESTÁ O QUE VOCÊ PEDIU ---
    // Se o usuário clicou neste look, é true.
    escolhido_pelo_usuario: {
        type: Boolean,
        default: false
    },
    // Podemos ter um score numérico também para ordenação futura
    score_relevancia: {
        type: Number,
        default: 0 // 100 se escolhido, 0 se ignorado
    },

    // --- VISUALIZAÇÃO DO LOOK ---
    // URL da imagem gerada pela IA (resultado da visualização)
    imagem_visualizada: {
        type: String,
        default: null
    },
    // Public ID do Cloudinary para deleção futura
    imagem_visualizada_publicId: {
        type: String,
        default: null,
        select: false // Oculta por padrão
    },
    // Data de quando foi visualizado
    data_visualizacao: {
        type: Date,
        default: null
    },

    create_date: {
        type: Date,
        default: Date.now
    }
});

const Look = mongoose.models.Look || mongoose.model('Look', lookSchema);

export default Look;