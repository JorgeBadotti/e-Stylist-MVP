import Evento from '../models/Evento.js';
import Usuario from '../models/UsuarioModel.js';
import Look from '../models/LookModel.js';

/**
 * Service to manage the "Cognitive Stylist" logic.
 * Handles event tracking and profile evolution.
 */
class CognitiveProfileService {

    /**
     * Registra um evento de comportamento do usuário.
     * @param {string} userId - ID do usuário
     * @param {string} tipo - Tipo do evento (ex: 'view_look', 'reject_look')
     * @param {object} dados - Dados do evento (lookId, productId, etc.)
     * @param {string} sessaoId - ID da sessão (opcional)
     */
    async trackEvent(userId, tipo, dados = {}, sessaoId = null) {
        try {
            const evento = new Evento({
                userId,
                tipo,
                dados,
                sessaoId
            });
            await evento.save();

            // Trigger assíncrono para atualizar o perfil
            // Não esperamos a atualização terminar para não bloquear a resposta da API
            this.updateProfile(userId, evento).catch(err =>
                console.error(`[CognitiveProfile] Erro ao atualizar perfil do user ${userId}:`, err)
            );

            return evento;
        } catch (error) {
            console.error('[CognitiveProfile] Erro ao trackear evento:', error);
            throw error;
        }
    }

    /**
     * Atualiza o perfil cognitivo do usuário com base no novo evento.
     * Esta é a "engine" de aprendizado.
     */
    async updateProfile(userId, ultimoEvento) {
        const user = await Usuario.findById(userId);
        if (!user) return;

        // Lógica simplificada de aprendizado (MVP):
        // Se o usuário interagiu com um LOOK, atualizamos suas preferências de estilo.

        if (['like_look', 'save_look', 'reject_look', 'view_look'].includes(ultimoEvento.tipo)) {
            const lookId = ultimoEvento.dados.lookId || ultimoEvento.dados.id;
            if (!lookId) return;

            // Busca detalhes do look para saber o que o usuário gostou/desgostou
            // NOTA: Como o LookModel atual não tem "tags" de estilo explícitas salvas, 
            // vamos inferir ou usar metadados se existirem. 
            // Para este MVP, vamos assumir que podemos extrair algo do Look ou que passamos no evento.

            // Se o evento já trouxer metadados de estilo (o frontend pode mandar), usamos.
            // Caso contrário, teríamos que buscar no Look.
            const estiloDoLook = ultimoEvento.dados.style || 'casual'; // Fallback

            let impacto = 0;
            switch (ultimoEvento.tipo) {
                case 'save_look': impacto = 0.5; break;  // Muito forte
                case 'like_look': impacto = 0.3; break;  // Forte
                case 'view_look': impacto = 0.05; break; // Fraco (apenas interesse visual)
                case 'reject_look': impacto = -0.2; break; // Negativo
            }

            await this.updateStylePreference(user, estiloDoLook, impacto);
        }

        user.preferencias_aprendidas.estado_aprendizado.ultimo_evento_em = new Date();
        user.preferencias_aprendidas.estado_aprendizado.total_sinais += 1;

        await user.save();
    }

    /**
     * Atualiza o peso de um estilo específico nas preferências aprendidas
     */
    async updateStylePreference(user, estiloNome, impacto) {
        // Inicializa estrutura se não existir
        if (!user.preferencias_aprendidas) user.preferencias_aprendidas = {};
        if (!user.preferencias_aprendidas.estilos) user.preferencias_aprendidas.estilos = [];

        const estilos = user.preferencias_aprendidas.estilos;
        let estiloEntry = estilos.find(e => e.estilo === estiloNome);

        if (estiloEntry) {
            // Atualiza peso existente
            estiloEntry.peso += impacto;
            // Normaliza (clamp entre 0 e 1, ou permite negativo para aversão?)
            // Vamos manter entre 0 e 1 por enquanto para simplificar "afinidade"
            if (estiloEntry.peso > 1) estiloEntry.peso = 1;
            if (estiloEntry.peso < 0) estiloEntry.peso = 0;
        } else {
            // Novo estilo descoberto
            if (impacto > 0) {
                estilos.push({ estilo: estiloNome, peso: 0.1 + impacto });
            }
        }
    }

    /**
     * Retorna o contexto "inteligente" para o prompt do Gemini
     */
    async getSmartContext(userId) {
        const user = await Usuario.findById(userId);
        if (!user) return "";

        const prefs = user.preferencias_aprendidas;
        if (!prefs || !prefs.estilos || prefs.estilos.length === 0) {
            return "O usuário ainda não possui histórico de comportamento suficiente. Assuma um estilo versátil e exploratório.";
        }

        // Ordena estilos por peso
        const estilosFavoritos = prefs.estilos
            .sort((a, b) => b.peso - a.peso)
            .filter(e => e.peso > 0.3) // Apenas relevantes
            .map(e => `${e.estilo} (${Math.round(e.peso * 100)}% afinidade)`)
            .join(', ');

        return `Baseado no comportamento recente, o usuário demonstra forte afinidade com: ${estilosFavoritos}. Priorize sugestões que alinhem com essa estética, mas inclua 10% de variação para descoberta.`;
    }
}

export default new CognitiveProfileService();
