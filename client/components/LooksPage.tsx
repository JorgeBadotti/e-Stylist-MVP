import React, { useState, useEffect } from 'react';
import api from '../src/services/api';
import ViewLook from './ViewLook';

interface Wardrobe {
    _id: string;
    nome: string;
    isPublic?: boolean;
}

interface GeneratedLook {
    look_id: string;
    name: string;
    explanation: string;
    items: { id: string, name: string }[];
    body_affinity_index: number;
}

interface LooksPageProps {
    onNavigateToProfile: () => void;
}

const LooksPage: React.FC<LooksPageProps> = ({ onNavigateToProfile }) => {
    const [step, setStep] = useState<'selection' | 'generating' | 'results' | 'visualizing' | 'visualized'>('selection');
    const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
    const [selectedWardrobe, setSelectedWardrobe] = useState<string>('');
    const [occasion, setOccasion] = useState('');
    const [hasBodyPhoto, setHasBodyPhoto] = useState<boolean | null>(null);
    const [looks, setLooks] = useState<GeneratedLook[]>([]);
    const [error, setError] = useState('');
    const [savingSelection, setSavingSelection] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [selectedLookName, setSelectedLookName] = useState<string>('');
    const [selectedLookExplanation, setSelectedLookExplanation] = useState<string>('');

    // Carregar dados iniciais
    useEffect(() => {
        const initData = async () => {
            try {
                // 1. Checa perfil (se tem foto/medidas)
                const userRes = await api.get('/api/usuario/perfil');
                if (userRes.data.foto_corpo && userRes.data.medidas?.altura > 0) {
                    setHasBodyPhoto(true);
                } else {
                    setHasBodyPhoto(false);
                }

                // 2. Busca Guarda-Roupas (meus + públicos)
                const [myWardrobesRes, publicWardrobesRes] = await Promise.all([
                    api.get('/api/guarda-roupas'),
                    api.get('/api/guarda-roupas/publicos/lista')
                ]);

                // Combina guarda-roupas próprios e públicos
                const allWardrobes = [...myWardrobesRes.data, ...publicWardrobesRes.data];
                setWardrobes(allWardrobes);
            } catch (err) {
                console.error(err);
                setError("Erro ao carregar dados. Verifique sua conexão.");
            }
        };
        initData();
    }, []);

    const handleGenerate = async () => {
        if (!selectedWardrobe) {
            setError("Por favor, selecione um guarda-roupa.");
            return;
        }

        setStep('generating');
        setError('');

        try {
            // Chama o backend para gerar looks
            // O backend vai: Pegar usuário + Pegar itens do guarda-roupa + Chamar Gemini
            const response = await api.post('/api/looks/gerar', {
                wardrobeId: selectedWardrobe,
                prompt: occasion || "Look casual para o dia a dia"
            });

            setLooks(response.data.looks);
            setStep('results');
        } catch (err) {
            console.error(err);
            setError("Falha ao gerar looks. A IA pode estar sobrecarregada ou o guarda-roupa tem poucas peças.");
            setStep('selection');
        }
    };

    const handleSelectLook = async (selectedLook: GeneratedLook) => {
        setSavingSelection(true);
        setError('');
        setStep('visualizing');

        try {
            // 1. Salvar a escolha no banco de dados
            const saveResponse = await api.post('/api/looks/salvar', {
                selectedLookId: selectedLook.look_id,
                allLooks: looks
            });

            // 2. Gerar a visualização do look
            const visualizeResponse = await api.post('/api/looks/visualizar', {
                lookData: {
                    ...selectedLook,
                    _id: saveResponse.data.savedLookId || selectedLook.look_id
                }
            });

            // 3. Salvar a imagem gerada no estado
            setGeneratedImage(visualizeResponse.data.imagem_url);
            setSelectedLookName(selectedLook.name);
            setSelectedLookExplanation(selectedLook.explanation);
            setSuccessMsg(`✨ Sua visualização foi criada! ${selectedLook.name} ficou sensacional!`);

            // 4. Mudar para o step 'visualized' para mostrar a imagem permanentemente
            setStep('visualized');
            setSavingSelection(false);

        } catch (err) {
            console.error(err);
            setError("Erro ao salvar e visualizar o look. Tente novamente.");
            setStep('results');
            setSavingSelection(false);
        }
    };

    const handleGerarNovamente = () => {
        setStep('selection');
        setLooks([]);
        setGeneratedImage(null);
        setSelectedLookName('');
        setSuccessMsg('');
        setError('');
        setSelectedWardrobe('');
        setOccasion('');
        return (
            <div className="max-w-4xl mx-auto p-8 text-center mt-10 bg-white rounded-lg shadow-sm">
                <div className="text-yellow-500 mb-4 text-6xl">⚠️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Perfil Incompleto</h2>
                <p className="text-gray-600 mb-6">
                    Para que a IA possa gerar looks que valorizem seu corpo, precisamos da sua foto de corpo inteiro e suas medidas.
                </p>
                <button
                    onClick={onNavigateToProfile}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Completar Meu Perfil Agora
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 mt-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Gerador de Looks IA</h1>
            <p className="text-gray-500 mb-8">Nossa inteligência artificial analisa seu corpo e suas roupas para sugerir combinações perfeitas.</p>

            {step === 'selection' && (
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">2. Para qual ocasião? (Opcional)</label>
                        <input
                            type="text"
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                            placeholder="Ex: Jantar romântico, Reunião de trabalho, Passeio no parque..."
                            className="w-full border border-gray-300 rounded-md p-3 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={wardrobes.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:from-blue-700 hover:to-indigo-700 transition transform hover:scale-[1.01]"
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
                    <p className="text-sm text-gray-500">Clique no look que você mais gostou para salvá-lo e ver a visualização!</p>

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
                                        <ul className="space-y-2">
                                            {look.items.map((item, idx) => (
                                                <li key={idx} className="text-sm text-gray-700 flex items-center gap-3 p-2 bg-white rounded border border-blue-100">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                                                    <span className="font-medium flex-grow">{item.name}</span>
                                                </li>
                                            ))}
                                        </ul>
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
                    onGenerateNew={handleGerarNovamente}
                />
            )}
        </div>
    );
};

export default LooksPage;