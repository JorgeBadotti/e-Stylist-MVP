import React, { useState, useCallback, useEffect } from 'react';
import { eStylistService } from './src/services/eStylistService';
import { EStylistInput, EStylistOutput, Look, EStylistMode, Profile, DetectedMeasurements, SharedLinkData } from './src/types';
import JsonInput from './components/JsonInput';
import JsonOutput from './components/JsonOutput';
import Button from './components/Button';
import LookCard from './components/LookCard';
import Alert from './components/Alert';
import ShareOptionsModal from './components/ShareOptionsModal'; // NOVO: Modal de opções de compartilhamento
import SharedLookView from './components/SharedLookView'; // NOVO: Componente para visualização de look compartilhado
import CameraCaptureScreen from './components/CameraCaptureScreen'; // NOVO: Componente para captura de câmera
import LoginPage from './components/Login';

const defaultConsumerInput: EStylistInput = {
  profile: {
    name: 'Maria',
    style_preferences: ['casual', 'confortável'],
    body_shape: 'retângulo',
    body_measurements: {
      chest_cm: 92,
      waist_cm: 82,
      hips_cm: 102,
      height_cm: 165,
    },
  },
  wardrobe: [
    {
      id: 'item_user_01',
      name: 'Camiseta Branca Básica',
      category: 'blusa',
      color: 'branco',
      fabric: '100% algodão', // ✅ Adicionado fabric
      style: 'básico',
      fit: 'reto',
      nivel_formalidade: 1,
      brand_id: 'marca_propria',
      brand_name: 'Marca Própria',
    },
  ],
  occasion: {
    id: 'ocasiao_003',
    name: 'Reunião de Trabalho Informal',
    nivel_formalidade_esperado: 3,
  },
  store_catalog: [
    {
      store_item_id: 'item_store_99',
      store_name: 'Loja Exemplo', // Default store name
      product_url: 'https://loja.com/p/calca-99',
      name: 'Calça Jeans High Waist',
      category: 'calça',
      fabric: '98% algodão, 2% elastano', // ✅ Adicionado fabric
      nivel_formalidade: 2, // Estimated formalidade for jeans
      price: 289.90,
      installments: '3x de R$96,63', // Calculated for 3 installments
      commission_tag: 'aff_xyz', // Default tag
      brand_id: 'marca_premium_01',
      brand_name: 'Levis Style',
      fit_model: 'Slim',
      size_specs: [
        {
          size_label: '40',
          waist_min_cm: 78,
          waist_max_cm: 81,
        },
        {
          size_label: '42',
          waist_min_cm: 82,
          waist_max_cm: 85,
        },
      ],
    },
    {
      store_item_id: 'item_store_100',
      store_name: 'Loja Exemplo',
      product_url: 'https://loja.com/p/blusa-seda',
      name: 'Blusa de Seda Pura',
      category: 'blusa',
      fabric: '100% seda', // Exemplo de tecido rígido
      nivel_formalidade: 4,
      price: 150.00,
      installments: '3x de R$50,00',
      commission_tag: 'aff_xyz',
      brand_id: 'marca_luxo',
      brand_name: 'Elegance',
      fit_model: 'Regular',
      size_specs: [
        { size_label: 'P', chest_min_cm: 80, chest_max_cm: 84 },
        { size_label: 'M', chest_min_cm: 85, chest_max_cm: 89 }, // Maria (92cm) estaria no limite superior (89cm) se fosse M
        { size_label: 'G', chest_min_cm: 90, chest_max_cm: 94 },
      ],
    },
    {
      store_item_id: 'item_store_101',
      store_name: 'Loja Exemplo',
      product_url: 'https://loja.com/p/vestido-malha',
      name: 'Vestido de Malha Canelada',
      category: 'vestido',
      fabric: '95% viscose, 5% elastano', // Exemplo de tecido flexível
      nivel_formalidade: 3,
      price: 120.00,
      installments: '2x de R$60,00',
      commission_tag: 'aff_xyz',
      brand_id: 'marca_conforto',
      brand_name: 'Conforto Já',
      fit_model: 'Bodycon',
      size_specs: [
        { size_label: 'P', chest_min_cm: 80, chest_max_cm: 86 },
        { size_label: 'M', chest_min_cm: 87, chest_max_cm: 91 }, // Maria (92cm) ultrapassa em 1cm, dentro de 2% (91 * 1.02 = 92.82)
        { size_label: 'G', chest_min_cm: 92, chest_max_cm: 96 },
      ],
    },
    {
      store_item_id: 'item_store_102',
      store_name: 'Loja Exemplo',
      product_url: 'https://loja.com/p/calca-alfaiataria',
      name: 'Calça de Alfaiataria Lisa',
      category: 'calça',
      fabric: 'Lã fria', // Exemplo de tecido de alfaiataria
      nivel_formalidade: 4,
      price: 350.00,
      installments: '5x de R$70,00',
      commission_tag: 'aff_xyz',
      brand_id: 'marca_executiva',
      brand_name: 'Executiva Chic', // Marca com regra de Slim Fit
      fit_model: 'Slim',
      size_specs: [
        { size_label: '38', waist_min_cm: 75, waist_max_cm: 79, hips_min_cm: 95, hips_max_cm: 99 },
        { size_label: '40', waist_min_cm: 80, waist_max_cm: 84, hips_min_cm: 100, hips_max_cm: 104 }, // Maria (cintura 82cm, quadril 102cm) cairia aqui
        { size_label: '42', waist_min_cm: 85, waist_max_cm: 89, hips_min_cm: 105, hips_max_cm: 109 },
      ],
    },
  ],
  mode: 'consumer',
  smart_copy: false,
};

const defaultSellerInput: EStylistInput = {
  profile: {
    name: 'Cliente Ana',
    style_preferences: ['casual elegante', 'moderno'],
    body_shape: 'ampulheta',
    body_measurements: {
      chest_cm: 92,
      waist_cm: 72,
      hips_cm: 98,
      height_cm: 170,
    },
  },
  wardrobe: [],
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
      name: 'Calça de Alfaiataria Preta',
      category: 'calça',
      fabric: '97% poliéster, 3% elastano', // ✅ Adicionado fabric
      nivel_formalidade: 4,
      price: 189.90,
      installments: '3x de R$63,30',
      commission_tag: 'aff_xyz',
      brand_id: 'brand_008', // Exemplo
      brand_name: 'Executiva Chic', // Exemplo
      fit_model: 'Slim', // Exemplo
      size_specs: [ // Exemplo de size_specs
        { size_label: '38', waist_min_cm: 68, waist_max_cm: 72, hips_min_cm: 92, hips_max_cm: 96 },
        { size_label: '40', waist_min_cm: 72, waist_max_cm: 76, hips_min_cm: 96, hips_max_cm: 100 },
        { size_label: '42', waist_min_cm: 76, waist_max_cm: 80, hips_min_cm: 100, hips_max_cm: 104 },
        { size_label: '44', waist_min_cm: 80, waist_max_cm: 84, hips_min_cm: 104, hips_max_cm: 108 },
      ],
    },
    {
      store_item_id: 'store_002',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/produto/sapato-casual-confortavel',
      name: 'Sapato Casual Marrom',
      category: 'calçado',
      fabric: 'couro sintético', // ✅ Adicionado fabric
      nivel_formalidade: 3,
      price: 249.90,
      installments: '5x de R$49,98',
      commission_tag: 'aff_xyz',
      brand_id: 'brand_009', // Exemplo
      brand_name: 'Conforto Total', // Exemplo
    },
    {
      store_item_id: 'store_003',
      store_name: 'Loja Chic',
      product_url: 'https://loja-chic.com/blazer-moderno-off-white',
      name: 'Blazer Moderno Off-White',
      category: 'casaco',
      fabric: '98% poliéster, 2% elastano', // ✅ Adicionado fabric
      nivel_formalidade: 4,
      price: 399.00,
      installments: '6x de R$66,50',
      commission_tag: 'aff_abc',
      brand_id: 'brand_010', // Exemplo
      brand_name: 'Chic Style', // Exemplo
      fit_model: 'Regular', // Exemplo
      size_specs: [
        { size_label: 'P', chest_min_cm: 84, chest_max_cm: 88 },
        { size_label: 'M', chest_min_cm: 88, chest_max_cm: 92 },
        { size_label: 'G', chest_min_cm: 92, chest_max_cm: 96 },
      ],
    },
    {
      store_item_id: 'store_004',
      store_name: 'Acessorios Mania',
      product_url: 'https://acessoriosmania.com/colar-minimalista-dourado',
      name: 'Colar Minimalista Dourado',
      category: 'acessório',
      fabric: 'metal', // ✅ Adicionado fabric
      nivel_formalidade: 3,
      price: 79.99,
      installments: '1x de R$79,99',
      commission_tag: 'aff_def',
      brand_id: 'brand_011', // Exemplo
      brand_name: 'Brilho Único', // Exemplo
    },
    {
      store_item_id: 'store_005',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/blusa-seda-estampada',
      name: 'Blusa de Seda Estampada',
      category: 'blusa',
      fabric: 'seda pura', // ✅ Adicionado fabric
      nivel_formalidade: 4,
      price: 129.90,
      installments: '2x de R$64,95',
      commission_tag: 'aff_xyz',
      brand_id: 'brand_012', // Exemplo
      brand_name: 'Seda Pura', // Exemplo
      fit_model: 'Regular',
      size_specs: [
        { size_label: 'P', chest_min_cm: 86, chest_max_cm: 90 },
        { size_label: 'M', chest_min_cm: 90, chest_max_cm: 94 },
        { size_label: 'G', chest_min_cm: 94, chest_max_cm: 98 },
      ],
    },
    {
      store_item_id: 'store_006',
      store_name: 'Loja Exemplo',
      product_url: 'https://sualoja.com/saia-midi-plissada',
      name: 'Saia Midi Plissada',
      category: 'saia',
      fabric: 'viscose', // ✅ Adicionado fabric
      nivel_formalidade: 4,
      price: 219.90,
      installments: '4x de R$54,98',
      commission_tag: 'aff_xyz',
      brand_id: 'brand_013', // Exemplo
      brand_name: 'Elegância Fluida', // Exemplo
      fit_model: 'Loose',
      size_specs: [
        { size_label: 'P', waist_min_cm: 64, waist_max_cm: 68 },
        { size_label: 'M', waist_min_cm: 68, waist_max_cm: 72 },
        { size_label: 'G', waist_min_cm: 72, waist_max_cm: 76 },
      ],
    },
  ],
  mode: 'seller',
  smart_copy: false,
};

const App: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(JSON.stringify(defaultConsumerInput, null, 2));
  const [outputJson, setOutputJson] = useState<string>('');
  const [looks, setLooks] = useState<Look[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [voiceText, setVoiceText] = useState<string | null>(null);
  const [appMode, setAppMode] = useState<EStylistMode>('consumer');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // NOVO: Estado para o modal de compartilhamento
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [lookToShare, setLookToShare] = useState<Look | null>(null);
  const [profileForShare, setProfileForShare] = useState<Profile | null>(null); // NOVO: Perfil para compartilhar

  // NOVO: Estado para o look compartilhado (quando acessado via link)
  const [sharedLinkData, setSharedLinkData] = useState<SharedLinkData | null>(null); // Alterado para SharedLinkData
  const [isViewingSharedLook, setIsViewingSharedLook] = useState<boolean>(false);

  // NOVO: Estado para controlar a exibição da tela de captura de câmera
  const [showCameraCapture, setShowCameraCapture] = useState<boolean>(false);
  const [cameraProfileInitialData, setCameraProfileInitialData] = useState<Profile | null>(null); // Dados para a tela da câmera


  // Função utilitária para atualizar um campo no JSON de entrada com segurança
  const updateJsonField = useCallback((field: string, value: any) => {
    try {
      const parsed = JSON.parse(inputJson);
      // Suporta path aninhado para 'profile.body_measurements'
      if (field.includes('.')) {
        const parts = field.split('.');
        let current = parsed;
        for (let i = 0; i < parts.length - 1; i++) {
          if (current[parts[i]] === undefined) {
            current[parts[i]] = {};
          }
          current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
      } else {
        parsed[field] = value;
      }
      setInputJson(JSON.stringify(parsed, null, 2));
    } catch {
      // JSON inválido: não faz nada (evita quebrar a UI)
    }
  }, [inputJson]);

  // Atualiza o inputJson quando o modo da aplicação muda, carregando o preset do modo selecionado
  useEffect(() => {
    let currentDefaultInput: EStylistInput;
    if (appMode === 'consumer') {
      currentDefaultInput = defaultConsumerInput;
    } else {
      currentDefaultInput = defaultSellerInput;
    }
    // Mantém o smart_copy do JSON atual se possível, caso contrário, usa o padrão do preset (falso)
    try {
      const currentParsedInput = JSON.parse(inputJson);
      const smartCopyFromCurrentInput = currentParsedInput.smart_copy;
      setInputJson(JSON.stringify({
        ...currentDefaultInput,
        smart_copy: typeof smartCopyFromCurrentInput === 'boolean' ? smartCopyFromCurrentInput : false // Preserva se for booleano, senão usa false
      }, null, 2));
    } catch (e) {
      // Se JSON atual for inválido, apenas carrega o default do modo
      setInputJson(JSON.stringify(currentDefaultInput, null, 2));
    }
  }, [appMode]);

  const handleGenerateLooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setLooks(null);
    setOutputJson('');
    setNextQuestion(null);
    setVoiceText(null);
    setIsViewingSharedLook(false); // Sair da visualização de look compartilhado

    try {
      const parsedInput: EStylistInput = JSON.parse(inputJson);
      // O `inputJson` já reflete o estado do `smart_copy`
      const inputWithMode: EStylistInput = {
        ...parsedInput,
        mode: appMode,
      };

      if (appMode === 'seller') {
        console.log('Metrics: generate_looks_seller', inputWithMode);
      }

      const result: EStylistOutput = await eStylistService.generateLooks(inputWithMode);
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
  }, [inputJson, appMode]);

  const handleBuyClick = useCallback((storeItemId: string | undefined | null) => {
    if (storeItemId) {
      console.log('Metrics: click_buy_product', storeItemId);
    }
  }, []);

  // Determina o estado do checkbox Smart Copy lendo diretamente do JSON
  const isSmartCopyEnabled = (() => {
    try {
      const parsed = JSON.parse(inputJson);
      return Boolean(parsed.smart_copy);
    } catch {
      return false;
    }
  })();

  // NOVO: Função para abrir o modal de compartilhamento, agora passando o perfil
  const openShareModal = useCallback((look: Look) => {
    setLookToShare(look);
    try {
      const parsedInput = JSON.parse(inputJson);
      setProfileForShare(parsedInput.profile); // Passa o perfil completo
    } catch (e) {
      console.error("Failed to parse input JSON for profile:", e);
      setProfileForShare(null);
    }
    setShowShareModal(true);
  }, [inputJson]);

  // NOVO: Callback para atualizar as medidas do perfil após a captura da câmera
  const handleMeasurementsCaptured = useCallback((measurements: DetectedMeasurements, photoBase64: string) => {
    updateJsonField('profile.body_measurements', {
      chest_cm: measurements.chest_cm,
      waist_cm: measurements.waist_cm,
      hips_cm: measurements.hips_cm,
      height_cm: measurements.height_cm,
    });
    updateJsonField('profile.photo_base64', photoBase64); // Armazena a foto no perfil
    setShowCameraCapture(false); // Fecha a tela de captura após sucesso
    alert('Medidas atualizadas com sucesso!');
  }, [updateJsonField]);

  // NOVO: Lógica para detectar e carregar look compartilhado da URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/s\/([a-zA-Z0-9_-]+)$/); // Espera /s/:token

    if (match && match[1]) {
      const token = match[1];
      console.log(`Detectado token de compartilhamento na URL: ${token}`);
      setIsLoading(true);
      setLooks(null); // Limpa looks da tela principal
      setOutputJson(''); // Limpa output json
      setNextQuestion(null);
      setVoiceText(null);
      setError(null);

      eStylistService.getSharedLook(token)
        .then(data => {
          if (data) {
            setSharedLinkData(data); // Armazena look E profile
            setIsViewingSharedLook(true);
            document.title = `e-Stylist: ${data.look.title}`;
          } else {
            setError('Look compartilhado não encontrado ou expirado.');
            setIsViewingSharedLook(false);
          }
        })
        .catch(err => {
          console.error('Erro ao carregar look compartilhado:', err);
          setError('Erro ao carregar look compartilhado. Tente novamente.');
          setIsViewingSharedLook(false);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsViewingSharedLook(false); // Garante que não estamos em modo de visualização de share
    }
  }, []); // Executa apenas uma vez no carregamento

  // Handler para "Confirme suas medidas" e "Salvar Perfil" da SharedLookView
  const handleSharedViewAction = useCallback((action: 'confirmMeasures' | 'saveProfile', sharedProfile: Profile) => {
    // Redireciona para a home e abre a câmera ou atualiza o perfil
    window.history.pushState({}, '', '/');
    setIsViewingSharedLook(false);
    setSharedLinkData(null); // Limpa os dados do look compartilhado
    document.title = 'e-Stylist MVP Frontend';

    if (action === 'confirmMeasures') {
      setCameraProfileInitialData(sharedProfile); // Prepara para a tela da câmera
      setShowCameraCapture(true);
    } else if (action === 'saveProfile') {
      // Atualiza o inputJson principal com os dados do perfil do look compartilhado
      setInputJson(JSON.stringify({ ...defaultConsumerInput, profile: sharedProfile }, null, 2));
      alert('Perfil salvo com sucesso! Você pode gerar novos looks agora.');
    }
  }, []);


  // Renderiza a tela de look compartilhado se estiver ativa
  if (isViewingSharedLook && sharedLinkData) {
    return (
      <SharedLookView
        look={sharedLinkData.look}
        profile={sharedLinkData.profile} // Passa o profile completo
        wardrobeItems={defaultConsumerInput.wardrobe} // Usado para a Camada 2
        onBack={() => {
          setIsViewingSharedLook(false);
          setSharedLinkData(null);
          window.history.pushState({}, '', '/'); // Retorna para a home
          document.title = 'e-Stylist MVP Frontend';
        }}
        onAction={handleSharedViewAction} // Passa o handler de ações
      />
    );
  }

  // NOVO: Renderiza a tela de captura de câmera se estiver ativa
  if (showCameraCapture) {
    let currentProfile: Profile;
    if (cameraProfileInitialData) {
      currentProfile = cameraProfileInitialData; // Usa dados iniciais se vierem do SharedLinkView
    } else {
      try {
        currentProfile = JSON.parse(inputJson).profile;
      } catch (e) {
        console.error("Failed to parse profile from input JSON for camera capture:", e);
        currentProfile = defaultConsumerInput.profile; // Fallback
      }
    }

    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
      <CameraCaptureScreen
        profile={currentProfile}
        onMeasurementsCaptured={handleMeasurementsCaptured}
        onClose={() => setShowCameraCapture(false)}
      />
    );
  }


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
          {/* Checkbox Smart Copy (IA) */}
          <div className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              id="smartCopy"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={isSmartCopyEnabled}
              onChange={(e) => updateJsonField('smart_copy', e.target.checked)}
              aria-label="Ativar refinamento de texto com Inteligência Artificial"
            />
            {/* Fix: Changed `labe` to `label` */}
            <label htmlFor="smartCopy" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Smart Copy (IA – melhora textos){' '}
              <span className="text-xs opacity-60">
                (usa IA, pode ser mais lento e gerar custos)
              </span>
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
          {/* NOVO: Botão para capturar medidas */}
          <Button
            onClick={() => {
              setCameraProfileInitialData(null); // Garante que a câmera começa com o perfil atual
              setShowCameraCapture(true);
            }}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700"
            aria-label="Capturar medidas corporais usando a câmera"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.832-1.664A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.832 1.664A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capturar Medidas
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
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                // Passa o wardrobe do defaultConsumerInput para a função de imagem
                wardrobeItems={defaultConsumerInput.wardrobe}
                onBuyClick={handleBuyClick}
                onShareClick={openShareModal} // NOVO: Passa a função para abrir o modal
              />
            ))}
          </div>
        </div>
      )}

      {/* NOVO: Renderiza o modal de compartilhamento */}
      {showShareModal && lookToShare && profileForShare && (
        <ShareOptionsModal
          look={lookToShare}
          profile={profileForShare}
          onClose={() => {
            setShowShareModal(false);
            setProfileForShare(null); // Limpa o perfil ao fechar o modal
          }}
        />
      )}
    </div>
  );
};

export default App;