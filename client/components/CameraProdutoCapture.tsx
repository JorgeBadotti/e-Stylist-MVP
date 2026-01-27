import React, { useState } from 'react';
import CameraCapture from './CameraCapture';

/**
 * CameraProdutoCapture.tsx
 * 
 * Wrapper que usa CameraCapture genérico para captura de fotos de produtos
 * Converte base64 para FormData e envia para análise com IA
 * Realiza streaming NDJSON de progresso de criação
 */

interface CameraProdutoCaptureProps {
    lojaId: string;
    onProdutosCriados?: (produtos: any[]) => void;
    onCancelar?: () => void;
}

export default function CameraProdutoCapture({
    lojaId,
    onProdutosCriados,
    onCancelar
}: CameraProdutoCaptureProps) {
    const [enviando, setEnviando] = useState(false);
    const [statusMensagem, setStatusMensagem] = useState<string | null>(null);
    const [progresso, setProgresso] = useState({ processados: 0, total: 1 });

    /**
     * Handler para quando a câmera captura uma foto (base64)
     * Converte para FormData e envia ao endpoint de análise
     */
    const handlePhotoCapture = async (base64String: string) => {
        try {
            setEnviando(true);
            setStatusMensagem('🔄 Enviando para análise...');
            setProgresso({ processados: 0, total: 1 });

            // ════════════════════════════════════════════════════════════
            // CONVERTER BASE64 DATA URL PARA BLOB
            // ════════════════════════════════════════════════════════════
            // base64String é como: "data:image/jpeg;base64,/9j/4AAQSkZJR..."
            const arr = base64String.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
            const bstr = atob(arr[1]);
            const n = bstr.length;
            const u8arr = new Uint8Array(n);

            for (let i = 0; i < n; i++) {
                u8arr[i] = bstr.charCodeAt(i);
            }

            const blob = new Blob([u8arr], { type: mime });

            // Criar FormData com a imagem
            const formData = new FormData();
            formData.append('imagens', blob, 'produto.jpg');
            formData.append('lojaId', lojaId);

            console.log(`📸 [CameraProdutoCapture] Enviando para análise...`);
            console.log(`   - Tamanho do blob: ${blob.size} bytes`);
            console.log(`   - MIME type: ${blob.type}`);

            // Enviar para endpoint que retorna NDJSON
            const resultado = await fetch('/api/produtos/lotes/imagens', {
                method: 'POST',
                body: formData
            });

            if (!resultado.ok) {
                throw new Error(`Erro HTTP: ${resultado.status}`);
            }

            // ════════════════════════════════════════════════════════════
            // PARSEAR STREAM NDJSON
            // ════════════════════════════════════════════════════════════
            const reader = resultado.body?.getReader();
            if (!reader) {
                throw new Error('Não foi possível acessar o stream de resposta');
            }

            const decoder = new TextDecoder();
            let buffer = '';
            const produtosGravados: any[] = [];

            while (true) {
                const { done, value } = await reader.read();

                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                }

                if (done) {
                    buffer += decoder.decode(); // Flush final
                }

                // Processar linhas completas
                const linhas = buffer.split('\n');
                buffer = linhas[linhas.length - 1]; // Manter linha incompleta

                for (let i = 0; i < linhas.length - 1; i++) {
                    const linha = linhas[i].trim();
                    if (!linha) continue;

                    try {
                        const evento = JSON.parse(linha);

                        switch (evento.tipo) {
                            case 'iniciando':
                                setStatusMensagem(`⏳ Analisando produto (${evento.numeroPeca}/${evento.totalPecas})...`);
                                setProgresso({ processados: evento.numeroPeca - 1, total: evento.totalPecas });
                                break;

                            case 'analisando_ia':
                                setStatusMensagem(`🤖 Analisando com IA...`);
                                break;

                            case 'gerando_sku':
                                setStatusMensagem(`🏷️  Gerando SKU...`);
                                break;

                            case 'enviando_cloudinary':
                                setStatusMensagem(`☁️  Enviando para nuvem...`);
                                break;

                            case 'salvando_banco':
                                setStatusMensagem(`💾 Salvando no banco...`);
                                break;

                            case 'sucesso':
                                if (evento.produto) {
                                    produtosGravados.push(evento.produto);
                                }
                                setStatusMensagem(`✅ Produto criado: ${evento.produto?.skuStyleMe || 'SKU desconhecido'}`);
                                setProgresso({ processados: evento.numeroPeca, total: evento.totalPecas });
                                break;

                            case 'erro':
                                setStatusMensagem(`❌ Erro no produto ${evento.numeroPeca}: ${evento.mensagem}`);
                                break;

                            case 'concluido':
                                setStatusMensagem(`🎉 Concluído! ${evento.resumo?.produtosSalvos || 0} produto(s) criado(s)`);
                                // Callback com produtos gravados
                                if (onProdutosCriados && produtosGravados.length > 0) {
                                    onProdutosCriados(produtosGravados);
                                }
                                // Fechar após 2s
                                setTimeout(() => {
                                    setEnviando(false);
                                    setStatusMensagem(null);
                                    if (onCancelar) onCancelar();
                                }, 2000);
                                return;
                        }
                    } catch (parseError) {
                        console.warn('Erro ao parsear linha NDJSON:', linha, parseError);
                    }
                }

                if (done) break;
            }
        } catch (error) {
            console.error('Erro ao enviar para análise:', error);
            setStatusMensagem(`❌ Erro: ${error instanceof Error ? error.message : 'Desconhecido'}`);
            setEnviando(false);
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Header com instruções */}
            {!enviando && !statusMensagem && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold text-gray-800 mb-2">📸 Capturar Foto do Produto</h3>
                    <p className="text-sm text-gray-600">
                        Tire uma foto clara do seu produto com boa iluminação. A IA analisará automaticamente e criará a ficha com SKU.
                    </p>
                </div>
            )}

            {/* Componente da câmera */}
            <CameraCapture
                onPhotoCapture={handlePhotoCapture}
                isLoading={enviando}
                buttonText="📷 Capturar Foto do Produto"
                facingMode="environment"
                showPreview={true}
            />

            {/* Status e Progresso durante processamento */}
            {statusMensagem && (
                <div className="animate-fadeIn space-y-3">
                    {/* Card de status */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-300 rounded-xl p-6 shadow-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="text-3xl">{enviando ? '⚙️' : '✅'}</div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-600">Status do Processamento</p>
                                <p className="text-lg font-bold text-gray-800">{statusMensagem}</p>
                            </div>
                        </div>

                        {/* Barra de progresso */}
                        {enviando && progresso.total > 0 && (
                            <div className="mt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-600">
                                        Processado: {progresso.processados}/{progresso.total}
                                    </span>
                                    <span className="text-xs font-medium text-gray-600">
                                        {Math.round((progresso.processados / progresso.total) * 100)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                                        style={{
                                            width: `${(progresso.processados / progresso.total) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Passo a passo de processamento */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            {[
                                { icon: '🤖', label: 'Análise IA', active: statusMensagem?.includes('Analisando') },
                                { icon: '🏷️', label: 'Gerar SKU', active: statusMensagem?.includes('Gerando') },
                                { icon: '☁️', label: 'Cloudinary', active: statusMensagem?.includes('nuvem') },
                                { icon: '💾', label: 'Banco Dados', active: statusMensagem?.includes('Salvando') }
                            ].map((passo, i) => (
                                <div
                                    key={i}
                                    className={`p-2 rounded-lg text-center transition-all ${passo.active
                                            ? 'bg-blue-500 text-white font-semibold'
                                            : statusMensagem?.includes('Concluído')
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}
                                >
                                    <div className="text-lg mb-1">{passo.icon}</div>
                                    <div className="text-xs">{passo.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
