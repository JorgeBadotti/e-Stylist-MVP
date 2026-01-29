import React from 'react';

interface FormActionsProps {
    enviando: boolean;
    onCancel?: () => void;
    submitLabel?: string;
    cancelLabel?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
    enviando,
    onCancel,
    submitLabel = '✅ Criar Produto',
    cancelLabel = '❌ Cancelar'
}) => {
    return (
        <div className="flex gap-4 pt-4">
            <button
                type="submit"
                disabled={enviando}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
                {enviando ? '⏳ Criando...' : submitLabel}
            </button>

            {onCancel && (
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                    {cancelLabel}
                </button>
            )}
        </div>
    );
};
