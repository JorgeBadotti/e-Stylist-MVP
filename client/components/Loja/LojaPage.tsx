import React from 'react';
import Catalogo from './Catalogo';

interface LojaPageProps {
  onProdutoSelect: (sku: string) => void;
}

const LojaPage: React.FC<LojaPageProps> = ({ onProdutoSelect }) => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Catálogo da Loja</h1>
      <Catalogo onProdutoSelect={onProdutoSelect} />
    </div>
  );
};

export default LojaPage;
