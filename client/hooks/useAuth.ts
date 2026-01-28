import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../src/services/api';
import { getSessionId } from '../src/services/sessionService';
import { UserData } from '../types/app.types';

interface UseAuthReturn {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    userData: UserData | null;
    setUserData: (value: UserData | null) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    fetchUserSession: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

/**
 * Hook de Autenticação
 * Encapsula toda a lógica de autenticação, sincronização com localStorage e chamadas à API
 * 
 * @returns {UseAuthReturn} Estados e funções relacionadas a autenticação
 */
export const useAuth = (): UseAuthReturn => {
    // Estados Globais de Autenticação
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const cached = localStorage.getItem('isAuthenticated');
        return cached ? JSON.parse(cached) : false;
    });

    const [userData, setUserData] = useState<UserData | null>(() => {
        const cached = localStorage.getItem('userData');
        return cached ? JSON.parse(cached) : null;
    });

    const [isLoading, setIsLoading] = useState<boolean>(true);

    /**
     * Busca a sessão do usuário do servidor e sincroniza com estado local
     */
    const fetchUserSession = async () => {
        try {
            // ✅ Garantir que tem sessionId antes de fazer requisições
            const sessionId = getSessionId();
            if (!sessionId) {
                console.log('📍 [useAuth] Nenhum sessionId, obtendo um novo do servidor...');
                try {
                    await api.head(`${API_BASE_URL}/auth/me`);
                } catch (e) {
                    console.log('📍 [useAuth] SessionId obtido do servidor');
                }
            }

            const response = await api.get('/auth/me');
            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setUserData(response.data.user);
                localStorage.setItem('isAuthenticated', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            } else {
                setIsAuthenticated(false);
                setUserData(null);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userData');
            }
        } catch (error) {
            console.error('Sessão inválida ou erro de rede:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Faz logout do usuário, limpa localStorage e reseta estado
     */
    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
            setUserData(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
        }
    };

    // Executa ao montar o componente para buscar sessão
    useEffect(() => {
        fetchUserSession();
    }, []);

    // Sincroniza isAuthenticated com localStorage
    useEffect(() => {
        localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    // Sincroniza userData com localStorage
    useEffect(() => {
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            localStorage.removeItem('userData');
        }
    }, [userData]);

    return {
        isAuthenticated,
        setIsAuthenticated,
        userData,
        setUserData,
        isLoading,
        setIsLoading,
        fetchUserSession,
        handleLogout,
    };
};
