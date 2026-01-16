import React, { useState, useEffect } from 'react';
import { getProdutoBySku } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';

interface ProdutoDetalheProps {
  sku: string;
  onBack: () => void;
}

const ProdutoDetalhe: React.FC<ProdutoDetalheProps> = ({ sku, onBack }) => {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setLoading(true);
        const data = await getProdutoBySku(sku);
        setProduto(data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar os detalhes do produto.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduto();
  }, [sku]);

  if (loading) return <p>Carregando detalhes...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!produto) return <p>Produto não encontrado.</p>;

  const placeholderImg = "https://via.placeholder.com/400";

  return (
    <div className="container mx-auto p-4">
      <button 
        onClick={onBack} 
        className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
      >
        &larr; Voltar ao Catálogo
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img 
            src={produto.fotos?.[0] || placeholderImg} 
            alt={produto.nome} 
            className="w-full rounded-lg shadow-lg"
          />
          {/* Miniaturas de outras fotos poderiam ir aqui */}
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-2">{produto.nome}</h1>
          <p className="text-gray-500 mb-4">SKU: {produto.sku}</p>
          <p className="text-3xl font-light text-blue-600 mb-4">R$ {produto.preco.toFixed(2)}</p>
          
          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Descrição</h3>
            <p className="text-gray-700">{produto.descricao}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-lg mb-2">Detalhes</h3>
            <ul className="list-disc list-inside text-gray-700">
              {produto.cor && <li>Cor: {produto.cor}</li>}
              {produto.tamanho && <li>Tamanho: {produto.tamanho}</li>}
              {produto.colecao && <li>Coleção: {produto.colecao}</li>}
              {produto.estilo && <li>Estilo: {produto.estilo}</li>}
              <li>Estoque: {produto.estoque}</li>
            </ul>
          </div>

          <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProdutoDetalhe;
