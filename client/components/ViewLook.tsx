import React, { useState } from 'react';

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
}

const ViewLook: React.FC<ViewLookProps> = ({
    lookName,
    lookImage,
    lookExplanation,
    lookItems = [],
    onGenerateNew,
    onBack,
    isLoading = false
}) => {
    // Estado para controlar a visibilidade dos detalhes (UX: permitir ver a foto limpa)
    const [showDetails, setShowDetails] = useState(true);

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
                Ocupa o máximo de espaço possível. Object-contain garante que o look inteiro apareça.
            */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 lg:p-8">
                <img
                    src={lookImage}
                    alt={lookName}
                    className="max-h-full max-w-full w-auto h-auto object-contain drop-shadow-2xl rounded-lg animate-in fade-in zoom-in duration-500"
                />
            </div>

            {/* TOGGLE VISIBILITY BUTTON (UX: Controle do usuário) 
                Permite limpar a tela para ver apenas o look.
            */}
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="absolute top-6 right-6 z-30 p-3 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white border border-white/10 transition-all active:scale-95"
                title={showDetails ? "Ocultar informações" : "Mostrar informações"}
            >
                {showDetails ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.05 10.05 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29" /></svg>
                )}
            </button>

            {/* 3. LAYER DE INFORMAÇÃO (UI FLUTUANTE) 
                Glassmorphism (Vidro Fosco). Fica na lateral ou embaixo, dependendo da tela.
            */}
            <div className={`absolute bottom-0 left-0 lg:left-auto lg:right-0 lg:top-0 lg:h-full w-full lg:w-[450px] z-20 transition-transform duration-500 ease-in-out ${showDetails ? 'translate-y-0 lg:translate-x-0' : 'translate-y-[120%] lg:translate-y-0 lg:translate-x-[120%]'}`}>

                <div className="h-full flex flex-col justify-end lg:justify-center p-6 lg:p-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent lg:bg-gradient-to-l lg:from-slate-950/90 lg:via-slate-900/80 lg:to-transparent">

                    {/* Cartão de Vidro */}
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden group">

                        {/* Efeito Glow decorativo */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl group-hover:bg-purple-500/40 transition-colors"></div>

                        <div className="relative space-y-6">
                            {/* Header Compacto */}
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-xs font-bold text-purple-200 uppercase tracking-wide">
                                    ✨ Visual Gerado
                                </span>
                                {/* Features Icons Row */}
                                <div className="flex gap-2">
                                    <div className="p-1.5 rounded-lg bg-white/5 text-gray-400" title="Salvo">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo de Texto */}
                            <div>
                                <h1 className="text-3xl lg:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                                    {lookName}
                                </h1>
                                {lookExplanation && (
                                    <p className="text-base text-gray-300 leading-relaxed font-light border-l-2 border-purple-500/50 pl-4">
                                        {lookExplanation}
                                    </p>
                                )}
                            </div>

                            {/* Peças do Look - Grid Criativo */}
                            {lookItems && lookItems.length > 0 && (
                                <div className="pt-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M5 3a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2H5zm6 0a2 2 0 00-2 2v6h6V5a2 2 0 00-2-2h-2zm6 0a2 2 0 00-2 2v6h2a2 2 0 002-2V5a2 2 0 00-2-2zm-10 8H3v6a2 2 0 002 2h2v-8zm6 0h-6v8h6v-8zm6 0h-2v8h2a2 2 0 002-2v-6z" />
                                        </svg>
                                        {lookItems.length} Peça{lookItems.length !== 1 ? 's' : ''} Utilizadas
                                    </h3>

                                    {/* Lista vertical com detalhes */}
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {lookItems.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-all ${item._deletado
                                                        ? 'bg-red-500/5 border-red-500/20 opacity-60'
                                                        : 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:bg-white/10'
                                                    }`}
                                            >
                                                {/* Miniatura */}
                                                <div className="w-10 h-10 rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center flex-shrink-0 overflow-hidden border border-white/10">
                                                    {item.foto ? (
                                                        <img
                                                            src={item.foto}
                                                            alt={item.nome}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs opacity-50">👕</span>
                                                    )}
                                                </div>

                                                {/* Info do Item */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {item.nome}
                                                        {item._deletado && (
                                                            <span className="ml-2 text-xs text-red-400 font-normal">(deletado)</span>
                                                        )}
                                                    </p>

                                                    {/* Detalhe: Cor + Tamanho */}
                                                    <div className="flex gap-2 mt-1 text-xs text-gray-400">
                                                        {item.cor && (
                                                            <span className="flex items-center gap-1">
                                                                <span className="w-2 h-2 rounded-full bg-gray-400" />
                                                                {item.cor}
                                                            </span>
                                                        )}
                                                        {item.tamanho && (
                                                            <span>P: {item.tamanho}</span>
                                                        )}
                                                        {item.categoria && (
                                                            <span className="text-purple-300/70">{item.categoria}</span>
                                                        )}
                                                    </div>

                                                    {/* Detalhes opcionais do corpo */}
                                                    {(item.layer_role || item.fit) && (
                                                        <div className="flex gap-1.5 mt-1 text-xs">
                                                            {item.layer_role && (
                                                                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                                                    {item.layer_role}
                                                                </span>
                                                            )}
                                                            {item.fit && (
                                                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                                                    {item.fit}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Badge de SKU no hover */}
                                                {item.sku && (
                                                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-xs text-gray-500 font-mono bg-white/5 px-2 py-1 rounded border border-white/10">
                                                            {item.sku}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ações Primárias - Grandes e Clicáveis (Lei de Fitts) */}
                            <div className="pt-4 space-y-3">
                                <button
                                    onClick={onGenerateNew}
                                    disabled={isLoading}
                                    className="w-full relative group overflow-hidden rounded-xl bg-white text-black font-bold py-4 px-6 shadow-lg shadow-purple-900/20 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all duration-300 active:scale-95 disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-200 via-pink-200 to-purple-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <span className="relative flex items-center justify-center gap-2">
                                        <span className="text-lg">✨ Gerar Nova Combinação</span>
                                    </span>
                                </button>

                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        disabled={isLoading}
                                        className="w-full rounded-xl py-3 px-6 font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm border border-transparent hover:border-white/10"
                                    >
                                        Voltar para seleção
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewLook;