import React from 'react';
import { Produto } from '../../src/types/types';

interface ProdutoCardProps {
  produto: Produto;
  onCardClick: (sku: string) => void;
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({ produto, onCardClick }) => {
  const placeholderImg = "https://via.placeholder.com/300";

  // Usar a imagem do Cloudinary ou placeholder
  const imagemUrl = produto.foto && produto.foto.trim() ? produto.foto : placeholderImg;

  return (
    <div
      className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer hover:scale-105 transition-transform"
      onClick={() => onCardClick(produto.skuStyleMe)}
    >
      {/* Miniatura da Imagem */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
        <img
          src={imagemUrl}
          alt={produto.nome}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
      </div>

      {/* Informações do Produto */}
      <div className="p-4 bg-white">
        {/* Nome */}
        <h3 className="font-bold text-lg truncate mb-2">{produto.nome}</h3>

        {/* SKU STYLEME */}
        <p className="text-xs font-mono text-gray-700 mb-2 bg-gray-100 px-2 py-1 rounded">
          {produto.skuStyleMe}
        </p>

        {/* Atributos: Categoria, Linha, Cor Código */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-center">
          <div>
            <p className="text-gray-500 text-xs">Categoria</p>
            <p className="font-semibold text-gray-800">{produto.categoria || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Linha</p>
            <p className="font-semibold text-gray-800">{produto.linha || '-'}</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs">Cor</p>
            <p className="font-semibold text-gray-800">{produto.cor_codigo || '-'}</p>
          </div>
        </div>

        {/* Tamanho e Coleção */}
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Tamanho: {produto.tamanho || '-'}
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
            {produto.colecao || '-'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProdutoCard;
