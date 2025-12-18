import React from 'react';
import { Look, WardrobeItem, LookHighlight, SalesPriority } from '../types';
// Import the Button component
import Button from './Button';

interface LookCardProps {
  look: Look;
  wardrobeItems: WardrobeItem[];
  onBuyClick: (storeItemId: string | undefined | null) => void; // ✅ Callback para clique em comprar
  // onCopyToWhatsapp: (lookId: string) => void; // Removido: A lógica de compartilhamento agora é interna
}

const LookCard: React.FC<LookCardProps> = ({ look, wardrobeItems, onBuyClick }) => {
  const getItemDetails = (itemId: string | null) => {
    if (!itemId) return null;
    return wardrobeItems.find(item => item.id === itemId);
  };

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

  const getRandomItemImage = (items: typeof look.items) => {
    // Prioriza imagem de item do guarda-roupa
    const itemFromWardrobe = items.find(item => item.wardrobe_item_id !== null);
    if (itemFromWardrobe) {
      const details = getItemDetails(itemFromWardrobe.wardrobe_item_id);
      if (details) {
        return getImageUrl(details.category);
      }
    }
    // Fallback para item de loja se houver
    const itemFromStore = items.find(item => item.store_item_id !== null && item.source === 'store');
    if (itemFromStore) {
      // Como StoreItem não tem category diretamente no LookItem, podemos inferir ou usar um genérico
      return getImageUrl(itemFromStore.name.includes('Calça') ? 'calça' : itemFromStore.name.includes('Blazer') ? 'casaco' : 'acessório'); // Inferir da name ou genérico
    }

    // Fallback final
    return 'https://picsum.photos/400/250?random=8';
  };

  const getHighlightBadge = (highlight: LookHighlight) => {
    let text = '';
    let bgColor = '';
    let textColor = 'text-white';

    switch (highlight) {
      case 'versatil':
        text = 'Mais Versátil';
        bgColor = 'bg-green-600';
        break;
      case 'custo-beneficio':
        text = 'Melhor Custo-Benefício';
        bgColor = 'bg-purple-600';
        break;
      case 'formalidade-ideal':
        text = 'Formalidade Ideal';
        bgColor = 'bg-blue-600';
        break;
      default:
        return null;
    }

    return (
      <span className={`absolute top-2 right-2 px-3 py-1.5 rounded-full text-xs font-bold ${bgColor} ${textColor} shadow-lg`}
            aria-label={`Destaque: ${text}`}>
        {text}
      </span>
    );
  };

  // ✅ NOVO: Função para compartilhar o look
  const shareLook = async () => {
    const itemsText = (look.items || [])
      .map((i: any) => `• ${i.name}${i.source === 'store' ? ' (Loja)' : ''}`)
      .join('\n');

    const links = (look.items || [])
      .filter((i: any) => i.can_purchase && i.product_url)
      .map((i: any) => i.product_url)
      .join('\n');

    const textContent = `
✨ Look: ${look.title} ✨

Itens:
${itemsText}

Por que funciona:
${look.why_it_works}

${links ? `🛍️ Comprar:\n${links}` : ''}
    `.trim();

    // Log da métrica de compartilhamento
    console.log('Metrics: share_look', look.look_id);

    // Central nativa (Android/iOS)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Look e-Stylist – ${look.title}`,
          text: textContent,
          // url: window.location.href // Opcional: compartilha a URL da página atual
        });
      } catch (error) {
        console.error('Erro ao usar Web Share API:', error);
        // Fallback para copiar em caso de erro na API de compartilhamento
        await navigator.clipboard.writeText(textContent);
        alert('Ocorreu um erro ao compartilhar. O look foi copiado para a área de transferência.');
      }
      return;
    }

    // Fallback desktop
    await navigator.clipboard.writeText(textContent);
    alert('Look copiado para a área de transferência.');
  };


  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full relative" role="region" aria-labelledby={`look-title-${look.look_id}`}>
      <img src={getRandomItemImage(look.items)} alt={look.title} className="w-full h-48 object-cover" aria-hidden="true" />
      {look.highlight && getHighlightBadge(look.highlight)}
      <div className="p-6 flex flex-col flex-grow">
        <h3 id={`look-title-${look.look_id}`} className="text-xl font-bold text-gray-800 mb-2">{look.title}</h3>
        <p className="text-sm text-gray-600 mb-4">
          Formalidade Calculada: <span className="font-semibold text-blue-700">{look.formalidade_calculada}</span>
        </p>

        <div className="mb-4 flex-grow" role="group" aria-labelledby={`look-items-${look.look_id}`}>
          <p id={`look-items-${look.look_id}`} className="font-semibold text-gray-700 mb-2">Itens:</p>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            {look.items.map((item, index) => {
              const itemDetail = getItemDetails(item.wardrobe_item_id);
              return (
                <li key={index} className={item.is_external ? 'text-gray-600 italic' : ''}>
                  <span className="text-gray-800">{item.name}</span>
                  {item.is_external && item.source === 'store' && <span className="text-xs text-blue-500 font-medium ml-1">(Disponível na loja)</span>}
                  {item.is_external && item.source === null && <span className="text-xs opacity-70 ml-1"> (sugestão externa)</span>}
                  {itemDetail && ` (${itemDetail.category}, ${itemDetail.color})`}
                  {item.price && (
                    <span className="ml-2 text-green-700 font-semibold text-sm">
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
                      onClick={() => onBuyClick(item.store_item_id)} // ✅ Integração com métrica de clique
                    >
                      Comprar
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {item.sales_support && (
                    <div className="ml-4 mt-1 text-gray-600 text-xs">
                      {item.sales_support.versatility && <p><span className="font-semibold">Versátil:</span> {item.sales_support.versatility}</p>}
                      {item.sales_support.priority && <p><span className="font-semibold">Prioridade:</span> {item.sales_support.priority === 'essencial' ? 'Essencial' : 'Opcional'}</p>}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mb-4" role="group" aria-labelledby={`look-works-${look.look_id}`}>
          <p id={`look-works-${look.look_id}`} className="font-semibold text-gray-700 mb-2">Por que funciona:</p>
          <p className="text-gray-700 text-sm leading-relaxed">{look.why_it_works}</p>
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
        {/* ✅ NOVO: Botão genérico para compartilhar o look */}
        <Button
          onClick={shareLook}
          className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-4.18c-.89 0-1.74.35-2.37.98l-5.83 5.83c-.63.63-.98 1.48-.98 2.37v4.18c0 .89.35 1.74.98 2.37l5.83 5.83c.63.63 1.48.98 2.37.98h4.18c.89 0 1.74-.35 2.37-.98l5.83-5.83c.63-.63.98-1.48.98-2.37v-4.18c0-.89-.35-1.74-.98-2.37l-5.83-5.83c-.63-.63-1.48-.98-2.37-.98zM9 16l-3-3 7-7 3 3-7 7z"/>
          </svg>
          Compartilhar
        </Button>
      </div>
    </div>
  );
};

export default LookCard;