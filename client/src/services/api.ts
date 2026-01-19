import axios from 'axios';

// 1. Adicione 'export' aqui para poder usar essa string em outros lugares
export const API_BASE_URL = import.meta.env.PROD
    ? (import.meta.env.VITE_BACKEND_URL || '')
    : 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

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
