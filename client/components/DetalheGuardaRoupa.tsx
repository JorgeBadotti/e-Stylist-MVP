import React, { useEffect, useState } from 'react';
import api from '../src/services/api';

interface Roupa {
    _id: string;
    nome: string;
    categoria: string;
    cor: string;
    tamanho: string;
    tecido: string;
}

interface Props {
    guardaRoupaId: string;
    onBack: () => void; // Função para voltar para a lista
}

const DetalhesGuardaRoupa: React.FC<Props> = ({ guardaRoupaId, onBack }) => {
    const [roupas, setRoupas] = useState<Roupa[]>([]);
    const [guardaRoupaNome, setGuardaRoupaNome] = useState('');
    const [loading, setLoading] = useState(true);

    // Estado do Formulário de Nova Roupa
    const [showForm, setShowForm] = useState(false);
    const [newRoupa, setNewRoupa] = useState({
        nome: '',
        categoria: 'Camiseta', // Valor default
        cor: '',
        tamanho: '',
        tecido: ''
    });

    // Carregar dados
    const fetchData = async () => {
        try {
            // 1. Pega nome do guarda-roupa
            const grRes = await api.get(`/api/guarda-roupas/${guardaRoupaId}`);
            setGuardaRoupaNome(grRes.data.nome);

            // 2. Pega as roupas
            const roupasRes = await api.get(`/api/roupas/guarda-roupa/${guardaRoupaId}`);
            setRoupas(roupasRes.data);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar detalhes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [guardaRoupaId]);

    // Envio do formulário
    const handleAddRoupa = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/api/roupas', {
                ...newRoupa,
                guardaRoupaId // Importante: Vincular ao ID atual
            });
            // Limpar form e recarregar lista
            setNewRoupa({ nome: '', categoria: 'Camiseta', cor: '', tamanho: '', tecido: '' });
            setShowForm(false);
            fetchData(); // Recarrega as roupas
        } catch (error) {
            console.error(error);
            alert('Erro ao adicionar roupa');
        }
    };

    if (loading) return <div>Carregando detalhes...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header com Botão Voltar */}
            <button onClick={onBack} className="text-gray-500 hover:text-blue-600 mb-4 flex items-center">
                &larr; Voltar para Meus Armários
            </button>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{guardaRoupaNome}</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    {showForm ? 'Cancelar Adição' : '+ Adicionar Roupa'}
                </button>
            </div>

            {/* FORMULÁRIO DE ADIÇÃO (Condicional) */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-green-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">Nova Peça</h3>
                    <form onSubmit={handleAddRoupa} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Nome (ex: Camisa Social)"
                            className="border p-2 rounded"
                            value={newRoupa.nome}
                            onChange={e => setNewRoupa({ ...newRoupa, nome: e.target.value })}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={newRoupa.categoria}
                            onChange={e => setNewRoupa({ ...newRoupa, categoria: e.target.value })}
                        >
                            <option>Camiseta</option>
                            <option>Calça</option>
                            <option>Vestido</option>
                            <option>Casaco</option>
                            <option>Sapatos</option>
                            <option>Acessório</option>
                        </select>
                        <input
                            placeholder="Cor"
                            className="border p-2 rounded"
                            value={newRoupa.cor}
                            onChange={e => setNewRoupa({ ...newRoupa, cor: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <input
                                placeholder="Tamanho (P, M, 42)"
                                className="border p-2 rounded w-1/2"
                                value={newRoupa.tamanho}
                                onChange={e => setNewRoupa({ ...newRoupa, tamanho: e.target.value })}
                            />
                            <input
                                placeholder="Tecido (Algodão)"
                                className="border p-2 rounded w-1/2"
                                value={newRoupa.tecido}
                                onChange={e => setNewRoupa({ ...newRoupa, tecido: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                            Salvar Roupa
                        </button>
                    </form>
                </div>
            )}

            {/* LISTA DE ROUPAS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {roupas.map(roupa => (
                    <div key={roupa._id} className="bg-white rounded-lg shadow overflow-hidden group">
                        {/* Placeholder de imagem (futuramente será a foto real) */}
                        <div className="h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                            <span className="text-4xl">👕</span>
                        </div>
                        <div className="p-4">
                            <h4 className="font-bold text-lg">{roupa.nome}</h4>
                            <p className="text-sm text-gray-500">{roupa.categoria}</p>
                            <div className="mt-2 text-sm text-gray-600 space-y-1">
                                <p>Cor: {roupa.cor}</p>
                                <p>Tam: {roupa.tamanho}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {roupas.length === 0 && !showForm && (
                <div className="text-center text-gray-500 py-10">
                    Este guarda-roupa está vazio. Adicione sua primeira peça!
                </div>
            )}
        </div>
    );
};

export default DetalhesGuardaRoupa;