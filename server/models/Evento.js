import mongoose from 'mongoose';

const { Schema } = mongoose;

const eventoSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        index: true
    },
    sessaoId: {
        type: String,
        default: null, // Pode ser usado para agrupar eventos de uma mesma sessão
        index: true
    },
    tipo: {
        type: String,
        required: true,
        enum: [
            'view_look',        // Viu um look
            'like_look',        // Gostou do look (implícito ou explícito)
            'reject_look',      // Rejeitou o look
            'save_look',        // Salvou o look
            'click_item',       // Clicou num item do look
            'view_item',        // Viu detalhes do item
            'add_to_cart',      // Adicionou ao carrinho (intenção forte)
            'purchase',         // Comprou
            'search_query',     // Buscou algo
            'filter_change',    // Mudou filtros
            'app_open',         // Abriu o app
            'profile_update'    // Atualizou perfil manualmente
        ]
    },
    dados: {
        type: Schema.Types.Mixed, // Flexível para guardar lookId, productId, termos de busca, etc.
        default: {}
    },
    metadata: {
        device: String,
        platform: String,
        screen_size: String,
        source: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// TTL Index: Opcional, se quisermos deletar eventos muito antigos (ex: após 1 ano)
// eventoSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

const Evento = mongoose.models.Evento || mongoose.model('Evento', eventoSchema);

export default Evento;
