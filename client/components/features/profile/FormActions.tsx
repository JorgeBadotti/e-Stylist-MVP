import React from 'react';

interface FormActionsProps {
    saving: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ saving }) => {
    return (
        <div className="flex justify-end pt-4">
            <button
                type="submit"
                disabled={saving}
                className={`px-6 py-2 rounded-md text-white font-medium ${saving
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
        </div>
    );
};
