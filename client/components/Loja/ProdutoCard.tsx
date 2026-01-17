import React from 'react';
import { Produto } from '../../src/types/types';

interface ProdutoCardProps {
  produto: Produto;
  onCardClick: (sku: string) => void; // Adicionando a prop de clique
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onCardClick }) => {
  const placeholderImg = "https://via.placeholder.com/300"; // Imagem padrão

  return (
    <div 
      className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
      onClick={() => onCardClick(produto.sku)} // Adicionando o evento de clique
    >
      <img src={produto.fotos?.[0] || placeholderImg} alt={produto.nome} className="w-full h-64 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{produto.nome}</h3>
        <p className="text-gray-600 text-sm mb-2">SKU: {produto.sku}</p>
        <p className="text-lg font-semibold text-gray-800">R$ {(produto.preco || 0).toFixed(2)}</p>
      </div>
    </div>
  );
};

export default ProdutoCard;
