import React, { useState } from 'react';
import api from '../src/services/api';

interface NovoGuardaRoupaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para recarregar a lista após criar
}

const NovoGuardaRoupaModal: React.FC<NovoGuardaRoupaModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/guarda-roupas', { nome, descricao });
            setNome('');
            setDescricao('');
            onSuccess(); // Fecha e atualiza
            onClose();
        } catch (error) {
            console.error("Erro ao criar", error);
            alert("Erro ao criar guarda-roupa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4">Novo Guarda-Roupa</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Nome</label>
                        <input
                            type="text"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            placeholder="Ex: Armário de Inverno"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Roupas pesadas e casacos"
                        />
                    </div>

                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Criando...' : 'Criar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NovoGuardaRoupaModal;