import React, { useState, useEffect, useRef } from 'react';
import api from '../src/services/api';

// Interface do objeto para edição
interface GuardaRoupaData {
    _id?: string;
    nome: string;
    descricao?: string;
    isPublic?: boolean;
}

interface NovoGuardaRoupaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    guardaRoupaParaEditar?: GuardaRoupaData | null; // Se vier preenchido, é edição
}

const NovoGuardaRoupaModal: React.FC<NovoGuardaRoupaModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
    guardaRoupaParaEditar
}) => {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [arquivo, setArquivo] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Efeito para preencher o formulário quando entrar em modo edição
    useEffect(() => {
        if (guardaRoupaParaEditar) {
            setNome(guardaRoupaParaEditar.nome);
            setDescricao(guardaRoupaParaEditar.descricao || '');
            setIsPublic(guardaRoupaParaEditar.isPublic || false);
        } else {
            // Limpa se for criação nova
            setNome('');
            setDescricao('');
            setIsPublic(false);
        }
        setArquivo(null); // Arquivo sempre começa vazio
    }, [guardaRoupaParaEditar, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('descricao', descricao);
            formData.append('isPublic', String(isPublic));
            if (arquivo) {
                formData.append('foto', arquivo);
            }

            if (guardaRoupaParaEditar?._id) {
                // MODO EDIÇÃO
                await api.put(`/api/guarda-roupas/${guardaRoupaParaEditar._id}`, formData);
            } else {
                // MODO CRIAÇÃO
                await api.post('/api/guarda-roupas', formData);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Erro ao salvar", error);
            alert("Erro ao salvar guarda-roupa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl animate-fade-in-down">
                <h2 className="text-xl font-bold mb-4">
                    {guardaRoupaParaEditar ? 'Editar Guarda-Roupa' : 'Novo Guarda-Roupa'}
                </h2>

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

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Descrição</label>
                        <textarea
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={descricao}
                            onChange={(e) => setDescricao(e.target.value)}
                            placeholder="Ex: Roupas pesadas e casacos"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            {guardaRoupaParaEditar ? 'Trocar Capa (Opcional)' : 'Foto de Capa (Opcional)'}
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={(e) => setArquivo(e.target.files ? e.target.files[0] : null)}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="mb-6 flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor="isPublic" className="text-gray-700 font-medium cursor-pointer">
                            🌐 Tornar este guarda-roupa público
                        </label>
                    </div>
                    {isPublic && (
                        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                            ✓ Este guarda-roupa será visível para todos os usuários e poderá ser usado para gerar looks.
                        </div>
                    )}

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
                            {loading ? 'Salvando...' : (guardaRoupaParaEditar ? 'Salvar Alterações' : 'Criar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NovoGuardaRoupaModal;