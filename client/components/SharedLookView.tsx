import React from 'react';
import { Look, LookItem } from '../types';
import Button from './Button';

interface SharedLookViewProps {
  look: Look;
  onBack: () => void;
}

const SharedLookView: React.FC<SharedLookViewProps> = ({ look, onBack }) => {
  // Imagem de manequim padrão (sempre a mesma para compartilhamento público/privado sem foto de cliente)
  const mannequinImageUrl = 'https://i.imgur.com/rS0rFjP.png'; // Exemplo de URL de imagem de manequim

  // Função auxiliar para obter a imagem de um item (usada para o LookCard mas aqui só mannequin)
  const getImageUrl = (category: string) => {
    switch (category.toLowerCase()) {
      case 'blusa':
        return 'https://picsum.photos/400/250?random=1';
      case 'calça':
        return 'https://picsum.photos/400/250?random=2';
      case 'casaco':
        return 'https://picsum.photos/400/250?random=3';
      case 'calçado':
        return 'https://picsum.photos/400/250?random=4';
      case 'vestido':
        return 'https://picsum.photos/400/250?random=5';
      case 'acessório':
        return 'https://picsum.photos/400/250?random=6';
      case 'saia':
        return 'https://picsum.photos/400/250?random=10';
      default:
        return 'https://picsum.photos/400/250?random=7'; // Generic image
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col relative">
        <div className="relative">
          <img
            src={mannequinImageUrl}
            alt="Manequim padrão"
            className="w-full h-96 object-cover object-top"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
            <h1 className="text-4xl font-extrabold text-white leading-tight drop-shadow-lg">
              {look.title}
            </h1>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <p className="text-lg text-gray-600 mb-4">
            Formalidade: <span className="font-semibold text-blue-700">{look.formalidade_calculada}</span>
          </p>

          <div className="mb-4" role="group" aria-labelledby={`look-items-${look.look_id}`}>
            <p id={`look-items-${look.look_id}`} className="font-semibold text-gray-700 mb-2">Itens:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {look.items.map((item: LookItem, index: number) => (
                <li key={index} className={item.is_external ? 'text-gray-600 italic' : ''}>
                  <span className="text-gray-800">{item.name}</span>
                  {item.is_external && item.source === 'store' && <span className="text-xs text-blue-500 font-medium ml-1">(Disponível na loja)</span>}
                  {item.is_external && item.source === null && <span className="text-xs opacity-70 ml-1"> (sugestão externa)</span>}
                  {item.price && (
                    <span className="ml-2 text-green-700 font-semibold">
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  )}
                  {item.installments && (
                    <span className="ml-1 text-gray-500 text-xs">
                      {item.installments}
                    </span>
                  )}
                  {item.can_purchase && item.product_url && (
                    <a
                      href={item.product_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center text-sm font-medium"
                      aria-label={`Comprar ${item.name}`}
                    >
                      Comprar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4" role="group" aria-labelledby={`look-works-${look.look_id}`}>
            <p id={`look-works-${look.look_id}`} className="font-semibold text-gray-700 mb-2">Por que funciona:</p>
            <p className="text-gray-700 leading-relaxed">{look.why_it_works}</p>
          </div>

          {look.warnings.length > 0 && (
            <div className="mt-auto bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-md" role="alert" aria-labelledby={`look-warnings-${look.look_id}`}>
              <p id={`look-warnings-${look.look_id}`} className="font-semibold text-yellow-800 text-sm mb-1">Alertas:</p>
              <ul className="list-disc list-inside text-yellow-700 text-xs space-y-1">
                {look.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={onBack} className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
            Voltar para o e-Stylist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SharedLookView;