import React from 'react';

interface LoadingScreenProps {
    /**
     * Tipo de loading a renderizar
     * - 'loading': Tela padrão de carregamento
     * - 'redirecting': Tela de redirecionamento após cadastro/login
     */
    variant?: 'loading' | 'redirecting';
}

/**
 * LoadingScreen
 * Componente reutilizável para telas de carregamento
 * 
 * @param {LoadingScreenProps} props
 * @returns {React.ReactElement}
 * 
 * @example
 * // Tela de carregamento normal
 * <LoadingScreen />
 * 
 * @example
 * // Tela de redirecionamento
 * <LoadingScreen variant="redirecting" />
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({ variant = 'loading' }) => {
    const messages = {
        loading: 'Carregando...',
        redirecting: 'Entrando na plataforma...',
    };

    const message = messages[variant];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center">
                {/* Spinner Animation */}
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                {/* Mensagem */}
                <span className="text-gray-600 font-medium">{message}</span>
            </div>
        </div>
    );
};
