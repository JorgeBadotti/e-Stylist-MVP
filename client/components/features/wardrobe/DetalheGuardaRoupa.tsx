import React, { useEffect, useState, useRef } from 'react';
import api from '../../../src/services/api';
import { Produto } from '../../../src/types/types';

interface Roupa {
    _id: string;
    nome: string;
    cor: string;
    tamanho: string;
    material?: string;
    categoria?: string;
    foto?: string;
}

interface Props {
    guardaRoupaId: string;
    onBack: () => void;
}

const DetalhesGuardaRoupa: React.FC<Props> = ({ guardaRoupaId, onBack }) => {
    const [roupas, setRoupas] = useState<Roupa[]>([]);
    const [guardaRoupaNome, setGuardaRoupaNome] = useState('');
    const [guardaRoupaIsPublic, setGuardaRoupaIsPublic] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [loading, setLoading] = useState(true);
    const [togglingVisibility, setTogglingVisibility] = useState(false);

    // Controle do Formulário
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null); // Se null = Criando, Se string = Editando
    const [modoAdicionar, setModoAdicionar] = useState<'novo' | 'existente'>('novo'); // Toggle entre novo ou existente
    const [showSearchModal, setShowSearchModal] = useState(false);
    const formRef = useRef<HTMLDivElement>(null); // Para rolar até o form ao editar

    const [formData, setFormData] = useState({
        nome: '',
        categoria: 'Camiseta',
        cor: '',
        tamanho: '',
        tecido: ''
    });
    const [arquivoRoupa, setArquivoRoupa] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            const grRes = await api.get(`/api/guarda-roupas/${guardaRoupaId}`);
            setGuardaRoupaNome(grRes.data.nome);
            setGuardaRoupaIsPublic(grRes.data.isPublic || false);
            setIsOwner(grRes.data.isOwner || false);
            const produtosRes = await api.get(`/api/produtos/guarda-roupa/${guardaRoupaId}`);
            setRoupas(produtosRes.data);
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

    // Função para alternar visibilidade do guarda-roupa
    const handleToggleVisibility = async () => {
        setTogglingVisibility(true);
        try {
            await api.put(`/api/guarda-roupas/${guardaRoupaId}`, {
                isPublic: !guardaRoupaIsPublic
            });
            setGuardaRoupaIsPublic(!guardaRoupaIsPublic);
        } catch (error) {
            console.error("Erro ao alterar visibilidade:", error);
            alert("Erro ao alterar visibilidade do guarda-roupa");
        } finally {
            setTogglingVisibility(false);
        }
    };

    // Prepara o formulário para EDIÇÃO
    const handleEditClick = (roupa: Roupa) => {
        setEditingId(roupa._id);
        setFormData({
            nome: roupa.nome,
            categoria: roupa.categoria || 'Camiseta',
            cor: roupa.cor || '',
            tamanho: roupa.tamanho || '',
            tecido: roupa.material || ''
        });
        setArquivoRoupa(null); // Reseta arquivo (usuário só põe se quiser trocar)
        setShowForm(true);

        // Rola a tela até o formulário
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Reseta o formulário
    const resetForm = () => {
        setFormData({ nome: '', categoria: 'Camiseta', cor: '', tamanho: '', tecido: '' });
        setArquivoRoupa(null);
        setEditingId(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setShowForm(false);
    };

    // Submissão (Serve tanto para Criar quanto para Editar)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = new FormData();
            payload.append('nome', formData.nome);
            payload.append('cor', formData.cor);
            payload.append('tamanho', formData.tamanho);
            payload.append('material', formData.tecido); // Mapeando tecido para material
            payload.append('sku', `${formData.nome}-${Date.now()}`); // Gera um SKU único

            // Só manda o ID do guarda-roupa se for criação nova (opcional no update, mas mal não faz)
            if (!editingId) {
                payload.append('guardaRoupaId', guardaRoupaId);
            }

            if (arquivoRoupa) {
                payload.append('foto', arquivoRoupa);
            }

            if (editingId) {
                // --- MODO EDIÇÃO (PUT) ---
                await api.put(`/api/produtos/${editingId}`, payload);
            } else {
                // --- MODO CRIAÇÃO (POST) ---
                await api.post('/api/produtos', payload);
            }

            resetForm();
            fetchData();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert('Erro ao salvar roupa.');
        }
    };

    // Função de Deletar
    const handleDelete = async (id: string) => {
        console.log("handleDelete chamado com ID:", id);
        if (!window.confirm("Tem certeza que deseja excluir esta peça?")) return;

        try {
            console.log("Enviando DELETE para /api/produtos/" + id);
            const response = await api.delete(`/api/produtos/${id}`);
            console.log("Resposta DELETE:", response.data);

            // --- MUDANÇA AQUI ---
            // Se o usuário estiver editando justamente a peça que acabou de excluir,
            // fechamos o formulário e limpamos os estados.
            if (editingId === id) {
                resetForm();
            }
            // --------------------

            fetchData(); // Recarrega a lista
            alert("Peça removida com sucesso!");
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao deletar roupa: " + (error as any)?.response?.data?.message || (error as any).message);
        }
    };

    // Função para associar um produto EXISTENTE ao guarda-roupa
    const handleAddExistingProduto = async (skuStyleMe: string) => {
        try {
            await api.post(`/api/guarda-roupas/${guardaRoupaId}/produtos/${skuStyleMe}`);
            setShowSearchModal(false);
            setModoAdicionar('novo');
            resetForm();
            fetchData(); // Recarrega a lista
        } catch (error) {
            console.error("Erro ao adicionar produto:", error);
            alert('Erro ao adicionar o produto ao guarda-roupa.');
        }
    };

    if (loading) return <div>Carregando detalhes...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <button onClick={onBack} className="text-gray-500 hover:text-blue-600 mb-4 flex items-center">
                &larr; Voltar para Meus Armários
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold text-gray-800">{guardaRoupaNome}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleToggleVisibility}
                            disabled={togglingVisibility || !isOwner}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${!isOwner
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                                : guardaRoupaIsPublic
                                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                            title={
                                !isOwner
                                    ? 'Você não pode alterar a visibilidade de um guarda-roupa que não é seu'
                                    : guardaRoupaIsPublic
                                        ? 'Clique para tornar privado'
                                        : 'Clique para tornar público'
                            }
                        >
                            {togglingVisibility ? '...' : guardaRoupaIsPublic ? '🌐 Público' : '🔒 Privado'}
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            setModoAdicionar('novo');
                            if (showForm && modoAdicionar === 'novo') resetForm();
                            else setShowForm(true);
                        }}
                        disabled={!isOwner}
                        title={isOwner ? 'Criar um novo produto' : 'Você não pode editar este guarda-roupa'}
                        className={`px-4 py-2 rounded text-white font-semibold transition ${showForm && modoAdicionar === 'novo'
                            ? 'bg-gray-500 hover:bg-gray-600'
                            : isOwner
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-gray-400 cursor-not-allowed opacity-60'
                            }`}
                    >
                        {showForm && modoAdicionar === 'novo' ? 'Cancelar' : '✏️ Novo Produto'}
                    </button>
                    <button
                        onClick={() => {
                            setModoAdicionar('existente');
                            setShowSearchModal(true);
                        }}
                        disabled={!isOwner}
                        title={isOwner ? 'Adicionar um produto existente' : 'Você não pode editar este guarda-roupa'}
                        className={`px-4 py-2 rounded text-white font-semibold transition ${isOwner
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed opacity-60'
                            }`}
                    >
                        🔍 Produto Existente
                    </button>
                </div>
            </div>

            {!isOwner && !showForm && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    ℹ️ Este é um guarda-roupa público. Você pode visualizar as peças mas não pode editar.
                </div>
            )}

            {showForm && (
                <div ref={formRef} className="bg-white p-6 rounded-lg shadow-md mb-8 border border-green-100 animate-fade-in-down">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700">
                        {editingId ? 'Editar Peça' : 'Nova Peça'}
                    </h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            placeholder="Nome (ex: Camisa Social)"
                            className="border p-2 rounded"
                            value={formData.nome}
                            onChange={e => setFormData({ ...formData, nome: e.target.value })}
                            required
                        />
                        <input
                            placeholder="Cor"
                            className="border p-2 rounded"
                            value={formData.cor}
                            onChange={e => setFormData({ ...formData, cor: e.target.value })}
                        />
                        <div className="flex gap-2">
                            <input
                                placeholder="Tam"
                                className="border p-2 rounded w-1/2"
                                value={formData.tamanho}
                                onChange={e => setFormData({ ...formData, tamanho: e.target.value })}
                            />
                            <input
                                placeholder="Tecido"
                                className="border p-2 rounded w-1/2"
                                value={formData.tecido}
                                onChange={e => setFormData({ ...formData, tecido: e.target.value })}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-600 mb-1">
                                {editingId ? 'Trocar Foto (Opcional)' : 'Foto da Peça'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => setArquivoRoupa(e.target.files ? e.target.files[0] : null)}
                                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                        </div>

                        <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold transition-colors">
                            {editingId ? 'Salvar Alterações' : 'Criar Roupa'}
                        </button>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {roupas.map(roupa => (
                    <div key={roupa._id} className="bg-white rounded-lg shadow overflow-hidden group flex flex-col">
                        <div className="h-64 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                            {roupa.foto ? (
                                <img
                                    src={roupa.foto}
                                    alt={roupa.nome}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <span className="text-4xl text-gray-300">👕</span>
                            )}

                            {/* OVERLAY DE AÇÕES (Aparece ao passar o mouse) */}
                            {isOwner && (
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(roupa); }}
                                        className="bg-white text-blue-600 p-2 rounded-full hover:bg-blue-50 shadow-lg"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(roupa._id); }}
                                        className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 shadow-lg"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 flex-grow">
                            <h4 className="font-bold text-lg text-gray-800">{roupa.nome}</h4>
                            <p className="text-sm text-blue-600 font-medium mb-2">{roupa.categoria}</p>

                            <div className="flex flex-wrap gap-2 mt-2">
                                {roupa.tamanho && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        Tam: {roupa.tamanho}
                                    </span>
                                )}
                                {roupa.cor && (
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {roupa.cor}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {roupas.length === 0 && !showForm && (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="mb-2">Este guarda-roupa está vazio.</p>
                    <button onClick={() => setShowForm(true)} className="text-blue-600 font-semibold hover:underline">
                        Adicione sua primeira peça agora!
                    </button>
                </div>
            )}

            {/* MODAL DE BUSCA DE PRODUTOS EXISTENTES */}
            {showSearchModal && (
                <SearchProdutosModal
                    guardaRoupaId={guardaRoupaId}
                    onSelectProduto={handleAddExistingProduto}
                    onClose={() => setShowSearchModal(false)}
                />
            )}
        </div>
    );
};

// ========== COMPONENTE MODAL DE BUSCA DE PRODUTOS ==========
interface SearchProdutosModalProps {
    guardaRoupaId: string;
    onSelectProduto: (skuStyleMe: string) => void;
    onClose: () => void;
}

const SearchProdutosModal: React.FC<SearchProdutosModalProps> = ({ guardaRoupaId, onSelectProduto, onClose }) => {
    const [produtos, setProdutos] = useState<Produto[]>([]);
    const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategoria, setFilterCategoria] = useState<string>('');
    const [sortField, setSortField] = useState<string>('skuStyleMe');
    const [sortAsc, setSortAsc] = useState(true);

    useEffect(() => {
        const fetchProdutos = async () => {
            try {
                const res = await api.get(`/api/produtos/disponiveis/${guardaRoupaId}`);
                setProdutos(res.data);
                setFilteredProdutos(res.data);
            } catch (error) {
                console.error('Erro ao buscar produtos disponíveis:', error);
                alert('Erro ao carregar produtos disponíveis');
            } finally {
                setLoading(false);
            }
        };
        fetchProdutos();
    }, [guardaRoupaId]);

    // Filtrar e ordenar produtos
    useEffect(() => {
        let filtered = produtos.filter(p => {
            const matchesSearch = p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.skuStyleMe?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategoria = !filterCategoria || p.categoria === filterCategoria;
            return matchesSearch && matchesCategoria;
        });

        // Ordenar
        filtered.sort((a, b) => {
            let aVal = a[sortField as keyof Produto];
            let bVal = b[sortField as keyof Produto];

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (aVal < bVal) return sortAsc ? -1 : 1;
            if (aVal > bVal) return sortAsc ? 1 : -1;
            return 0;
        });

        setFilteredProdutos(filtered);
    }, [searchTerm, filterCategoria, sortField, sortAsc, produtos]);

    const categorias = Array.from(new Set(produtos.map(p => p.categoria).filter(Boolean)));

    if (loading) return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8">Carregando produtos...</div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Selecionar Produto Existente</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Barra de busca */}
                    <div className="flex gap-4 flex-col md:flex-row">
                        <input
                            type="text"
                            placeholder="Buscar por nome ou SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas as categorias</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tabela de produtos */}
                    {filteredProdutos.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            {produtos.length === 0
                                ? 'Nenhum produto disponível.'
                                : 'Nenhum produto corresponde aos filtros.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-sm">Imagem</th>
                                        <th
                                            onClick={() => {
                                                if (sortField === 'skuStyleMe') setSortAsc(!sortAsc);
                                                else { setSortField('skuStyleMe'); setSortAsc(true); }
                                            }}
                                            className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                                        >
                                            SKU {sortField === 'skuStyleMe' && (sortAsc ? '↑' : '↓')}
                                        </th>
                                        <th
                                            onClick={() => {
                                                if (sortField === 'nome') setSortAsc(!sortAsc);
                                                else { setSortField('nome'); setSortAsc(true); }
                                            }}
                                            className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                                        >
                                            Nome {sortField === 'nome' && (sortAsc ? '↑' : '↓')}
                                        </th>
                                        <th className="px-4 py-3 text-center font-semibold text-sm">Categoria</th>
                                        <th className="px-4 py-3 text-center font-semibold text-sm">Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProdutos.map(produto => (
                                        <tr key={produto._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                {produto.foto ? (
                                                    <img
                                                        src={produto.foto}
                                                        alt={produto.nome}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                                                        👕
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 font-mono text-sm text-gray-700">{produto.skuStyleMe}</td>
                                            <td className="px-4 py-3 text-gray-700">{produto.nome}</td>
                                            <td className="px-4 py-3 text-center text-sm text-gray-600">{produto.categoria}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => onSelectProduto(produto.skuStyleMe || '')}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-semibold transition"
                                                >
                                                    Adicionar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DetalhesGuardaRoupa;