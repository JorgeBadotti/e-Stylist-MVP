import React, { useState, useEffect } from 'react';
import ProdutoCard from './ProdutoCard';
import { getCatalogo, getProdutosLoja } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';

interface CatalogoProps {
  onProdutoSelect: (sku: string) => void;
  lojaId?: string; // ✅ NOVO: ID da loja para buscar produtos específicos
  refresh?: boolean; // ✅ Trigger para recarregar produtos
}

const Catalogo: React.FC<CatalogoProps> = ({ onProdutoSelect, lojaId, refresh }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table'); // ✅ Modo de visualização
  const [sortField, setSortField] = useState<string>('sku');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        let data: Produto[];

        if (lojaId) {
          // ✅ Se temos lojaId, busca produtos específicos da loja
          console.log(`🏪 [Catalogo] Buscando produtos da loja: ${lojaId}`);
          data = await getProdutosLoja(lojaId);
        } else {
          // Fallback: busca todas as lojas (antigo comportamento)
          console.log('🏪 [Catalogo] Buscando catálogo geral');
          data = await getCatalogo();
        }

        setProdutos(data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar produtos.');
        console.error('❌ [Catalogo] Erro:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [lojaId, refresh]); // ✅ Recarrega quando lojaId ou refresh muda

  // ✅ Ordenar produtos
  const sortedProdutos = [...produtos].sort((a, b) => {
    let aVal = a[sortField as keyof Produto];
    let bVal = b[sortField as keyof Produto];

    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortAsc ? -1 : 1;
    if (aVal > bVal) return sortAsc ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      {/* ✅ Botões de visualização */}
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            📋 Tabela
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            🎴 Cards
          </button>
        </div>
        <span className="text-sm text-gray-600">{produtos.length} produto(s)</span>
      </div>

      {/* ✅ Visualização em Tabela */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th
                  onClick={() => handleSort('sku')}
                  className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  SKU {sortField === 'sku' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('skuStyleMe')}
                  className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  SKU STYLEME {sortField === 'skuStyleMe' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('nome')}
                  className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  Nome {sortField === 'nome' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('categoria')}
                  className="px-4 py-3 text-left font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  Categoria {sortField === 'categoria' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('preco')}
                  className="px-4 py-3 text-right font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  Preço {sortField === 'preco' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('tamanho')}
                  className="px-4 py-3 text-center font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  Tamanho {sortField === 'tamanho' && (sortAsc ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('cor_codigo')}
                  className="px-4 py-3 text-center font-semibold text-sm cursor-pointer hover:bg-gray-200 select-none"
                >
                  Cor Código {sortField === 'cor_codigo' && (sortAsc ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-center font-semibold text-sm">Cor</th>
                <th className="px-4 py-3 text-center font-semibold text-sm">Ação</th>
              </tr>
            </thead>
            <tbody>
              {sortedProdutos.map((produto, idx) => (
                <tr
                  key={produto.sku}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-blue-600">
                    {produto.sku}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-purple-600">
                    {produto.skuStyleMe || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">{produto.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {produto.categoria || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    R$ {parseFloat(String(produto.preco || 0)).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {produto.tamanho || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-mono font-bold text-indigo-600">
                    {produto.cor_codigo || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    {produto.cor ? (
                      <span
                        className="inline-block w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{
                          backgroundColor: produto.cor.startsWith('#')
                            ? produto.cor
                            : '#cccccc',
                        }}
                        title={produto.cor}
                      />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <button
                      onClick={() => onProdutoSelect(produto.sku)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-xs font-medium"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Visualização em Grid (Cards) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <ProdutoCard
              key={produto.sku}
              produto={produto}
              onCardClick={onProdutoSelect}
            />
          ))}
        </div>
      )}

      {/* ✅ Sem produtos */}
      {produtos.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
};

export default Catalogo;
