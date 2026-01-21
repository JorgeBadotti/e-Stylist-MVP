import React, { useState, useEffect } from 'react';
import api from '../src/services/api';

interface CarrinhoItem {
    produto: string;
    skuStyleMe: string;
    quantidade: number;
    preco_unitario: number;
    subtotal: number;
    data_adicao: string;
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

const CarrinhoPage: React.FC = () => {
    const [carrinho, setCarrinho] = useState<Carrinho | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">🛒 Meu Carrinho</h1>

                {/* Tabela de itens */}
                <div className="overflow-x-auto mb-8">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantidade</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Subtotal</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {carrinho.itens.map((item, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">{item.skuStyleMe}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm text-gray-600">{item.quantidade}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm text-gray-600">R$ {item.preco_unitario.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p className="text-sm font-medium text-gray-900">R$ {item.subtotal.toFixed(2)}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
