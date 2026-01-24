import React, { useState, useEffect } from 'react';

interface LookItem {
    id?: string;
    sku?: string;
    nome: string;
    foto?: string;
    cor?: string;
    cor_codigo?: string;
    categoria?: string;
    tamanho?: string;
    skuStyleMe?: string;
    layer_role?: string;
    color_role?: string;
    fit?: string;
    style_base?: string;
    _deletado?: boolean;
}

interface ViewLookProps {
    lookName: string;
    lookImage: string;
    lookExplanation?: string;
    lookItems?: LookItem[];
    onGenerateNew: () => void;
    onBack?: () => void;
    isLoading?: boolean;
    onProductClick?: (sku: string) => void; // ✅ Callback para clique em produto
}

const ViewLook: React.FC<ViewLookProps> = ({
    lookName,
    lookImage,
    lookExplanation,
    lookItems = [],
    onGenerateNew,
    onProductClick,
    onBack,
    isLoading = false
}) => {
    // Estado para controlar a visibilidade dos detalhes (UX: permitir ver a foto limpa)
    const [showDetails, setShowDetails] = useState(false); // Começa minimizado
    const [showItems, setShowItems] = useState(false); // Mostrar/ocultar itens

    // 🔍 LOG DEBUG: Verificar os itens e SKUs
    useEffect(() => {
        console.log('===== VIEWLOOK DEBUG =====');
        console.log('Total de itens:', lookItems.length);
        console.log('Itens completos:', lookItems);
        lookItems.forEach((item, idx) => {
            console.log(`Item ${idx}:`, {
                nome: item.nome,
                sku: item.sku,
                skuStyleMe: item.skuStyleMe,
                id: item.id,
                categoria: item.categoria,
                temSKU: !!item.sku,
                temSkuStyleMe: !!item.skuStyleMe
            });
        });
        console.log('========================');
    }, [lookItems]);

    // 🔗 Gerar URL dinâmica para o produto baseado na URL atual
    const getProductUrl = (skuStyleMe?: string) => {
        if (!skuStyleMe) return '#';
        return `${window.location.origin}/produtos/${skuStyleMe}`;
    };

    return (
        <div className="relative w-full h-screen overflow-hidden bg-slate-950">
            {/* 1. LAYER DE AMBIENTE (BACKGROUND)
                Cria uma atmosfera baseada nas cores da imagem, mas desfocada.
                Isso elimina as bordas pretas duras se a imagem não for da mesma proporção da tela.
            */}
            <div
                className="absolute inset-0 z-0 opacity-40 blur-[100px] scale-110 transition-all duration-1000"
                style={{ backgroundImage: `url(${lookImage})`, backgroundPosition: 'center', backgroundSize: 'cover' }}
            />

            {/* 2. LAYER PRINCIPAL (A FOTO) 
                Ocupa 100% da tela (cover mode).
            */}
            <div className="absolute inset-0 z-10 flex items-center justify-center">
                <img
                    src={lookImage}
                    alt={lookName}
                    className="w-full h-full object-cover drop-shadow-2xl animate-in fade-in zoom-in duration-500"
                />
            </div>

            {/* 3. PANEL DE DESCRIÇÃO (Desliza do topo para baixo) */}
            <div className={`absolute top-0 left-0 right-0 z-30 transition-transform duration-500 ${showDetails ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="bg-gradient-to-b from-black/95 via-black/80 to-black/60 backdrop-blur-md border-b border-white/10 p-6 max-h-96 overflow-y-auto">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {/* Fechar */}
                        <button
                            onClick={() => setShowDetails(false)}
                            className="float-right text-gray-400 hover:text-white transition-colors"
                            title="Fechar descrição"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7-7m0 0L5 14m7-7v12" />
                            </svg>
                        </button>

                        <div className="clear-both">
                            <h2 className="text-2xl font-bold text-white mb-2">{lookName}</h2>
                            {lookExplanation && (
                                <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-purple-500/50 pl-4">
                                    {lookExplanation}
                                </p>
                            )}
                        </div>

                        {/* Ações */}
                        <div className="pt-2 space-y-2 flex gap-2">
                            <button
                                onClick={onGenerateNew}
                                disabled={isLoading}
                                className="flex-1 bg-white text-black font-bold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                            >
                                ✨ Gerar Nova
                            </button>
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    disabled={isLoading}
                                    className="flex-1 bg-white/10 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/20 transition-colors text-sm border border-white/20"
                                >
                                    Voltar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle para expandir descrição (visível quando minimizado) */}
            {!showDetails && (
                <button
                    onClick={() => setShowDetails(true)}
                    className="absolute top-6 right-6 z-20 p-3 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all active:scale-95 font-medium text-sm"
                    title="Abrir descrição"
                >
                    {lookName}
                </button>
            )}

            {/* 4. SEÇÃO DE ITENS (Desliza da esquerda para direita) */}
            {lookItems && lookItems.length > 0 && (
                <div className={`absolute left-0 top-0 bottom-0 z-40 w-80 transition-transform duration-500 ${showItems ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="h-full bg-gradient-to-r from-black/95 via-black/80 to-black/60 backdrop-blur-md border-r border-white/10 flex flex-col">
                        {/* Header do painel */}
                        <div className="bg-black/70 border-b border-white/10 p-4 flex items-center justify-between">
                            <span className="flex items-center gap-2 text-white font-semibold text-sm">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                                </svg>
                                {lookItems.length} Peça{lookItems.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setShowItems(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1"
                                title="Fechar peças"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Lista de itens com scroll */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-2">
                            {lookItems.map((item, idx) => (
                                <a
                                    key={idx}
                                    href={item.skuStyleMe ? `${window.location.origin}/produtos/${item.skuStyleMe}` : '#'}
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        if (!item.skuStyleMe) e.preventDefault();
                                        if (item.skuStyleMe && onProductClick) {
                                            e.preventDefault();
                                            onProductClick(item.skuStyleMe);
                                        }
                                    }}
                                    className={`group relative flex items-center gap-3 p-2 rounded-lg border transition-all ${item._deletado
                                        ? 'bg-red-500/5 border-red-500/20 opacity-60 cursor-not-allowed'
                                        : item.skuStyleMe
                                            ? 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10 cursor-pointer'
                                            : 'bg-white/5 border-white/10'
                                        }`}
                                >
                                    {/* Miniatura */}
                                    <div className="w-12 h-12 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                                        {item.foto ? (
                                            <img
                                                src={item.foto}
                                                alt={item.nome || item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs opacity-50">👕</span>
                                        )}
                                    </div>

                                    {/* Info do Item */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-white truncate">
                                            {item.nome || item.name || 'Sem nome'}
                                            {item._deletado && (
                                                <span className="ml-2 text-xs text-red-400 font-normal">(deletado)</span>
                                            )}
                                        </p>

                                        {/* Detalhe: Cor + Tamanho */}
                                        <div className="flex gap-2 mt-1 text-xs text-gray-400">
                                            {item.cor && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                                    {item.cor}
                                                </span>
                                            )}
                                            {item.tamanho && (
                                                <span>P: {item.tamanho}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Badge de link */}
                                    {item.skuStyleMe ? (
                                        <span className="text-xs text-green-400 flex-shrink-0">→</span>
                                    ) : (
                                        <span className="text-xs text-gray-500 flex-shrink-0">—</span>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle para expandir peças (visível quando minimizado) */}
            {!showItems && lookItems && lookItems.length > 0 && (
                <button
                    onClick={() => setShowItems(true)}
                    className="absolute top-6 left-6 z-20 p-3 rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md text-white border border-white/10 transition-all active:scale-95 font-medium text-sm flex items-center gap-2"
                    title="Abrir peças"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                    </svg>
                    {lookItems.length} Peça{lookItems.length !== 1 ? 's' : ''}
                </button>
            )}
        </div>
    );
};

export default ViewLook;