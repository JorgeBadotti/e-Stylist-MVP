import React, { useState } from 'react';

/**
 * CadastroProdutoSKULotes.tsx
 * 
 * Interface para cadastro em LOTES de produtos com SKU STYLEME v1
 * Integrada em AdminLojaPage para STORE_ADMIN
 * 
 * Features:
 * - Upload múltiplo de imagens de roupas
 * - Análise automática por IA (em desenvolvimento)
 * - Extração de dados visuais
 * - Criação automática de SKUs
 * - Relatório de sucesso/erro
 */

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

    const handleImagensMudadas = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            // Validar tipos de arquivo por extensão - JPEG, PNG e WebP
            const extensoesValidas = ['jpg', 'jpeg', 'png', 'webp'];
            const novasImagens: File[] = [];
            const novoPreview: string[] = [];
            let arquivosProcessados = 0;

            console.log(`📁 Total de arquivos selecionados: ${files.length}`);

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const extensao = file.name.split('.').pop()?.toLowerCase();

                // Validar apenas por extensão (mais confiável que MIME type)
                if (!extensao || !extensoesValidas.includes(extensao)) {
                    console.warn(`❌ Arquivo rejeitado: ${file.name} (extensão inválida)`);
                    continue;
                }

                console.log(`✅ Arquivo aceito: ${file.name} (.${extensao})`);
                novasImagens.push(file);

                // Criar preview
                const reader = new FileReader();
                reader.onloadend = () => {
                    novoPreview.push(reader.result as string);
                    arquivosProcessados++;

                    // Quando todos os previews estiverem prontos
                    if (arquivosProcessados === novasImagens.length) {
                        setPreview((prev) => [...prev, ...novoPreview]);
                        console.log(`✅ ${novasImagens.length} imagens carregadas com sucesso`);
                    }
                };
                reader.onerror = () => {
                    console.error(`❌ Erro ao ler arquivo: ${file.name}`);
                    arquivosProcessados++;
                };
                reader.readAsDataURL(file);
            }

            setImagens((prev) => [...prev, ...novasImagens]);
            setErro(null);

            if (novasImagens.length === 0 && files.length > 0) {
                setErro(`Por favor, selecione apenas imagens em formato JPEG, PNG ou WebP. (${files.length} arquivo(s) rejeitado(s))`);
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

        if (imagens.length === 0) {
            setErro('Por favor, selecione pelo menos uma imagem');
            return;
        }

        try {
            setCarregando(true);

            const formData = new FormData();
            imagens.forEach((img) => {
                formData.append('imagens', img);
            });
            formData.append('lojaId', lojaId);

            // Chamar endpoint do backend
            const response = await fetch('/api/produtos/lotes/imagens', {
                method: 'POST',
                body: formData
            });

            const resultado = await response.json();

            if (!response.ok) {
                setErro(resultado.message || 'Erro ao processar imagens');
                return;
            }

            // Sucesso
            setSucesso(
                `✅ ${resultado.quantidade || imagens.length} produtos processados com sucesso!`
            );

            if (onProdutosCriados) {
                onProdutosCriados(resultado.produtos || []);
            }

            // Limpar
            setTimeout(() => {
                setImagens([]);
                setPreview([]);
                setSucesso(null);
                if (onCancelar) onCancelar();
            }, 2000);
        } catch (e) {
            console.error('Erro ao processar imagens:', e);
            setErro('Erro ao processar imagens');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                �️ Cadastro de Produtos por Imagens
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

            {/* DESCRIÇÃO */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-700 font-medium">📸 Como Funciona:</p>
                <p className="text-blue-600 text-sm mt-2">
                    1. Selecione múltiplas fotos de produtos<br />
                    2. O sistema analisará as imagens automaticamente<br />
                    3. Dados como cor, material e estilo serão extraídos<br />
                    4. Produtos serão criados automaticamente com SKU gerado
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
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
