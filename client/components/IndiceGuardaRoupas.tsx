import React, { useEffect, useState } from 'react';
import api from '../src/services/api';
import NovoGuardaRoupaModal from './NovoGuardaRoupa';
import DetalhesGuardaRoupa from './DetalheGuardaRoupa';

interface GuardaRoupa {
    _id: string;
    nome: string;
    descricao?: string;
    foto?: string;
    isPublic?: boolean;
    usuario?: {
        _id: string;
        nome: string;
        foto?: string;
    };
}

const IndiceGuardaRoupas: React.FC = () => {
    const [selectedGuardaRoupaId, setSelectedGuardaRoupaId] = useState<string | null>(null);
    const [guardaRoupas, setGuardaRoupas] = useState<GuardaRoupa[]>([]);
    const [guardaRoupasPublicos, setGuardaRoupasPublicos] = useState<GuardaRoupa[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guardaRoupaEditando, setGuardaRoupaEditando] = useState<GuardaRoupa | null>(null);

    const fetchGuardaRoupas = async () => {
        setLoading(true);
        try {
            const [myResponse, publicResponse] = await Promise.all([
                api.get('/api/guarda-roupas'),
                api.get('/api/guarda-roupas/publicos/lista')
            ]);
            setGuardaRoupas(myResponse.data);
            setGuardaRoupasPublicos(publicResponse.data);
        } catch (error) {
            console.error("Erro ao buscar guarda-roupas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuardaRoupas();
    }, []);

    // Ação de Deletar
    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Impede de abrir os detalhes
        if (!window.confirm("Tem certeza que deseja excluir este guarda-roupa? Todas as roupas podem ser perdidas.")) return;

        try {
            await api.delete(`/api/guarda-roupas/${id}`);
            fetchGuardaRoupas();
        } catch (error) {
            console.error("Erro ao deletar", error);
            alert("Erro ao deletar guarda-roupa.");
        }
    };

    // Ação de Editar
    const handleEdit = (gr: GuardaRoupa, e: React.MouseEvent) => {
        e.stopPropagation(); // Impede de abrir os detalhes
        setGuardaRoupaEditando(gr); // Preenche o estado com os dados atuais
        setIsModalOpen(true);
    };

    // Abre modal limpo para Criar
    const handleCreateNew = () => {
        setGuardaRoupaEditando(null);
        setIsModalOpen(true);
    };

    if (selectedGuardaRoupaId) {
        return (
            <DetalhesGuardaRoupa
                guardaRoupaId={selectedGuardaRoupaId}
                onBack={() => setSelectedGuardaRoupaId(null)}
            />
        );
    }

    if (loading) return <div className="p-8 text-center">Carregando guarda-roupas...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* SEÇÃO: MEUS GUARDAROUPAS */}
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Meus Guarda-Roupas</h2>
                    <button
                        onClick={handleCreateNew}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
                    >
                        + Novo
                    </button>
                </div>

                {guardaRoupas.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-100">
                        <p className="text-gray-500 mb-4">Você ainda não tem nenhum guarda-roupa cadastrado.</p>
                        <button onClick={handleCreateNew} className="text-blue-600 hover:underline">
                            Criar o primeiro agora
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        {guardaRoupas.map((gr) => (
                            <div
                                key={gr._id}
                                onClick={() => setSelectedGuardaRoupaId(gr._id)}
                                className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-gray-100 group overflow-hidden relative"
                            >
                                {/* ÁREA DA FOTO */}
                                <div className="h-40 w-full bg-gray-100 relative">
                                    {gr.foto ? (
                                        <img
                                            src={gr.foto}
                                            alt={gr.nome}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <span className="text-4xl">🚪</span>
                                        </div>
                                    )}

                                    {/* BADGE DE VISIBILIDADE */}
                                    {gr.isPublic && (
                                        <div className="absolute top-2 left-2">
                                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                                🌐 Público
                                            </span>
                                        </div>
                                    )}

                                    {/* BOTÕES DE AÇÃO (Aparecem no hover) */}
                                    <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => handleEdit(gr, e)}
                                            className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 text-blue-600"
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(gr._id, e)}
                                            className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 text-red-600"
                                            title="Excluir"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {gr.nome}
                                    </h3>
                                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                        {gr.descricao || 'Sem descrição'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SEÇÃO: GUARDAROUPAS PÚBLICOS */}
            {guardaRoupasPublicos.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">🌐 Guarda-Roupas Públicos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {guardaRoupasPublicos.map((gr) => (
                            <div
                                key={gr._id}
                                onClick={() => setSelectedGuardaRoupaId(gr._id)}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-blue-100 group overflow-hidden relative"
                            >
                                {/* ÁREA DA FOTO */}
                                <div className="h-40 w-full bg-gray-100 relative">
                                    {gr.foto ? (
                                        <img
                                            src={gr.foto}
                                            alt={gr.nome}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-300">
                                            <span className="text-4xl">🚪</span>
                                        </div>
                                    )}

                                    {/* BADGE DO PROPRIETÁRIO */}
                                    <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-md">
                                        {gr.usuario?.foto ? (
                                            <img
                                                src={gr.usuario.foto}
                                                alt={gr.usuario.nome}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm">👤</span>
                                        )}
                                        <span className="text-xs font-semibold text-gray-700">
                                            {gr.usuario?.nome || 'Usuário'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {gr.nome}
                                    </h3>
                                    <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                                        {gr.descricao || 'Sem descrição'}
                                    </p>
                                    <div className="mt-3 pt-3 border-t border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium">
                                            👁️ Disponível para todos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <NovoGuardaRoupaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchGuardaRoupas()}
                guardaRoupaParaEditar={guardaRoupaEditando} // Passa os dados se for edição
            />
        </div>
    );
};

export default IndiceGuardaRoupas;