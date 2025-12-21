import React, { useState, useCallback, useEffect } from 'react';
import { Look, LookItem, Occasion, EStylistInput, EStylistMode, WardrobeItem } from '../types'; // NOVO: Occasion, EStylistInput, EStylistMode importados
import Button from './Button';
import LookCard from './LookCard'; // NOVO: LookCard para exibir o look gerado
import { eStylistService, trackEvent } from '../services/eStylistService'; // NOVO: trackEvent importado

// Simula um perfil de cliente padrão para a geração de looks no fluxo de compartilhamento
const defaultSharedProfile = {
  name: 'Você', // Ou 'Cliente Anônimo'
  style_preferences: ['casual', 'versátil'],
  body_shape: 'indefinido',
};

// Fix: Correct `defaultSharedWardrobe` type to `WardrobeItem[]`
const defaultSharedWardrobe: WardrobeItem[] = []; // Guarda-roupa vazio para focar em sugestões da loja ou genéricas

interface SharedLookViewProps {
  look: Look; // Look inicial vindo do `eStylistService.getSharedLook`
  onBack: () => void;
}

type SharedLookViewStep = 'initial_message' | 'occasion_selection' | 'generating_look' | 'display_look';

const SharedLookView: React.FC<SharedLookViewProps> = ({ look: initialLook, onBack }) => {
  const [currentStep, setCurrentStep] = useState<SharedLookViewStep>('initial_message');
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [generatedLook, setGeneratedLook] = useState<Look | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0); // Para medir time_to_render_look

  const occasions = eStylistService.getOccasions(); // Lista de ocasiões mockadas

  // Imagem de manequim padrão (sempre a mesma para compartilhamento público/privado sem foto de cliente)
  const mannequinImageUrl = 'https://i.imgur.com/rS0rFjP.png'; // Exemplo de URL de imagem de manequim

  // Lógica de handleBuyClick para o LookCard interno
  const handleBuyClick = useCallback((storeItemId: string | undefined | null) => {
    if (storeItemId) {
      trackEvent('post_view_action_buy_clicked', { lookId: generatedLook?.look_id, storeItemId });
    }
  }, [generatedLook]);

  const handleInitialCTAClick = useCallback(() => {
    trackEvent('entry_cta_clicked');
    setStartTime(performance.now()); // Inicia a contagem de tempo
    setCurrentStep('occasion_selection');
  }, []);

  const handleOccasionSelect = useCallback((occasion: Occasion) => {
    setSelectedOccasion(occasion);
    trackEvent('pre_look_context_action_occasion_selected', { occasionId: occasion.id, occasionName: occasion.name });
    setCurrentStep('generating_look');
  }, []);

  // Simula a geração do look com base na ocasião selecionada
  useEffect(() => {
    if (currentStep === 'generating_look' && selectedOccasion) {
      setIsLoading(true);
      setGenerationError(null);

      // Constrói um input simulado para a geração do look
      const simulatedInput: EStylistInput = {
        profile: defaultSharedProfile,
        wardrobe: defaultSharedWardrobe, // Usa guarda-roupa vazio para focar em sugestões da loja ou genéricas
        occasion: selectedOccasion,
        store_catalog: initialLook.items.filter(item => item.source === 'store').map(item => ({ // Reutiliza itens de loja do look inicial
            store_item_id: item.store_item_id!,
            store_name: 'Loja Parceira', // Mock
            product_url: item.product_url!,
            name: item.name,
            category: 'desconhecida', // Mock, ou tentar inferir
            nivel_formalidade: 3, // Mock
            price: item.price,
            installments: item.installments,
            commission_tag: 'aff_share'
        })),
        mode: 'consumer' as EStylistMode, // Simula modo consumer
        smart_copy: false, // Desabilita IA para rapidez na validação
      };

      eStylistService.generateLooks(simulatedInput)
        .then(output => {
          // No contexto de um look compartilhado, pegamos o primeiro look da resposta simulada
          // mas o ideal é que o backend já retornasse o look final para a ocasião.
          // Para esta validação, usaremos o initialLook, mas simulamos um novo "generateLooks"
          // O output.looks[0] pode ser diferente do initialLook, o que é aceitável para validação do fluxo.
          setGeneratedLook(output.looks[0] || initialLook); // Usa o primeiro look gerado ou o look inicial como fallback
          trackEvent('look_generated', { lookId: (output.looks[0] || initialLook).look_id, occasion: selectedOccasion.name });
          setCurrentStep('display_look');
        })
        .catch(err => {
          console.error('Erro ao simular geração de look no SharedView:', err);
          setGenerationError('Não foi possível gerar sugestões para esta ocasião. Tente outra ou volte.');
          trackEvent('look_generation_failed_shared_view', { occasion: selectedOccasion.name, error: err.message });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [currentStep, selectedOccasion, initialLook]);

  // Mede o tempo de renderização quando o look é exibido
  useEffect(() => {
    if (currentStep === 'display_look' && startTime > 0) {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      trackEvent('time_to_render_look', { durationMs: renderTime, lookId: generatedLook?.look_id || initialLook.look_id });
      setStartTime(0); // Reseta o timer
    }
  }, [currentStep, startTime, generatedLook, initialLook]);


  // Funções para ações pós-look (para rastrear KPY post_view_action)
  const handlePostViewAction = useCallback((action: string) => {
    trackEvent('post_view_action', { action, lookId: generatedLook?.look_id || initialLook.look_id });
  }, [generatedLook, initialLook]);

  const handleGenerateAnother = useCallback(() => {
    handlePostViewAction('generate_another_look');
    setSelectedOccasion(null); // Reseta a ocasião para nova seleção
    setGeneratedLook(null);
    setCurrentStep('occasion_selection'); // Volta para seleção de ocasião
  }, [handlePostViewAction]);

  const handleFeedback = useCallback(() => {
    handlePostViewAction('feedback_provided');
    alert('Obrigado pelo seu feedback!'); // Mock de feedback
  }, [handlePostViewAction]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-xl text-blue-600">
          {currentStep === 'generating_look' ? 'Criando seu look perfeito...' : 'Carregando look compartilhado...'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden flex flex-col relative">

        {currentStep === 'initial_message' && (
          <div className="p-8 text-center">
            <h1 className="text-3xl font-extrabold text-blue-800 mb-4">
              Um Look Exclusivo Te Espera!
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Seu e-Stylist criou uma sugestão de look personalizada.
              Clique abaixo para descobrir!
            </p>
            <img
              src={mannequinImageUrl}
              alt="Manequim padrão"
              className="w-2/3 mx-auto h-auto object-contain mb-6 rounded-lg shadow-md"
              aria-hidden="true"
            />
            <Button onClick={handleInitialCTAClick} className="w-full sm:w-2/3 mx-auto bg-green-500 hover:bg-green-600">
              Ver meu look
            </Button>
            <Button onClick={onBack} className="mt-4 w-full sm:w-2/3 mx-auto bg-gray-300 hover:bg-gray-400 text-gray-800">
              Voltar para o e-Stylist principal
            </Button>
          </div>
        )}

        {currentStep === 'occasion_selection' && (
          <div className="p-8 text-center">
            <h1 className="text-3xl font-extrabold text-blue-800 mb-4">
              Para qual ocasião?
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Selecione a ocasião que mais se encaixa para vermos o seu look ideal!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {occasions.map((occ) => (
                <Button
                  key={occ.id}
                  onClick={() => handleOccasionSelect(occ)}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {occ.name}
                </Button>
              ))}
            </div>
            {generationError && <p className="text-red-500 mt-4">{generationError}</p>}
            <Button onClick={onBack} className="mt-6 w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
              Voltar para o e-Stylist principal
            </Button>
          </div>
        )}

        {currentStep === 'display_look' && generatedLook && (
          <div className="p-6">
            <h1 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
              Seu Look para {selectedOccasion?.name || 'a Ocasião Selecionada'}!
            </h1>
            <div className="flex justify-center mb-6">
              <img
                src={mannequinImageUrl}
                alt="Manequim padrão com o look"
                className="w-1/2 h-auto object-contain rounded-lg shadow-md"
                aria-hidden="true"
              />
            </div>
            <LookCard
              look={generatedLook}
              wardrobeItems={[]} // O LookCard pode precisar de wardrobeItems, mas para este fluxo estamos simplificando
              onBuyClick={handleBuyClick}
              onShareClick={() => handlePostViewAction('share_from_shared_view')}
            />
            <div className="mt-6 space-y-3">
              <Button onClick={handleGenerateAnother} className="w-full bg-blue-600 hover:bg-blue-700">
                Gerar Outro Look
              </Button>
              <Button onClick={handleFeedback} className="w-full bg-purple-600 hover:bg-purple-700">
                Dar Feedback
              </Button>
              <Button onClick={onBack} className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800">
                Voltar para o e-Stylist principal
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedLookView;