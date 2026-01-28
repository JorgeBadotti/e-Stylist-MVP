import React, { useState } from 'react';
import GerenciadorColecoes from '../loja/GerenciadorColecoes';
import DetalheGuardaRoupa from './DetalheGuardaRoupa';

const IndiceGuardaRoupas: React.FC = () => {
    const [selectedGuardaRoupaId, setSelectedGuardaRoupaId] = useState<string | null>(null);
    const [guardaRoupasPublicos, setGuardaRoupasPublicos] = useState<any[]>([]);
    const [loadingPublicos, setLoadingPublicos] = useState(true);

    // Carrega apenas os guarda-roupas públicos
    const fetchGuardaRoupasPublicos = async () => {
        setLoadingPublicos(true);
        try {
            const response = await fetch('/api/guarda-roupas/publicos/lista');
            const data = await response.json();
            setGuardaRoupasPublicos(data);
        } catch (error) {
            console.error('Erro ao buscar guarda-roupas públicos', error);
        } finally {
            setLoadingPublicos(false);
        }
    };

    React.useEffect(() => {
        fetchGuardaRoupasPublicos();
    }, []);;

    if (selectedGuardaRoupaId) {
        return <DetalheGuardaRoupa guardaRoupaId={selectedGuardaRoupaId} onBack={() => setSelectedGuardaRoupaId(null)} />;
    }

    if (loadingPublicos) return <div className="p-8 text-center">Carregando...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
            {/* SEÇÃO: MEUS GUARDAROUPAS (Usando componente reutilizável) */}
            <GerenciadorColecoes
                titulo="👗 Meus Guarda-Roupas"
                mostraBotaoCriar={true}
                onSelectColecao={setSelectedGuardaRoupaId}
            />

            {/* SEÇÃO: GUARDAROUPAS PÚBLICOS */}
            {guardaRoupasPublicos.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-gray-900">🌐 Guarda-Roupas Públicos</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {guardaRoupasPublicos.map((gr) => (
                            <div
                                key={gr._id}
                                onClick={() => setSelectedGuardaRoupaId(gr._id)}
                                className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-blue-100"
                            >
                                {/* ÁREA DA FOTO */}
                                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                    {gr.foto ? (
                                        <img
                                            src={gr.foto}
                                            alt={gr.nome}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <span className="text-5xl">👗</span>
                                        </div>
                                    )}

                                    {/* BADGE DO PROPRIETÁRIO */}
                                    <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-md">
                                        {gr.usuario?.foto ? (
                                            <img
                                                src={gr.usuario.foto}
                                                alt={gr.usuario.nome}
                                                className="w-5 h-5 rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm">👤</span>
                                        )}
                                        <span className="text-xs font-semibold text-gray-700">
                                            {gr.usuario?.nome || 'Usuário'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 space-y-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {gr.nome}
                                        </h3>
                                        {gr.descricao && (
                                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">{gr.descricao}</p>
                                        )}
                                    </div>
                                    <div className="pt-3 border-t border-blue-100">
                                        <p className="text-xs text-blue-600 font-medium">
                                            👁️ Disponível para todos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IndiceGuardaRoupas;
