import React, { useEffect, useState } from 'react';
import api from '../src/services/api';
import NovoGuardaRoupaModal from './NovoGuardaRoupa';
import DetalhesGuardaRoupa from './DetalheGuardaRoupa'; // Importe o novo componente

interface GuardaRoupa {
    _id: string;
    nome: string;
    descricao?: string;
}

const IndiceGuardaRoupas: React.FC = () => {
    // 1. Estado para controlar qual visão mostrar
    const [selectedGuardaRoupaId, setSelectedGuardaRoupaId] = useState<string | null>(null);

    // 2. Estados da Lista
    const [guardaRoupas, setGuardaRoupas] = useState<GuardaRoupa[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchGuardaRoupas = async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/guarda-roupas');
            setGuardaRoupas(response.data);
        } catch (error) {
            console.error("Erro ao buscar guarda-roupas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGuardaRoupas();
    }, []);

    // --- RENDERIZAÇÃO CONDICIONAL ---

    // SE TIVER UM ID SELECIONADO, MOSTRA OS DETALHES
    if (selectedGuardaRoupaId) {
        return (
            <DetalhesGuardaRoupa
                guardaRoupaId={selectedGuardaRoupaId}
                onBack={() => setSelectedGuardaRoupaId(null)} // Botão voltar limpa o ID
            />
        );
    }

    // SENÃO, MOSTRA A LISTA NORMAL
    if (loading) return <div className="p-8 text-center">Carregando guarda-roupas...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Meus Guarda-Roupas</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm"
                >
                    + Novo
                </button>
            </div>

            {guardaRoupas.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow border border-gray-100">
                    <p className="text-gray-500 mb-4">Você ainda não tem nenhum guarda-roupa cadastrado.</p>
                    <button onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
                        Criar o primeiro agora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {guardaRoupas.map((gr) => (
                        <div
                            key={gr._id}
                            onClick={() => setSelectedGuardaRoupaId(gr._id)} // CLIQUE AQUI ABRE DETALHES
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border border-gray-100 group"
                        >
                            <div className="flex justify-between items-start">
                                <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                    {gr.nome}
                                </h3>
                                {/* Ícone de seta indicando clique */}
                                <span className="text-gray-300 group-hover:text-blue-500">&rarr;</span>
                            </div>
                            <p className="text-gray-600 mt-2 text-sm">{gr.descricao || 'Sem descrição'}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL DE CRIAÇÃO */}
            <NovoGuardaRoupaModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchGuardaRoupas()}
            />
        </div>
    );
};

export default IndiceGuardaRoupas;