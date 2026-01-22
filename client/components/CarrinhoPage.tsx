import React, { useState, useEffect } from 'react';
import api from '../src/services/api';

interface ProdutoDetalhes {
    _id: string;
    skuStyleMe: string;
    nome?: string;
    descricao?: string;
    foto?: string;
    preco?: number;
    tamanho?: string;
    cor?: string;
    cor_codigo?: string;
    categoria?: string;
}

interface CarrinhoItem {
    produto: ProdutoDetalhes | string; // Pode ser o objeto completo ou apenas o ID
    skuStyleMe: string;
    quantidade: number;
    data_adicao: string;
    tamanho?: string;
    cor?: string;
}

interface Carrinho {
    _id: string;
    usuario: string;
    loja: string;
    itens: CarrinhoItem[];
    subtotal: number;
    desconto: number;
    total: number;
    status: 'ativo' | 'abandonado' | 'finalizado' | 'cancelado';
    cupom?: string;
    createdAt: string;
    updatedAt: string;
}

const CarrinhoPage: React.FC<{ onProductClick?: (sku: string) => void }> = ({ onProductClick }) => {
    const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [removingItemId, setRemovingItemId] = useState<string | null>(null);
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

    useEffect(() => {
        fetchCarrinho();
    }, []);

    const fetchCarrinho = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Usar o novo endpoint que obtém ou cria o carrinho
            const response = await api.get('/api/carrinhos/meu-carrinho');

            if (response.data.carrinho) {
                setCarrinho(response.data.carrinho);
            } else {
                // Carrinho vazio ou não existe
                setCarrinho(null);
            }
        } catch (err: any) {
            console.error('Erro ao carregar carrinho:', err);
            setError(err.response?.data?.message || 'Erro ao carregar carrinho');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoverItem = async (carrinhoId: string, skuStyleMe: string) => {
        try {
            setRemovingItemId(skuStyleMe);
            await api.delete(`/api/carrinhos/${carrinhoId}/itens`, {
                data: { skuStyleMe }
            });
            // Recarregar carrinho após remover
            await fetchCarrinho();
        } catch (err: any) {
            console.error('Erro ao remover item:', err);
            setError(err.response?.data?.message || 'Erro ao remover item');
        } finally {
            setRemovingItemId(null);
        }
    };

    const handleAtualizarQuantidade = async (carrinhoId: string, skuStyleMe: string, novaQuantidade: number) => {
        if (novaQuantidade < 1) {
            handleRemoverItem(carrinhoId, skuStyleMe);
            return;
        }

        try {
            setUpdatingItemId(skuStyleMe);
            await api.put(`/api/carrinhos/${carrinhoId}/itens/quantidade`, {
                skuStyleMe,
                novaQuantidade
            });
            // Recarregar carrinho após atualizar
            await fetchCarrinho();
        } catch (err: any) {
            console.error('Erro ao atualizar quantidade:', err);
            setError(err.response?.data?.message || 'Erro ao atualizar quantidade');
        } finally {
            setUpdatingItemId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
                    <p className="text-gray-600">Carregando carrinho...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                        <p className="font-medium">Erro ao carregar</p>
                        <p className="text-sm mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Carrinho vazio ou não existe ainda
    if (!carrinho || carrinho.itens.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center py-12">
                        {/* Ícone do carrinho vazio */}
                        <div className="flex justify-center mb-6">
                            <svg className="h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 00-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.461 1.119 1.007zM8.25 16.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM15 16.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-bold text-gray-800 mb-3">Seu carrinho está vazio</h1>
                        <p className="text-gray-600 text-lg mb-8">
                            Não há produtos no seu carrinho. Comece a adicionar itens para prosseguir com a compra!
                        </p>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Voltar à Homepage
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Carrinho com itens
    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center gap-3 mb-6">
                    {/* Ícone de sacola (Heroicons: ShoppingBag) */}
                    <svg className="h-8 w-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 00-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.461 1.119 1.007zM8.25 16.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM15 16.5a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    <h1 className="text-3xl font-bold text-gray-800">Minhas Compras</h1>
                </div>

                {/* Lista de itens */}
                <div className="space-y-4 mb-8">
                    {carrinho.itens.map((item, index) => {
                        const produtoInfo = typeof item.produto === 'object' ? item.produto : null;
                        return (
                            <div key={index} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                {/* Foto do produto */}
                                <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                    {produtoInfo?.foto ? (
                                        <img src={produtoInfo.foto} alt={produtoInfo.skuStyleMe} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600">
                                            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Informações do produto */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        {/* Nome com link */}
                                        <div className="flex-1">
                                            <button
                                                onClick={() => {
                                                    if (onProductClick) {
                                                        onProductClick(item.skuStyleMe);
                                                    }
                                                }}
                                                className="text-lg font-semibold text-blue-600 hover:text-blue-800 hover:underline text-left"
                                            >
                                                {produtoInfo?.nome || item.skuStyleMe}
                                            </button>
                                            <p className="text-sm text-gray-500 mt-1">{item.skuStyleMe}</p>
                                        </div>

                                        {/* Preço */}
                                        <div className="text-right ml-4">
                                            <p className="text-sm text-gray-600">Unitário</p>
                                            <p className="text-lg font-semibold text-gray-900">R$ {(produtoInfo?.preco || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Atributos do produto */}
                                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                                        {produtoInfo?.tamanho && (
                                            <span className="px-2 py-1 bg-gray-100 rounded">Tamanho: {produtoInfo.tamanho}</span>
                                        )}
                                        {produtoInfo?.cor && (
                                            <span className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2">
                                                Cor: {produtoInfo.cor}
                                                {produtoInfo.cor_codigo && (
                                                    <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: produtoInfo.cor_codigo }}></div>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Quantidade e ações */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-700 font-medium">Quantidade:</span>
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => handleAtualizarQuantidade(carrinho._id, item.skuStyleMe, item.quantidade - 1)}
                                                    disabled={updatingItemId === item.skuStyleMe}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    −
                                                </button>
                                                <span className="px-4 py-1 font-semibold text-gray-900 border-x border-gray-300">{item.quantidade}</span>
                                                <button
                                                    onClick={() => handleAtualizarQuantidade(carrinho._id, item.skuStyleMe, item.quantidade + 1)}
                                                    disabled={updatingItemId === item.skuStyleMe}
                                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <span className="text-sm text-gray-600 ml-2">Subtotal: R$ {(item.quantidade * (produtoInfo?.preco || 0)).toFixed(2)}</span>
                                        </div>

                                        {/* Botão remover */}
                                        <button
                                            onClick={() => handleRemoverItem(carrinho._id, item.skuStyleMe)}
                                            disabled={removingItemId === item.skuStyleMe}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium disabled:opacity-50 transition-colors"
                                        >
                                            {removingItemId === item.skuStyleMe ? 'Removendo...' : 'Remover'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Resumo do carrinho */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-700 font-medium">Subtotal:</span>
                            <span className="text-gray-900 font-semibold">R$ {carrinho.subtotal.toFixed(2)}</span>
                        </div>
                        {carrinho.desconto > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700 font-medium">Desconto:</span>
                                <span className="text-green-600 font-semibold">-R$ {carrinho.desconto.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                            <span className="text-gray-900 font-bold text-lg">Total:</span>
                            <span className="text-blue-600 font-bold text-lg">R$ {carrinho.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Continuar Comprando
                    </button>
                    <button
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Finalizar Compra
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CarrinhoPage;
