import React, { useState, useEffect } from 'react';
import api from '../src/services/api';

interface Wardrobe {
    _id: string;
    nome: string;
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
    const [step, setStep] = useState<'selection' | 'generating' | 'results'>('selection');
    const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);
    const [selectedWardrobe, setSelectedWardrobe] = useState<string>('');
    const [occasion, setOccasion] = useState('');
    const [hasBodyPhoto, setHasBodyPhoto] = useState<boolean | null>(null);
    const [looks, setLooks] = useState<GeneratedLook[]>([]);
    const [error, setError] = useState('');
    const [savingSelection, setSavingSelection] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

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

                // 2. Busca Guarda-Roupas
                const wardrobeRes = await api.get('/api/guarda-roupas');
                setWardrobes(wardrobeRes.data);
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
        try {
            // Envia para o backend: O ID do escolhido + Todos os looks gerados
            await api.post('/api/looks/salvar', {
                selectedLookId: selectedLook.look_id,
                allLooks: looks
            });

            setSuccessMsg(`Ótima escolha! O look "${selectedLook.name}" foi salvo nos seus favoritos.`);

            // Opcional: Redirecionar para Home ou limpar após uns segundos
            setTimeout(() => {
                setStep('selection'); // Volta para gerar mais ou vai para outra tela
                setLooks([]);
                setSuccessMsg('');
            }, 3000);

        } catch (err) {
            console.error(err);
            setError("Erro ao salvar sua escolha.");
        } finally {
            setSavingSelection(false);
        }
    };

    // Renderização condicional se não tiver foto de corpo
    if (hasBodyPhoto === false) {
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
                                <option key={w._id} value={w._id}>{w.nome}</option>
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

            {step === 'results' && (
                <div className="space-y-6">
                    {successMsg ? (
                        <div className="p-6 bg-green-100 text-green-800 rounded-lg text-center text-xl font-bold animate-pulse">
                            {successMsg}
                        </div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-800">Qual é o seu favorito?</h2>
                                <button onClick={() => setStep('selection')} className="text-gray-500 hover:text-gray-700">Descartar todos</button>
                            </div>
                            <p className="text-sm text-gray-500">Clique no look que você mais gostou para salvá-lo no seu histórico.</p>

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

                                            <div className="pt-2">
                                                <button className="w-full py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition">
                                                    Escolher este Look ❤️
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default LooksPage;