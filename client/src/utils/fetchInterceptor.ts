/**
 * Interceptor de fetch para adicionar sessionId em todas requisições
 * e processar o header X-Session-Id nas respostas
 */

import { getSessionId, processResponseSessionHeader } from '../services/sessionService';

const originalFetch = window.fetch;

/**
 * Substituir window.fetch com versão que adiciona headers de sessão
 */
window.fetch = function (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> {
    const [resource, config] = args;

    // Garantir que config é um objeto
    const fetchConfig = (config || {}) as RequestInit;

    // Preparar headers
    fetchConfig.headers = {
        ...(fetchConfig.headers || {}),
    } as Record<string, string>;

    // Adicionar sessionId se existir
    const sessionId = getSessionId();
    const resourceStr = typeof resource === 'string' ? resource : resource.toString();

    if (sessionId) {
        (fetchConfig.headers as Record<string, string>)['X-Session-Id'] = sessionId;
        console.log(`🔐 [FetchInterceptor] ${resourceStr} → SessionId:`, sessionId.substring(0, 8) + '...');
    } else {
        console.log(`⚠️ [FetchInterceptor] ${resourceStr} → Nenhum sessionId disponível`);
    }

    // Fazer fetch original
    return originalFetch.call(window, resource, fetchConfig).then(
        (response: Response) => {
            // Processar header de resposta para obter novo sessionId se houver
            processResponseSessionHeader(response.headers);
            return response;
        },
        (error) => {
            console.error(`❌ [FetchInterceptor] Erro em ${resourceStr}:`, error);
            throw error;
        }
    );
} as typeof fetch;

console.log('✅ [FetchInterceptor] Interceptor de fetch ativado');


