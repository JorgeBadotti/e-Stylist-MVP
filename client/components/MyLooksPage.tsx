import React, { useState, useEffect } from 'react';
import ViewLook from './ViewLook';
import api from '../src/services/api';

interface LookItem {
    id: string;
    sku: string;
    nome: string;
    foto?: string;
    cor?: string;
    cor_codigo?: string;
    categoria?: string;
    tamanho?: string;
    skuStyleMe?: string;
    layer_role?: string;
    color_role?: string;
    fit?: string;
    style_base?: string;
    _deletado?: boolean;
}

interface Look {
    _id: string;
    nome: string;
    explicacao?: string;
    itens: LookItem[];
    afinidade_ia: number;
    imagem_visualizada?: string;
    data_visualizacao?: string;
    temVisualizacao: boolean;
    createdAt: string;
    escolhido_pelo_usuario?: boolean;
    score_relevancia?: number;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalLooks: number;
    limit: number;
}

const MyLooksPage: React.FC<{ onProductClick?: (sku: string) => void }> = ({ onProductClick }) => {
    const [looks, setLooks] = useState<Look[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLook, setSelectedLook] = useState<Look | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    // Buscar looks ao carregar ou mudar página
    useEffect(() => {
        fetchLooks(currentPage);
    }, [currentPage]);

    const fetchLooks = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            // ✅ NOVO: Usar api (Axios) em vez de fetch para enviar X-Session-Id
            const response = await api.get(`/api/looks?page=${page}&limit=12`);

            setLooks(response.data.looks);
            setPagination(response.data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao buscar looks');
            setLooks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewLook = async (look: Look) => {
        // Buscar detalhes completos do look com itens enriquecidos
        try {
            // ✅ NOVO: Usar api em vez de fetch
            const response = await api.get(`/api/looks/${look._id}`);

            setSelectedLook(response.data);
        } catch (err) {
            console.error('Erro ao buscar detalhes:', err);
            // Se falhar, usa os dados que já temos
            setSelectedLook(look);
        }
    };

    const handleCloseDetail = () => {
        setSelectedLook(null);
    };

    const handleGenerateNew = () => {
        handleCloseDetail();
        // Pode navegar para LooksPage se necessário
    };

    // Se um look foi selecionado para visualizar, mostrar o detalhe
    if (selectedLook) {
        return (
            <ViewLook
                lookName={selectedLook.nome}
                lookImage={selectedLook.imagem_visualizada || ''}
                lookExplanation={selectedLook.explicacao}
                lookItems={selectedLook.itens}
                onGenerateNew={handleGenerateNew}
                onBack={handleCloseDetail}
                isLoading={false}
                onProductClick={onProductClick}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white">Meus Looks</h1>
                            <p className="text-gray-400 mt-2">Visualize todos os looks gerados pela IA</p>
                        </div>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <div className="text-center">
                            <div className="inline-block">
                                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                            <p className="text-gray-400 mt-4">Carregando seus looks...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                        <p className="text-red-300">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && looks.length === 0 && !error && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Nenhum look ainda</h3>
                        <p className="text-gray-400 mb-8">Você ainda não gerou nenhum look. Crie seu primeiro look para vê-lo aqui!</p>
                        <a
                            href="/looks"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition"
                        >
                            Gerar Novo Look
                        </a>
                    </div>
                )}

                {/* Grid de Looks */}
                {!loading && looks.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                            {looks.map(look => (
                                <button
                                    key={look._id}
                                    onClick={() => handleViewLook(look)}
                                    className="group relative overflow-hidden rounded-2xl bg-slate-800 border border-slate-700 hover:border-purple-500/50 transition"
                                >
                                    {/* Imagem ou Placeholder */}
                                    <div className="relative w-full h-80 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
                                        {look.imagem_visualizada ? (
                                            <img
                                                src={look.imagem_visualizada}
                                                alt={look.nome}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <svg className="w-16 h-16 text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <p className="text-slate-500 text-sm">Visualização não gerada</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Badge de Status */}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {look.temVisualizacao && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                                                    <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs font-semibold text-green-300">Gerado</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Overlay hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end justify-center pb-4">
                                            <span className="text-white font-bold text-sm">Ver Detalhes →</span>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-5">
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition">
                                            {look.nome}
                                        </h3>

                                        <div className="space-y-3 text-sm">
                                            {/* Afinidade */}
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-gray-400">
                                                    {Math.round(look.afinidade_ia * 100)}% compatível
                                                </span>
                                            </div>

                                            {/* Itens */}
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                                                </svg>
                                                <span className="text-gray-400">
                                                    {look.itens.length} peças
                                                </span>
                                            </div>

                                            {/* Data */}
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v2h16V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="text-gray-400 text-xs">
                                                    {new Date(look.createdAt).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Paginação */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                >
                                    ← Anterior
                                </button>

                                <div className="flex gap-2">
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-10 h-10 rounded-lg font-bold transition ${currentPage === page
                                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 rounded-lg bg-slate-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition"
                                >
                                    Próxima →
                                </button>

                                <span className="text-gray-400 text-sm ml-4">
                                    Página {pagination.currentPage} de {pagination.totalPages} ({pagination.totalLooks} looks)
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyLooksPage;
