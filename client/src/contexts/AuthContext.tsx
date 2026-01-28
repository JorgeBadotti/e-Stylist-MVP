import React, { createContext, useContext, ReactNode } from 'react';
import { UserData } from '../../types/app.types';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthContextType
 * Define a interface do contexto de autenticação
 */
export interface AuthContextType {
    // Estados
    isAuthenticated: boolean;
    userData: UserData | null;
    isLoading: boolean;
    // Funções
    setIsAuthenticated: (value: boolean) => void;
    setUserData: (value: UserData | null) => void;
    setIsLoading: (value: boolean) => void;
    fetchUserSession: () => Promise<void>;
    handleLogout: () => Promise<void>;
}

/**
 * AuthContext
 * Contexto global de autenticação
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider
 * Provider que encapsula toda a lógica de autenticação
 * Deve envolver a aplicação no nível mais alto (acima de Router)
 * 
 * @example
 * <AuthProvider>
 *   <Router>
 *     <App />
 *   </Router>
 * </AuthProvider>
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // ✅ Usar hook useAuth para toda lógica de autenticação
    const {
        isAuthenticated,
        setIsAuthenticated,
        userData,
        setUserData,
        isLoading,
        setIsLoading,
        fetchUserSession,
        handleLogout,
    } = useAuth();

    const value: AuthContextType = {
        // Estados
        isAuthenticated,
        userData,
        isLoading,
        // Funções
        setIsAuthenticated,
        setUserData,
        setIsLoading,
        fetchUserSession,
        handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * useAuthContext
 * Hook para consumir o contexto de autenticação em qualquer componente
 * 
 * @returns {AuthContextType} Contexto de autenticação
 * @throws {Error} Se usado fora de AuthProvider
 * 
 * @example
 * const { isAuthenticated, userData, handleLogout } = useAuthContext()
 */
export const useAuthContext = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext deve ser usado dentro de um AuthProvider');
    }
    return context;
};
