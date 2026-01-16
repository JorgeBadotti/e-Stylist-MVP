import React, { useState, useEffect } from 'react';
import ProdutoCard from './ProdutoCard';
import { getCatalogo } from '../../src/services/lojaService';
import { Produto } from '../../src/types/types';

interface CatalogoProps {
  onProdutoSelect: (sku: string) => void;
}

const Catalogo: React.FC<CatalogoProps> = ({ onProdutoSelect }) => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        const data = await getCatalogo();
        setProdutos(data);
        setError(null);
      } catch (err) {
        setError('Falha ao carregar produtos.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

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
