import React, { useState, useCallback, useEffect } from 'react';
import { eStylistService } from './services/eStylistService';
import { EStylistInput, EStylistOutput, Look, LookItem, EStylistMode } from './types';
import JsonInput from './components/JsonInput';
import JsonOutput from './components/JsonOutput';
import Button from './components/Button';
import LookCard from './components/LookCard';
import Alert from './components/Alert';

const defaultConsumerInput: EStylistInput = {
  profile: {
    name: 'Maria',
    style_preferences: ['casual', 'confortável'],
    body_shape: 'retângulo',
  },
  wardrobe: [
    {
      id: 'item_01',
      name: 'Camiseta Branca Básica',
      category: 'blusa',
      color: 'branco',
      fabric: 'algodão',
      style: 'básico',
      fit: 'reto',
      nivel_formalidade: 1,
    },
    {
      id: 'item_02',
      name: 'Calça Jeans Reta',
      category: 'calça',
      color: 'azul',
      fabric: 'jeans',
      style: 'casual',
      fit: 'reto',
      nivel_formalidade: 2,
    },
    {
      id: 'item_03',
      name: 'Blazer Preto Estruturado',
      category: 'casaco',
      color: 'preto',
      fabric: 'poliéster',
      style: 'clássico',
      fit: 'estruturado',
      nivel_formalidade: 4,
    },
    {
      id: 'item_04',
      name: 'Sapato Scarpin Preto',
      category: 'calçado',
      color: 'preto',
      fabric: 'couro sintético',
      style: 'clássico',
      fit: 'justo',
      nivel_formalidade: 5,
    },
    {
      id: 'item_05',
      name: 'Vestido Midi Floral',
      category: 'vestido',
      color: 'estampado',
      fabric: 'viscose',
      style: 'romântico',
      fit: 'solto',
      nivel_formalidade: 3,
    },
    {
      id: 'item_06',
      name: 'Tênis Casual Branco',
      category: 'calçado',
      color: 'branco',
      fabric: 'lona',
      style: 'esportivo',
      fit: 'confortável',
      nivel_formalidade: 1,
    },
    {
      id: 'item_07',
      name: 'Bolsa Tiracolo Marrom',
      category: 'acessório',
      color: 'marrom',
      fabric: 'couro sintético',
      style: 'versátil',
      fit: 'pequena',
      nivel_formalidade: 3,
    },
  ],
  occasion: {
    id: 'ocasiao_003',
    name: 'Reunião de Trabalho Informal',
    nivel_formalidade_esperado: 3,
  },
  store_catalog: [
    {
      store_item_id: 'store_001',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/produto/calca-alfaiataria-preta',
      name: 'Calça de alfaiataria Preta',
      category: 'calça',
      nivel_formalidade: 4,
      price: 189.90,
      installments: '3x de R$63,30',
      commission_tag: 'aff_xyz'
    },
    {
      store_item_id: 'store_002',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/produto/sapato-casual-confortavel',
      name: 'Sapato casual Marrom',
      category: 'calçado',
      nivel_formalidade: 3,
      price: 249.90,
      installments: '5x de R$49,98',
      commission_tag: 'aff_xyz'
    },
    {
      store_item_id: 'store_003',
      store_name: 'Loja Chic',
      product_url: 'https://loja-chic.com/blazer-moderno-off-white',
      name: 'Blazer Moderno Off-White',
      category: 'casaco',
      nivel_formalidade: 4,
      price: 399.00,
      installments: '6x de R$66,50',
      commission_tag: 'aff_abc'
    },
    {
      store_item_id: 'store_004',
      store_name: 'Acessorios Mania',
      product_url: 'https://acessoriosmania.com/colar-minimalista-dourado',
      name: 'Colar Minimalista Dourado',
      category: 'acessório',
      nivel_formalidade: 3,
      price: 79.99,
      installments: '1x de R$79,99',
      commission_tag: 'aff_def'
    },
  ],
  mode: 'consumer',
  smart_copy: false, // ✅ NOVO: IA opcional
};

// ✅ NOVO: Preset para o modo vendedor
const defaultSellerInput: EStylistInput = {
  profile: {
    name: 'Cliente Ana',
    style_preferences: ['casual elegante', 'moderno'],
    body_shape: 'ampulheta',
  },
  wardrobe: [], // Guarda-roupa do cliente vazio no modo vendedor
  occasion: {
    id: 'ocasiao_001',
    name: 'Jantar com Amigos',
    nivel_formalidade_esperado: 4,
  },
  store_catalog: [
    {
      store_item_id: 'store_001',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/produto/calca-alfaiataria-preta',
      name: 'Calça de alfaiataria Preta',
      category: 'calça',
      nivel_formalidade: 4,
      price: 189.90,
      installments: '3x de R$63,30',
      commission_tag: 'aff_xyz'
    },
    {
      store_item_id: 'store_002',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/produto/sapato-casual-confortavel',
      name: 'Sapato casual Marrom',
      category: 'calçado',
      nivel_formalidade: 3,
      price: 249.90,
      installments: '5x de R$49,98',
      commission_tag: 'aff_xyz'
    },
    {
      store_item_id: 'store_003',
      store_name: 'Loja Chic',
      product_url: 'https://loja-chic.com/blazer-moderno-off-white',
      name: 'Blazer Moderno Off-White',
      category: 'casaco',
      nivel_formalidade: 4,
      price: 399.00,
      installments: '6x de R$66,50',
      commission_tag: 'aff_abc'
    },
    {
      store_item_id: 'store_004',
      store_name: 'Acessorios Mania',
      product_url: 'https://acessoriosmania.com/colar-minimalista-dourado',
      name: 'Colar Minimalista Dourado',
      category: 'acessório',
      nivel_formalidade: 3,
      price: 79.99,
      installments: '1x de R$79,99',
      commission_tag: 'aff_def'
    },
    {
      store_item_id: 'store_005',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/blusa-seda-estampada',
      name: 'Blusa de Seda Estampada',
      category: 'blusa',
      nivel_formalidade: 4,
      price: 129.90,
      installments: '2x de R$64,95',
      commission_tag: 'aff_xyz'
    },
    {
      store_item_id: 'store_006',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/saia-midi-plissada',
      name: 'Saia Midi Plissada',
      category: 'saia',
      nivel_formalidade: 4,
      price: 219.90,
      installments: '4x de R$54,98',
      commission_tag: 'aff_xyz'
    },
  ],
  mode: 'seller',
  smart_copy: false, // ✅ NOVO: IA opcional
};

const App: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>('');
  const [outputJson, setOutputJson] = useState<string>('');
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<EStylistMode>('consumer');
  const [smartCopyEnabled, setSmartCopyEnabled] = useState<boolean>(false); // ✅ NOVO: Estado para Smart Copy (IA)

  // ✅ NOVO: Atualiza o inputJson quando o modo da aplicação ou smartCopyEnabled muda
  useEffect(() => {
    let currentDefaultInput: EStylistInput;
    if (appMode === 'consumer') {
      currentDefaultInput = { ...defaultConsumerInput, smart_copy: smartCopyEnabled };
    } else {
      currentDefaultInput = { ...defaultSellerInput, smart_copy: smartCopyEnabled };
    }
    setInputJson(JSON.stringify(currentDefaultInput, null, 2));
  }, [appMode, smartCopyEnabled]); // Depende de appMode E smartCopyEnabled

  const handleGenerateLooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLooks(null);
    setOutputJson('');
    setNextQuestion(null);
    setVoiceText(null);

    try {
      const parsedInput: EStylistInput = JSON.parse(inputJson);
      // Garante que o input enviado para o serviço reflete o estado do checkbox
      const inputWithModeAndSmartCopy: EStylistInput = { 
        ...parsedInput, 
        mode: appMode,
        smart_copy: smartCopyEnabled
      };

      // ✅ MÉTRICA: Log para geração de looks em modo vendedor
      if (appMode === 'seller') {
        console.log('Metrics: generate_looks_seller', inputWithModeAndSmartCopy);
      }

      const result: EStylistOutput = await eStylistService.generateLooks(inputWithModeAndSmartCopy);
      setLooks(result.looks);
      setOutputJson(JSON.stringify(result, null, 2));
      setNextQuestion(result.next_question);
      setVoiceText(result.voice_text);
    } catch (err: any) {
      console.error('Error generating looks:', err);
      setError(`Failed to generate looks: ${err.message || 'Unknown error'}. Please check your JSON input.`);
    } finally {
      setIsLoading(false);
    }
  }, [inputJson, appMode, smartCopyEnabled]); // Adicionar smartCopyEnabled às dependências

  // ✅ MÉTRICA: Função para logar cliques no botão de compra
  const handleBuyClick = useCallback((storeItemId: string | undefined | null) => {
    if (storeItemId) {
      console.log('Metrics: click_buy_product', storeItemId);
    }
  }, []);


  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-6 text-center">
        e-Stylist <span className="text-blue-500">MVP</span>
      </h1>
      <p className="text-lg text-gray-600 mb-8 max-w-2xl text-center">
        Interact with the styling assistant by providing structured JSON input and receiving curated looks.
      </p>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 h-[600px] flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your JSON Input</h2>
          {/* ✅ NOVO: Seletor de modo */}
          <div className="mb-4">
            <label htmlFor="mode-select" className="block text-sm font-medium text-gray-700 mb-2">
              Select Mode:
            </label>
            <select
              id="mode-select"
              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={appMode}
              onChange={(e) => setAppMode(e.target.value as EStylistMode)}
              aria-label="Selecione o modo de operação do e-Stylist"
            >
              <option value="consumer">Consumer Mode (Guarda-roupa do cliente + Loja)</option>
              <option value="seller">Seller Mode (Apenas estoque da loja)</option>
            </select>
          </div>
          {/* ✅ NOVO: Checkbox Smart Copy (IA) */}
          <div className="flex items-center mb-4">
            <input
              id="smart-copy-checkbox"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={smartCopyEnabled}
              onChange={(e) => setSmartCopyEnabled(e.target.checked)}
              aria-label="Ativar refinamento de texto com Inteligência Artificial"
            />
            <label htmlFor="smart-copy-checkbox" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Smart Copy (IA): Refinar textos dos looks (pode gerar custos)
            </label>
          </div>
          <JsonInput value={inputJson} onChange={setInputJson} />
          <Button
            onClick={handleGenerateLooks}
            disabled={isLoading}
            className="mt-4 w-full"
          >
            {isLoading ? 'Generating...' : 'Generate Looks'}
          </Button>
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-lg shadow-xl p-6 h-[600px] flex flex-col">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">e-Stylist Output</h2>
          {error && <Alert type="error" message={error} className="mb-4" />}
          {isLoading && (
            <div className="flex items-center justify-center h-full text-blue-600 text-lg">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Thinking of fabulous outfits...
            </div>
          )}
          {!isLoading && outputJson && (
            <JsonOutput value={outputJson} />
          )}
          {!isLoading && !outputJson && !error && (
            <div className="flex items-center justify-center h-full text-gray-500 text-lg">
              Output will appear here after generation.
            </div>
          )}
        </div>
      </div>

      {looks && (
        <div className="w-full max-w-6xl mt-8">
          <h2 className="text-3xl font-bold text-gray-700 mb-6 text-center">Generated Looks</h2>
          {voiceText && (
            <div className="bg-blue-50 p-4 rounded-lg shadow-md mb-6 text-blue-800 text-center italic text-lg" role="status" aria-live="polite">
              <span className="font-semibold">Voice Text:</span> {voiceText}
            </div>
          )}
          {nextQuestion && nextQuestion !== '' && (
            <div className="bg-yellow-50 p-4 rounded-lg shadow-md mb-6 text-yellow-800 text-center italic text-lg" role="alert">
              <span className="font-semibold">Next Question:</span> {nextQuestion}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {looks.map((look) => (
              <LookCard
                key={look.look_id}
                look={look}
                wardrobeItems={defaultConsumerInput.wardrobe} // Usar wardrobe do consumer para detalhes, mas a lógica de items já filtra pelo mode
                onBuyClick={handleBuyClick} // Passar a função de clique
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;