/**
 * Serviço para gerenciar sessionId anônima
 * Usa localStorage, sessionStorage e cookies como fallback
 */

const LOCAL_STORAGE_KEY = 'x-session-id';
const SESSION_STORAGE_KEY = 'x-session-id-tmp';

/**
 * Obter sessionId - tenta localStorage primeiro, depois sessionStorage
 */
export const getStoredSessionId = (): string | null => {
    try {
        // Tentar localStorage primeiro (persiste entre abas)
        const fromLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (fromLocal) {
            console.log(`📦 [SessionService] SessionId do localStorage:`, fromLocal.substring(0, 8) + '...');
            return fromLocal;
        }

        // Fallback para sessionStorage
        const fromSession = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (fromSession) {
            console.log(`📦 [SessionService] SessionId do sessionStorage:`, fromSession.substring(0, 8) + '...');
            return fromSession;
        }

        console.warn('⚠️ [SessionService] Nenhum sessionId encontrado no storage');
        return null;
    } catch (error) {
        console.error('❌ [SessionService] Erro ao ler sessionId:', error);
        return null;
    }
};

/**
 * Armazenar sessionId em AMBOS localStorage e sessionStorage
 */
export const storeSessionId = (sessionId: string): void => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, sessionId);
        sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
        console.log(`💾 [SessionService] SessionId armazenado:`, sessionId.substring(0, 8) + '...');
    } catch (error) {
        console.error('❌ [SessionService] Erro ao armazenar sessionId:', error);
    }
};

/**
 * Limpar sessionId
 */
export const clearSessionId = (): void => {
    try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        console.log('🗑️ [SessionService] SessionId removido');
    } catch (error) {
        console.error('❌ [SessionService] Erro ao limpar sessionId:', error);
    }
};

/**
 * Obter ou criar sessionId
 */
export const getSessionId = (): string | null => {
    return getStoredSessionId();
};

/**
 * Processar header X-Session-Id de uma resposta
 * Se receber um novo sessionId, armazenar
 */
export const processResponseSessionHeader = (headers: Headers): void => {
    try {
        const sessionId = headers.get('X-Session-Id');
        if (sessionId) {
            // Verificar se é diferente do atual
            const current = getStoredSessionId();
            if (current !== sessionId) {
                console.log(`🔄 [SessionService] Novo sessionId recebido no header, armazenando...`);
                storeSessionId(sessionId);
            }
        }
    } catch (error) {
        console.error('❌ [SessionService] Erro ao processar header de resposta:', error);
    }
};

