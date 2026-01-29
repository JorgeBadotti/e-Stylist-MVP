import React from 'react';

interface FormMessagesProps {
    erro: string | null;
    sucesso: string | null;
}

export const FormMessages: React.FC<FormMessagesProps> = ({
    erro,
    sucesso
}) => {
    return (
        <>
            {erro && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">❌ Erro:</p>
                    <p className="text-red-600 text-sm mt-1">{erro}</p>
                </div>
            )}

            {sucesso && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">{sucesso}</p>
                </div>
            )}
        </>
    );
};
