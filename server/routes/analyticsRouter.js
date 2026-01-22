import express from 'express';
import cognitiveProfileService from '../services/CognitiveProfileService.js';

const router = express.Router();

// Middleware para garantir que o usuário está autenticado
// (Dependendo da estratégia, podemos permitir tracking anônimo com session ID cookie, 
// mas para o MVP vamos focar em usuários logados)
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Se não logado, ainda retornamos sucesso, mas talvez logamos como 'anônimo' (TODO)
    res.status(401).json({ message: 'User not authenticated for tracking' });
};

/**
 * @route POST /api/analytics/track
 * @desc Receives behavioral events from the frontend
 */
router.post('/track', ensureAuthenticated, async (req, res) => {
    try {
        const { tipo, dados } = req.body;
        const userId = req.user._id;

        // Validação básica
        if (!tipo) {
            return res.status(400).json({ error: 'Event type is required' });
        }

        // Delega para o service (fire-and-forget para o cliente, mas await aqui para garantir persistência)
        const evento = await cognitiveProfileService.trackEvent(userId, tipo, dados);

        res.status(200).json({ success: true, eventId: evento._id });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

export default router;
