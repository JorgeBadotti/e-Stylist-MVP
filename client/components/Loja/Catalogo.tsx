import React, { useState, useEffect } from 'react';
import ProdutoCard from './ProdutoCard';
import { getCatalogo, getProdutosLoja } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';

interface CatalogoProps {
  onProdutoSelect: (sku: string) => void;
  lojaId?: string; // ✅ NOVO: ID da loja para buscar produtos específicos
}

const Catalogo: React.FC<CatalogoProps> = ({ onProdutoSelect, lojaId }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, [lojaId]); // ✅ Recarrega quando lojaId muda

  if (loading) return <p>Carregando produtos...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {produtos.map((produto) => (
        <ProdutoCard
          key={produto.sku}
          produto={produto}
          onCardClick={onProdutoSelect}
        />
      ))}
    </div>
  );
};

export default Catalogo;
