import axios from 'axios';
import { getSessionId, processResponseSessionHeader, storeSessionId } from './sessionService';

// 1. Adicione 'export' aqui para poder usar essa string em outros lugares
export const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_BACKEND_URL || '')
    : 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

// ✅ NOVO: Interceptor de requisição para adicionar sessionId
api.interceptors.request.use(
    (config) => {
        const sessionId = getSessionId();
        if (sessionId) {
            config.headers['X-Session-Id'] = sessionId;
            console.log(`🔐 [AxiosInterceptor] SessionId adicionado:`, sessionId.substring(0, 8) + '...');
        } else {
            console.log(`⚠️ [AxiosInterceptor] Nenhum sessionId disponível`);
        }
        return config;
    },
    (error) => {
        console.error('❌ [AxiosInterceptor] Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// ✅ NOVO: Interceptor de resposta para capturar novo sessionId
api.interceptors.response.use(
    (response) => {
        // Capturar header X-Session-Id da resposta
        const sessionId = response.headers['x-session-id'];
        if (sessionId) {
            console.log(`📥 [AxiosInterceptor] Novo sessionId recebido:`, sessionId.substring(0, 8) + '...');
            storeSessionId(sessionId);
        }
        return response;
    },
    (error) => {
        console.error('❌ [AxiosInterceptor] Erro na resposta:', error);
        return Promise.reject(error);
    }
);

// ✅ NOVO: Função para registrar como loja
export const registerStore = async (storeData: {
    nome: string;
    email: string;
    password: string;
    telefone: string;
    cnpj: string;
}) => {
    console.log('📝 [registerStore] Enviando dados:', storeData);
    try {
        const response = await api.post('/api/lojas/register', storeData);
        console.log('✅ [registerStore] Resposta do servidor:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ [registerStore] Erro na requisição:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export default api;
