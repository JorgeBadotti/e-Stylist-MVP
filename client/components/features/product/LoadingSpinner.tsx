import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    fullHeight?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Carregando dicionários...',
    fullHeight = true
}) => {
    return (
        <div className={`flex items-center justify-center ${fullHeight ? 'min-h-screen' : 'p-8'}`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{message}</p>
            </div>
        </div>
    );
};
