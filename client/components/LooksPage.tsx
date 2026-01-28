import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../src/services/api';
import ViewLook from './ViewLook';
import GuestBodyCaptureScreen from './GuestBodyCaptureScreen';
import { DetectedMeasurements } from '../src/types/types';

interface Wardrobe {
    _id: string;
    nome: string;
    isPublic?: boolean;
}

interface LookItem {
    id: string;
    name: string;
    foto?: string;
    cor_codigo?: string;
    categoria?: string;
    tamanho?: string;
    skuStyleMe?: string;
}

interface GeneratedLook {
    look_id: string;
    name: string;
    explanation: string;
    items: LookItem[];
    body_affinity_index: number;
}

interface LooksPageProps {
    onNavigateToProfile?: () => void;
    onProductClick?: (sku: string) => void;
    initialItemObrigatorio?: string | null; // ✅ NOVO: Item obrigatório inicial da URL
    initialLojaId?: string | null; // ✅ NOVO: LojaId inicial da URL
}

const LooksPage: React.FC<LooksPageProps> = ({ onNavigateToProfile, onProductClick, initialItemObrigatorio, initialLojaId }) => {
    const [searchParams] = useSearchParams(); // ✅ NOVO: Capturar parâmetros da URL
    const [step, setStep] = useState<'selection' | 'generating' | 'results' | 'visualizing' | 'visualized'>('selection');
    const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
    const [selectedWardrobe, setSelectedWardrobe] = useState<string>('');
    const [occasion, setOccasion] = useState('');
    const [occasionPreset, setOccasionPreset] = useState<'trabalho' | 'casual' | 'festa' | 'outros' | ''>(''); // ✅ NOVO: Rastrear ocasião selecionada
    const [hasBodyPhoto, setHasBodyPhoto] = useState<boolean | null>(null);
    const [looks, setLooks] = useState<GeneratedLook[]>([]);
    const [error, setError] = useState('');
    const [savingSelection, setSavingSelection] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [selectedLookName, setSelectedLookName] = useState<string>('');
    const [selectedLookExplanation, setSelectedLookExplanation] = useState<string>('');
    const [selectedLookItems, setSelectedLookItems] = useState<LookItem[]>([]);
    const [itemObrigatorio, setItemObrigatorio] = useState<string | null>(initialItemObrigatorio || null); // ✅ NOVO: Armazenar peça obrigatória
    const [lojas, setLojas] = useState<any[]>([]); // ✅ NOVO: Lista de lojas
    const [selectedLoja, setSelectedLoja] = useState<string>(initialLojaId || ''); // ✅ NOVO: Loja selecionada (inicializa com initialLojaId)
    const [sessionId, setSessionId] = useState<string | null>(null); // ✅ NOVO: Session ID
    const [guestMeasurements, setGuestMeasurements] = useState<DetectedMeasurements | null>(null); // ✅ NOVO: Medidas do visitante
    const [guestPhoto, setGuestPhoto] = useState<string | null>(null); // ✅ NOVO: Foto do visitante em base64
    const [showGuestCamera, setShowGuestCamera] = useState<boolean>(false); // ✅ NOVO: Controlar câmera do visitante
    const [lookImages, setLookImages] = useState<{ [lookId: string]: string | null }>({}); // ✅ NOVO: Mapear look_id -> imagem URL
    const [savedLookIds, setSavedLookIds] = useState<{ [lookId: string]: string }>({}); // ✅ NOVO: Mapear look_id -> savedLookId no BD

    // ✅ NOVO: Detectar parâmetro itemObrigatorio na URL
    useEffect(() => {
        const item = searchParams.get('itemObrigatorio');
        if (item) {
            console.log(`[LookSession] Detectado itemObrigatorio na URL: ${item}`);
            setItemObrigatorio(item);
        }
    }, [searchParams]);

    // ✅ NOVO: Sincronizar lojaId quando initialLojaId muda
    useEffect(() => {
        if (initialLojaId) {
            console.log(`[LooksPage] Sincronizando selectedLoja com initialLojaId: ${initialLojaId}`);
            setSelectedLoja(initialLojaId);
        }
    }, [initialLojaId]);

    // ✅ DEBUG: Log quando showGuestCamera muda
    useEffect(() => {
        console.log('[LooksPage] showGuestCamera CHANGED:', showGuestCamera);
    }, [showGuestCamera]);

    // ✅ NOVO: useCallback para manter referência da função estável
    const handleShowCameraChange = useCallback((show: boolean) => {
        console.log('[LooksPage] handleShowCameraChange chamado com:', show);
        setShowGuestCamera(show);
    }, []);

    // ✅ NOVO: Gerar imagens dos 3 looks em paralelo quando entra em 'results'
    useEffect(() => {
        if (step === 'results' && looks.length > 0) {
            console.log('[LooksPage] Iniciando geração de imagens em paralelo para os 3 looks');
            generateAllLookImages();
        }
    }, [step, looks]);

    // ✅ NOVO: Função para gerar imagens de todos os looks em paralelo
    const generateAllLookImages = async () => {
        try {
            // 1. Primeiro salvar todos os 3 looks (sem imagem ainda)
            const savePayload: any = {
                selectedLookId: looks[0].look_id, // Temporariamente seleciona o primeiro
                allLooks: looks
            };

            if (sessionId) {
                savePayload.sessionId = sessionId;
            }

            const saveResponse = await api.post('/api/looks/salvar', savePayload);
            const batchResponse = saveResponse.data;

            console.log('[LooksPage] Looks salvos em lote:', batchResponse);

            // 2. Mapear os looks originais com seus IDs salvos no BD
            const lookIdMap: { [key: string]: string } = {};

            // Se backend retorna savedLookIds array, usar para mapear
            if (batchResponse.savedLookIds && Array.isArray(batchResponse.savedLookIds)) {
                looks.forEach((look, idx) => {
                    // Validar que o índice existe e não é null
                    if (idx < batchResponse.savedLookIds.length && batchResponse.savedLookIds[idx]) {
                        lookIdMap[look.look_id] = batchResponse.savedLookIds[idx];
                        console.log(`[LooksPage] ${look.name} -> ${batchResponse.savedLookIds[idx]}`);
                    }
                });
            } else {
                // Fallback: usar o primeiro savedLookId (compatibilidade)
                looks.forEach((look) => {
                    lookIdMap[look.look_id] = batchResponse.savedLookId;
                });
            }

            setSavedLookIds(lookIdMap);
            console.log('[LooksPage] Mapa de looks salvos:', lookIdMap);

            // 3. Inicializar lookImages com null para cada look
            const initialImages: { [key: string]: string | null } = {};
            looks.forEach(look => {
                initialImages[look.look_id] = null;
            });
            setLookImages(initialImages);

            // 4. Gerar imagens em paralelo
            const imagePromises = looks.map(async (look) => {
                try {
                    console.log(`[LooksPage] Gerando imagem para: ${look.name}`);

                    // ✅ CORRIGIDO: Passar o lookData COM o _id do MongoDB
                    const savedId = lookIdMap[look.look_id];

                    const visualizeResponse = await api.post('/api/looks/visualizar', {
                        lookData: {
                            ...look,
                            _id: savedId // ✅ CRÍTICO: Passar o _id salvo no BD
                        },
                        guestPhoto: guestPhoto || undefined
                    });

                    const imageUrl = visualizeResponse.data.imagem_url;
                    console.log(`[LooksPage] ✅ Imagem gerada para ${look.name}: ${imageUrl}`);

                    // Atualizar imagem do look
                    setLookImages(prev => ({
                        ...prev,
                        [look.look_id]: imageUrl
                    }));

                    // Atualizar no BD
                    if (savedId) {
                        await api.patch(`/api/looks/${savedId}`, {
                            imagem_visualizada: imageUrl
                        });
                        console.log(`[LooksPage] Look ${savedId} atualizado no BD`);
                    }

                    return { lookId: look.look_id, imageUrl };
                } catch (err) {
                    console.error(`[LooksPage] Erro ao gerar imagem para ${look.name}:`, err);
                    return { lookId: look.look_id, imageUrl: null };
                }
            });

            // Aguardar todas as imagens em paralelo
            await Promise.all(imagePromises);
            console.log('[LooksPage] Todas as imagens foram geradas!');

        } catch (err) {
            console.error('[LooksPage] Erro ao gerar imagens em lote:', err);
            setError("Erro ao gerar visualizações dos looks. Tente novamente.");
        }
    };

    // Carregar dados iniciais
    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Checa perfil (se tem foto/medidas)
                const userRes = await api.get('/api/usuario/perfil');
                console.log('👤 [LooksPage] Perfil carregado:', userRes.data);

                const temFoto = !!userRes.data.foto_corpo;
                const temAltura = userRes.data.medidas?.altura > 0;

                console.log(`📷 [LooksPage] Tem foto_corpo: ${temFoto}, Tem altura: ${temAltura}`);

                if (temFoto && temAltura) {
                    setHasBodyPhoto(true);
                    console.log('✅ [LooksPage] Perfil COMPLETO');
                } else {
                    setHasBodyPhoto(false);
                    console.log('❌ [LooksPage] Perfil INCOMPLETO');
                }

                // ✅ NOVO: Se tem itemObrigatorio, carregar lojas em vez de guarda-roupas
                if (itemObrigatorio) {
                    console.log(`[LookSession] Carregando lojas para itemObrigatorio: ${itemObrigatorio}`);
                    const lojasRes = await api.get('/api/lojas');
                    setLojas(lojasRes.data);
                    console.log(`[LookSession] ${lojasRes.data.length} lojas carregadas`);
                } else {
                    // 2. Busca Guarda-Roupas (meus + públicos)
                    const [myWardrobesRes, publicWardrobesRes] = await Promise.all([
                        api.get('/api/guarda-roupas'),
                        api.get('/api/guarda-roupas/publicos/lista')
                    ]);

                    // Combina guarda-roupas próprios e públicos
                    const allWardrobes = [...myWardrobesRes.data, ...publicWardrobesRes.data];
                    setWardrobes(allWardrobes);
                }
            } catch (err) {
                console.error('❌ [LooksPage] Erro ao carregar dados:', err);
                setHasBodyPhoto(false);
                setError("Erro ao carregar dados. Verifique sua conexão.");
            }
        };
        initData();
    }, [itemObrigatorio]);

    const handleGenerate = async () => {
        // ✅ NOVO: Se tem itemObrigatorio, usar sessionId. Senão, usar wardrobeId
        if (itemObrigatorio) {
            // NOVO FLUXO: LookSession
            if (!selectedLoja) {
                setError("Por favor, selecione uma loja.");
                return;
            }

            try {
                setStep('generating');
                setError('');

                // 1. Criar sessão
                console.log(`[LookSession] Criando sessão com itemObrigatorio: ${itemObrigatorio}, lojaId: ${selectedLoja}`);
                const sessionRes = await api.post('/api/looks/create-session', {
                    itemObrigatorio,
                    lojaId: selectedLoja
                });

                const newSessionId = sessionRes.data.sessionId;
                setSessionId(newSessionId);
                console.log(`[LookSession] Sessão criada: ${newSessionId}`);

                // 2. Gerar looks com sessionId
                console.log(`[LookSession] Gerando looks com sessionId: ${newSessionId}`);
                const payload: any = {
                    sessionId: newSessionId,
                    prompt: occasion || "Look casual para o dia a dia"
                };

                // ✅ NOVO: Se visitante, enviar medidas
                if (guestMeasurements) {
                    payload.guestMeasurements = guestMeasurements;
                    console.log(`[LookSession] Medidas do visitante adicionadas ao payload`);
                }

                const response = await api.post('/api/looks/gerar', payload);

                setLooks(response.data.looks);
                setStep('results');
            } catch (err) {
                console.error(err);
                setError("Falha ao gerar looks. Verifique se a loja tem produtos.");
                setStep('selection');
            }
        } else {
            // FLUXO ANTIGO: Guarda-roupa
            if (!selectedWardrobe) {
                setError("Por favor, selecione um guarda-roupa.");
                return;
            }

            setStep('generating');
            setError('');

            try {
                const payload: any = {
                    wardrobeId: selectedWardrobe,
                    prompt: occasion || "Look casual para o dia a dia"
                };

                const response = await api.post('/api/looks/gerar', payload);

                setLooks(response.data.looks);
                setStep('results');
            } catch (err) {
                console.error(err);
                setError("Falha ao gerar looks. A IA pode estar sobrecarregada ou o guarda-roupa tem poucas peças.");
                setStep('selection');
            }
        }
    };

    const handleSelectLook = async (selectedLook: GeneratedLook) => {
        setSavingSelection(true);
        setError('');

        try {
            // ✅ NOVO: Apenas registrar a escolha do usuário (feedback/nota)
            // O look já foi salvo em generateAllLookImages
            const savedLookId = savedLookIds[selectedLook.look_id];

            if (!savedLookId) {
                setError("Erro: Look não foi encontrado. Tente novamente.");
                setSavingSelection(false);
                return;
            }

            console.log(`[LooksPage] Usuário escolheu: ${selectedLook.name} (ID: ${savedLookId})`);

            // Carregar imagem do look
            let imageUrl = lookImages[selectedLook.look_id];

            if (!imageUrl) {
                // Aguardar um pouco e tentar novamente (a imagem ainda está sendo gerada)
                console.log('[LooksPage] Imagem ainda está sendo gerada. Aguardando...');
                setError("A imagem está sendo gerada. Aguarde alguns momentos...");

                // Aguardar 2 segundos e tentar novamente
                await new Promise(resolve => setTimeout(resolve, 2000));

                const retryImageUrl = lookImages[selectedLook.look_id];
                if (!retryImageUrl) {
                    setSavingSelection(false);
                    setError("Tempo limite para carregamento da imagem. Tente novamente.");
                    return;
                }

                imageUrl = retryImageUrl;
            }

            // Se chegou aqui, temos a imagem
            setGeneratedImage(imageUrl);
            setSelectedLookName(selectedLook.name);
            setSelectedLookExplanation(selectedLook.explanation);
            setSelectedLookItems(selectedLook.items);
            setSuccessMsg(`✨ Você escolheu: ${selectedLook.name}!`);
            setStep('visualized');

            setSavingSelection(false);

        } catch (err) {
            console.error(err);
            setError("Erro ao processar sua escolha. Tente novamente.");
            setSavingSelection(false);
        }
    };

    const handleGerarNovamente = () => {
        setStep('selection');
        setLooks([]);
        setGeneratedImage(null);
        setSelectedLookName('');
        setSelectedLookItems([]); // ← Limpar items também
        setSuccessMsg('');
        setError('');
        setSelectedWardrobe('');
        setOccasion('');
        setLookImages({}); // ✅ NOVO: Limpar imagens
        setSavedLookIds({}); // ✅ NOVO: Limpar IDs salvos
    };

    // ✅ VERIFICAR se tem foto de referência ANTES de renderizar
    if (hasBodyPhoto === false && !guestMeasurements) {
        // Se não tem foto e não capturou medidas de visitante, mostrar capturas
        return (
            <GuestBodyCaptureScreen
                onMeasurementsCaptured={async (measurements, photo) => {
                    console.log('[LooksPage] Medidas de visitante capturadas:', measurements);

                    // Salvar foto e medidas no BD
                    try {
                        await api.put('/api/usuario/medidas', {
                            foto_corpo: photo,
                            medidas: {
                                altura: measurements.height_cm,
                                busto: measurements.chest_cm,
                                cintura: measurements.waist_cm,
                                quadril: measurements.hips_cm,
                                peso_kg: measurements.weight_kg
                            }
                        });
                        console.log('[LooksPage] Foto e medidas salvas no BD');
                    } catch (err) {
                        console.error('[LooksPage] Erro ao salvar foto/medidas:', err);
                    }

                    setGuestMeasurements(measurements);
                    setGuestPhoto(photo);
                    setHasBodyPhoto(true); // Permitir continuar
                }}
                showCamera={showGuestCamera}
                onShowCameraChange={handleShowCameraChange}
            />
        );
    }

    // Enquanto carrega, mostrar loading
    if (hasBodyPhoto === null) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center mt-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando perfil...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 mt-3">
            <h1 className="text-xl font-bold text-gray-900 mb-1">✨ Gerador de Looks</h1>

            {step === 'selection' && (
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                    {/* ✅ NOVO: Mostrar seleção de loja se tem itemObrigatorio */}
                    {itemObrigatorio ? (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                1. Escolha a Loja 🏪
                                <span className="text-purple-600 ml-2 text-xs font-bold">(Gerando look com: {itemObrigatorio})</span>
                            </label>
                            <select
                                value={selectedLoja}
                                onChange={(e) => setSelectedLoja(e.target.value)}
                                disabled={!!initialLojaId}
                                className={`w-full border border-gray-300 rounded-md p-3 focus:ring-purple-500 focus:border-purple-500 bg-white ${initialLojaId ? 'bg-gray-100 cursor-not-allowed opacity-75' : ''}`}
                            >
                                <option value="">Selecione uma loja...</option>
                                {lojas.map((loja: any) => (
                                    <option key={loja._id} value={loja._id}>
                                        {loja.nome} ({loja.cidade || 'Sem cidade'})
                                    </option>
                                ))}
                            </select>
                            {initialLojaId && (
                                <p className="text-xs text-gray-500 mt-2">🔒 Loja pré-selecionada na URL</p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">1. Escolha o Guarda-Roupa</label>
                            <select
                                value={selectedWardrobe}
                                onChange={(e) => setSelectedWardrobe(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            >
                                <option value="">Selecione...</option>
                                {wardrobes.map(w => (
                                    <option key={w._id} value={w._id}>
                                        {w.nome} {w.isPublic ? '🌐' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">2. Para qual ocasião? (Opcional)</label>
                        <div className="space-y-3">
                            {[
                                { value: 'trabalho', label: '💼 Trabalho / Reunião' },
                                { value: 'casual', label: '🚶 Casual / Passeio' },
                                { value: 'festa', label: '🎉 Festa / Evento' },
                                { value: 'outros', label: '✨ Outra ocasião' }
                            ].map((opt) => (
                                <label key={opt.value} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                    <input
                                        type="radio"
                                        name="occasion"
                                        value={opt.value}
                                        checked={occasionPreset === opt.value}
                                        onChange={(e) => {
                                            setOccasionPreset(e.target.value as any);
                                            if (e.target.value !== 'outros') {
                                                setOccasion('');
                                            }
                                        }}
                                        className="w-4 h-4 text-blue-600 cursor-pointer"
                                    />
                                    <span className="ml-3 text-gray-700">{opt.label}</span>
                                </label>
                            ))}
                        </div>

                        {/* Custom input quando "Outros" está selecionado */}
                        {occasionPreset === 'outros' && (
                            <input
                                type="text"
                                value={occasion}
                                onChange={(e) => setOccasion(e.target.value)}
                                placeholder="Descreva a ocasião..."
                                className="w-full border border-gray-300 rounded-md p-3 mt-3 focus:ring-blue-500 focus:border-blue-500"
                            />
                        )}
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={itemObrigatorio ? lojas.length === 0 : wardrobes.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        ✨ Gerar Looks com IA
                    </button>
                </div>
            )}

            {step === 'generating' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-6"></div>
                    <h3 className="text-xl font-medium text-gray-800 animate-pulse">A IA está analisando suas peças...</h3>
                    <p className="text-gray-500 mt-2">Isso pode levar alguns segundos.</p>
                </div>
            )}

            {step === 'visualizing' && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg shadow-sm">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-6"></div>
                    <h3 className="text-xl font-medium text-gray-800 animate-pulse">Criando sua visualização...</h3>
                    <p className="text-gray-500 mt-2">A IA está imaginando você vestindo esse look! ✨</p>
                </div>
            )}

            {step === 'results' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Qual é o seu favorito?</h2>
                        <button onClick={() => setStep('selection')} className="text-gray-500 hover:text-gray-700">Descartar todos</button>
                    </div>
                    <p className="text-sm text-gray-500">Estamos gerando as visualizações! Clique no look que você mais gostou para avaliar.</p>

                    {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

                    {/* ✅ Card original de seleção de looks (INTOCADO) */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {looks.map((look) => (
                            <div
                                key={look.look_id}
                                onClick={() => !savingSelection && handleSelectLook(look)}
                                className={`
                                cursor-pointer border rounded-lg overflow-hidden shadow-sm transition-all transform hover:-translate-y-1 hover:shadow-lg
                                ${savingSelection ? 'opacity-50 pointer-events-none' : 'bg-white border-gray-200 hover:border-blue-500'}
                            `}
                            >
                                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                    <h3 className="font-bold text-lg text-gray-900">{look.name}</h3>
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-bold">
                                        {look.body_affinity_index} / 10
                                    </span>
                                </div>

                                {/* ✅ NOVO: Imagem do look (gerada em paralelo) */}
                                <div className="relative bg-gray-100 aspect-[3/4] flex items-center justify-center overflow-hidden border-b border-gray-200">
                                    {lookImages[look.look_id] ? (
                                        <>
                                            <img
                                                src={lookImages[look.look_id] || ''}
                                                alt={look.name}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold flex items-center gap-1">
                                                <span>✓</span> Pronta
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <p className="text-sm text-gray-500 text-center">Gerando...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 space-y-4">
                                    <p className="text-sm text-gray-600 italic">"{look.explanation}"</p>

                                    {/* Peças que compõem o look */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase mb-3 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                                            </svg>
                                            Peças do Look
                                        </h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {look.items.map((item, idx) => (
                                                <div key={idx} className="bg-white rounded border border-blue-100 overflow-hidden hover:shadow-md transition">
                                                    {/* Foto do item */}
                                                    <div className="h-20 bg-gray-100 flex items-center justify-center border-b border-blue-100">
                                                        {item.foto ? (
                                                            <img
                                                                src={item.foto}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-2xl text-gray-300">👕</span>
                                                        )}
                                                    </div>
                                                    {/* Informações */}
                                                    <div className="p-2">
                                                        <p className="text-xs font-semibold text-gray-700 truncate" title={item.name}>
                                                            {item.name}
                                                        </p>
                                                        {item.cor_codigo && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                Cor: <span className="font-medium">{item.cor_codigo}</span>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <button className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition">
                                            Escolher este Look ❤️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {step === 'visualized' && (
                <ViewLook
                    lookName={selectedLookName}
                    lookImage={generatedImage || ''}
                    lookExplanation={selectedLookExplanation}
                    lookItems={selectedLookItems}
                    onGenerateNew={handleGerarNovamente}
                    onProductClick={onProductClick}
                />
            )}
        </div>
    );
};

export default LooksPage;