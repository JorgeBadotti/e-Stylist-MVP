import React, { useState } from 'react';

/**
 * CadastroProdutoSKULotes.tsx
 * 
 * Interface para cadastro em LOTES de produtos com SKU STYLEME v1
 * Integrada em AdminLojaPage para STORE_ADMIN
 * 
 * Features:
 * - Upload múltiplo de imagens de roupas
 * - Feedback visual em tempo real por peça
 * - Análise automática por IA (Gemini)
 * - Extração de dados visuais
 * - Criação automática de SKUs
 * - Relatório de sucesso/erro
 */

interface PecaStatus {
    numero: number;
    total: number;
    nomeArquivo: string;
    status: 'pendente' | 'iniciando' | 'ia' | 'sku' | 'cloudinary' | 'banco' | 'sucesso' | 'erro';
    mensagem: string;
    sku?: string;
    erro?: string;
    foto?: string;
    produtoId?: string;
}

interface CadastroProdutoSKULotesProps {
    lojaId: string;
    onProdutosCriados?: (produtos: any[]) => void;
    onCancelar?: () => void;
}

export default function CadastroProdutoSKULotes({
    lojaId,
    onProdutosCriados,
    onCancelar
}: CadastroProdutoSKULotesProps) {
    const [imagens, setImagens] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);
    const [carregando, setCarregando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [statusPecas, setStatusPecas] = useState<PecaStatus[]>([]);
    const [resumoFinal, setResumoFinal] = useState<any>(null);
    const [produtosCriados, setProdutosCriados] = useState<any[]>([]);

    const handleImagensMudadas = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            const extensoesValidas = ['jpg', 'jpeg', 'png', 'webp'];
            const novasImagens: File[] = [];
            const novoPreview: string[] = [];
            let arquivosProcessados = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const extensao = file.name.split('.').pop()?.toLowerCase();

                if (!extensao || !extensoesValidas.includes(extensao)) {
                    continue;
                }

                novasImagens.push(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    novoPreview.push(reader.result as string);
                    arquivosProcessados++;

                    if (arquivosProcessados === novasImagens.length) {
                        setPreview((prev) => [...prev, ...novoPreview]);
                    }
                };
                reader.onerror = () => {
                    arquivosProcessados++;
                };
                reader.readAsDataURL(file);
            }

            setImagens((prev) => [...prev, ...novasImagens]);
            setErro(null);

            if (novasImagens.length === 0 && files.length > 0) {
                setErro(`Por favor, selecione apenas imagens em formato JPEG, PNG ou WebP.`);
            }
        }
    };

    const removerImagem = (index: number) => {
        const novasImagens = imagens.filter((_, i) => i !== index);
        const novoPreview = preview.filter((_, i) => i !== index);
        setImagens(novasImagens);
        setPreview(novoPreview);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        setSucesso(null);
        setStatusPecas([]);
        setResumoFinal(null);

        if (imagens.length === 0) {
            setErro('Por favor, selecione pelo menos uma imagem');
            return;
        }

        try {
            setCarregando(true);

            const statusInicial: PecaStatus[] = imagens.map((img, idx) => ({
                numero: idx + 1,
                total: imagens.length,
                nomeArquivo: img.name,
                status: 'pendente',
                mensagem: 'Aguardando processamento...'
            }));
            setStatusPecas(statusInicial);

            const formData = new FormData();
            imagens.forEach((img) => {
                formData.append('imagens', img);
            });
            formData.append('lojaId', lojaId);

            const response = await fetch('/api/produtos/lotes/imagens', {
                method: 'POST',
                body: formData
            });

            if (!response.ok && response.status !== 200) {
                const erro = await response.json();
                setErro(erro.message || 'Erro ao processar imagens');
                setCarregando(false);
                return;
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            if (!reader) {
                throw new Error('Não foi possível iniciar o streaming');
            }

            let pecasSalvas = 0;
            let pecasErro = 0;
            const produtosProcessados: any[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const linhas = buffer.split('\n');
                buffer = linhas.pop() || '';

                for (const linha of linhas) {
                    if (!linha.trim()) continue;

                    try {
                        const evento = JSON.parse(linha);

                        if (evento.numeroPeca) {
                            setStatusPecas((prev) => {
                                const novo = [...prev];
                                const idx = evento.numeroPeca - 1;
                                if (novo[idx]) {
                                    novo[idx] = {
                                        ...novo[idx],
                                        status: evento.tipo as any,
                                        mensagem: evento.status || evento.erro || '',
                                        sku: evento.sku || novo[idx].sku,
                                        erro: evento.erro,
                                        foto: evento.produto?.foto || novo[idx].foto,
                                        produtoId: evento.produto?._id || novo[idx].produtoId
                                    };
                                }
                                return novo;
                            });

                            if (evento.tipo === 'sucesso') {
                                pecasSalvas++;
                                if (evento.produto) {
                                    produtosProcessados.push(evento.produto);
                                }
                            } else if (evento.tipo === 'erro') {
                                pecasErro++;
                            }
                        }

                        if (evento.tipo === 'concluido') {
                            setResumoFinal(evento.resumo);
                        }
                    } catch (e) {
                        console.error('Erro ao parsear evento:', e);
                    }
                }
            }

            setSucesso(
                `✅ Processamento concluído! ${pecasSalvas} produtos salvos${pecasErro > 0 ? `, ${pecasErro} erros` : ''}`
            );

            setProdutosCriados(produtosProcessados);
            // ✅ Chamar callback IMEDIATAMENTE para recarregar catálogo
            if (onProdutosCriados) {
                onProdutosCriados(produtosProcessados);
            }

            // Fechar o componente após 5 segundos para o usuário ver o resumo
            setTimeout(() => {
                setImagens([]);
                setPreview([]);
                setSucesso(null);
                setStatusPecas([]);
                setProdutosCriados([]);
                if (onCancelar) onCancelar();
            }, 5000);
        } catch (e) {
            console.error('Erro ao processar imagens:', e);
            setErro('Erro ao processar imagens. Tente novamente.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                📦 Cadastro de Produtos por Imagens em Lote
            </h2>

            {/* MENSAGENS */}
            {erro && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">❌ Erro:</p>
                    <p className="text-red-600 text-sm mt-1">{erro}</p>
                </div>
            )}

            {sucesso && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 font-medium">{sucesso}</p>
                </div>
            )}

            {/* FEEDBACK VISUAL DE PROCESSAMENTO */}
            {statusPecas.length > 0 && (
                <div className="mb-6 space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        📊 Progresso: {statusPecas.filter(p => p.status === 'sucesso').length}/{statusPecas.length} peças concluídas
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {statusPecas.map((peca, idx) => (
                            <div key={idx} className="border-l-4 rounded overflow-hidden bg-white shadow-sm" style={{
                                borderLeftColor:
                                    peca.status === 'sucesso' ? '#10b981' :
                                        peca.status === 'erro' ? '#ef4444' :
                                            '#3b82f6'
                            }}>
                                <div className="flex items-stretch">
                                    {/* IMAGEM DO PRODUTO */}
                                    <div className="w-24 h-24 flex-shrink-0 bg-gray-100">
                                        {peca.foto ? (
                                            <img
                                                src={peca.foto}
                                                alt={peca.nomeArquivo}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                                <span className="text-gray-500">📸</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* CONTEÚDO */}
                                    <div className="flex-1 p-4 flex items-start justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900 text-sm">
                                                Peça {peca.numero}/{peca.total}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                {peca.nomeArquivo}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2 font-medium">
                                                {peca.status === 'pendente' && '⏳ Aguardando...'}
                                                {peca.status === 'iniciando' && '🚀 Iniciando...'}
                                                {peca.status === 'ia' && '🤖 IA analisando...'}
                                                {peca.status === 'sku' && '🔑 Gerando SKU...'}
                                                {peca.status === 'cloudinary' && '☁️ Upload nuvem...'}
                                                {peca.status === 'banco' && '💾 Salvando BD...'}
                                                {peca.status === 'sucesso' && `✅ SKU: ${peca.sku}`}
                                                {peca.status === 'erro' && `❌ ${peca.erro}`}
                                            </p>
                                        </div>
                                        <div className="ml-2 flex-shrink-0 text-3xl">
                                            {peca.status === 'sucesso' && '✅'}
                                            {peca.status === 'erro' && '❌'}
                                            {['pendente', 'iniciando', 'ia', 'sku', 'cloudinary', 'banco'].includes(peca.status) && '⏳'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {resumoFinal && (
                        <div className="mt-6 pt-4 border-t border-gray-300">
                            <p className="text-sm text-gray-700">
                                <span className="font-bold text-green-600">{resumoFinal.produtosSalvos}</span> produtos salvos |
                                <span className="font-bold text-red-600 ml-2">{resumoFinal.erros}</span> erros
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* DESCRIÇÃO */}
            {statusPecas.length === 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 font-medium">📸 Como Funciona:</p>
                    <p className="text-blue-600 text-sm mt-2">
                        1. Selecione múltiplas fotos de produtos<br />
                        2. O sistema analisará cada imagem automaticamente<br />
                        3. A IA extrairá dados como cor, categoria e estilo<br />
                        4. Fotos serão enviadas para a nuvem<br />
                        5. Produtos serão salvos no banco com SKU gerado
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit} className={statusPecas.length > 0 ? 'hidden' : 'space-y-6'}>
                {/* UPLOAD DE IMAGENS */}
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center bg-blue-50">
                    <p className="text-blue-700 font-semibold mb-4">
                        📸 Selecione múltiplas imagens de roupas
                    </p>
                    <p className="text-gray-600 text-sm mb-4">
                        Formatos aceitos: JPEG, PNG, WebP
                    </p>

                    <input
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.webp,.gif"
                        onChange={handleImagensMudadas}
                        disabled={carregando}
                        className="block mx-auto mb-4 cursor-pointer"
                    />

                    {imagens.length > 0 && (
                        <p className="text-sm text-blue-600 font-medium">
                            ✅ {imagens.length} imagem{imagens.length !== 1 ? 's' : ''} selecionada{imagens.length !== 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* PREVIEW DAS IMAGENS */}
                {preview.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            📋 Prévia das Imagens ({preview.length})
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {preview.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg border border-gray-300 group-hover:border-red-500 transition"
                                    />
                                    <p className="text-xs text-gray-600 mt-1 text-center truncate">
                                        {imagens[index].name}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => removerImagem(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-bold text-xs"
                                        title="Remover imagem"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BOTÕES */}
                <div className="flex gap-4 justify-end">
                    {onCancelar && (
                        <button
                            type="button"
                            onClick={onCancelar}
                            disabled={carregando}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    )}

                    <button
                        type="submit"
                        disabled={imagens.length === 0 || carregando}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
                    >
                        {carregando ? '⏳ Processando...' : `📤 Processar ${imagens.length} Imagem${imagens.length !== 1 ? 'ns' : ''}`}
                    </button>
                </div>
            </form>
        </div>
    );
}
