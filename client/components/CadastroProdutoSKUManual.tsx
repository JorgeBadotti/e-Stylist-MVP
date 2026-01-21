import React, { useState, useEffect } from 'react';

/**
 * CadastroProdutoSKUManual.tsx
 * 
 * Interface para cadastro MANUAL de produto com SKU STYLEME v1
 * Integrada em AdminLojaPage para STORE_ADMIN
 * 
 * Features:
 * - Carregamento automático de dicionários
 * - Dropdowns dinâmicos
 * - Preview de SKU em tempo real
 * - Validação de campos obrigatórios
 * - Upload de imagem
 * - Feedback visual (sucesso/erro)
 */

interface Dicionario {
    _id: string;
    codigo: string;
    descricao: string;
    categoria_pai?: string;
}

interface DadosProduto {
    categoria: string;
    linha: string;
    cor_codigo: string;
    tamanho: string;
    colecao: string;
    layer_role: string;
    color_role: string;
    fit: string;
    style_base: string;
    nome: string;
    descricao?: string;
    silhueta?: string;
    comprimento?: string;
    posicao_cintura?: string;
    ocasiao?: string;
    estacao?: string;
    temperatura?: string;
    material_principal?: string;
    eco_score?: string;
    care_level?: string;
    faixa_preco?: string;
    peca_hero?: boolean;
    classe_margem?: string;
    preco?: number;
    estoque?: number;
}

interface CadastroProdutoSKUManualProps {
    lojaId: string;
    onProdutoCriado?: (produto: any) => void;
    onCancelar?: () => void;
    produtoEditar?: any; // Dados do produto para edição
    skuOriginal?: string; // SKU original quando editando
}

export default function CadastroProdutoSKUManual({
    lojaId,
    onProdutoCriado,
    onCancelar,
    produtoEditar,
    skuOriginal
}: CadastroProdutoSKUManualProps) {
    // ═══════════════════════════════════════════════════════════
    // ESTADOS
    // ═══════════════════════════════════════════════════════════

    const [dicionarios, setDicionarios] = useState<{
        [key: string]: Dicionario[];
    }>({});
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);
    const [imagemPreview, setImagemPreview] = useState<string | null>(null);
    const [arquivo, setArquivo] = useState<File | null>(null);

    const [dados, setDados] = useState<DadosProduto>({
        categoria: '',
        linha: '',
        cor_codigo: '',
        tamanho: '',
        colecao: '',
        layer_role: '',
        color_role: '',
        fit: '',
        style_base: '',
        nome: ''
    });

    const [skuPreview, setSkuPreview] = useState<string>('');

    // ═══════════════════════════════════════════════════════════
    // CARREGAR DICIONÁRIOS E DADOS INICIAIS
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        carregarDicionarios();
    }, []);

    // Preencher formulário com dados do produto se estiver editando
    useEffect(() => {
        if (produtoEditar) {
            setDados({
                categoria: produtoEditar.categoria || '',
                linha: produtoEditar.linha || '',
                cor_codigo: produtoEditar.cor_codigo || '',
                tamanho: produtoEditar.tamanho || '',
                colecao: produtoEditar.colecao || '',
                layer_role: produtoEditar.layer_role || '',
                color_role: produtoEditar.color_role || '',
                fit: produtoEditar.fit || '',
                style_base: produtoEditar.style_base || '',
                nome: produtoEditar.nome || '',
                descricao: produtoEditar.descricao || '',
                silhueta: produtoEditar.silhueta || '',
                comprimento: produtoEditar.comprimento || '',
                posicao_cintura: produtoEditar.posicao_cintura || '',
                ocasiao: produtoEditar.ocasiao || '',
                estacao: produtoEditar.estacao || '',
                temperatura: produtoEditar.temperatura || '',
                material_principal: produtoEditar.material_principal || '',
                eco_score: produtoEditar.eco_score || '',
                care_level: produtoEditar.care_level || '',
                faixa_preco: produtoEditar.faixa_preco || '',
                peca_hero: produtoEditar.peca_hero || false,
                classe_margem: produtoEditar.classe_margem || '',
                preco: produtoEditar.preco || undefined,
                estoque: produtoEditar.estoque || undefined
            });
            if (produtoEditar.foto) {
                setImagemPreview(produtoEditar.foto);
            }
        }
    }, [produtoEditar]);

    const carregarDicionarios = async () => {
        try {
            setCarregando(true);
            const tipos = [
                'CATEGORIA',
                'LINHA',
                'COR',
                'TAMANHO',
                'LAYER_ROLE',
                'COLOR_ROLE',
                'FIT',
                'STYLE_BASE',
                'SILHUETA',
                'COMPRIMENTO',
                'POSICAO_CINTURA',
                'OCASIAO',
                'ESTACAO',
                'TEMPERATURA',
                'MATERIAL',
                'ECO_SCORE',
                'CARE_LEVEL',
                'FAIXA_PRECO'
            ];

            const dicsCarregados: { [key: string]: Dicionario[] } = {};

            for (const tipo of tipos) {
                try {
                    const url = `/api/produtos/dicionarios/?tipo=${tipo}`;
                    console.log(`📚 [CadastroProdutoSKU] Carregando dicionário: ${url}`);
                    const response = await fetch(url);
                    console.log(`✅ [CadastroProdutoSKU] ${tipo} - Status: ${response.status}`);
                    if (response.ok) {
                        const data = await response.json();
                        dicsCarregados[tipo] = data.dados || [];
                        console.log(`✅ [CadastroProdutoSKU] ${tipo} carregado: ${dicsCarregados[tipo].length} valores`);
                    } else {
                        console.error(`❌ [CadastroProdutoSKU] ${tipo} - Erro ${response.status}:`, response.statusText);
                    }
                } catch (e) {
                    console.error(`❌ [CadastroProdutoSKU] Erro ao carregar ${tipo}:`, e);
                }
            }

            setDicionarios(dicsCarregados);
            setCarregando(false);
        } catch (e) {
            setErro('Erro ao carregar dicionários');
            setCarregando(false);
            console.error(e);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // ATUALIZAR CAMPO
    // ═══════════════════════════════════════════════════════════

    const atualizarCampo = (
        campo: keyof DadosProduto,
        valor: string | boolean
    ) => {
        const novosDados = { ...dados, [campo]: valor };
        setDados(novosDados as DadosProduto);

        // Gerar preview de SKU se mudar campos relevantes
        if (
            ['categoria', 'linha', 'cor_codigo', 'tamanho', 'colecao'].includes(
                campo
            )
        ) {
            gerarSkuPreview(novosDados);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // GERAR PREVIEW DE SKU
    // ═══════════════════════════════════════════════════════════

    const gerarSkuPreview = (dadosAtual: DadosProduto) => {
        const { categoria, linha, cor_codigo, tamanho, colecao } = dadosAtual;

        if (categoria && linha && cor_codigo && tamanho && colecao) {
            // Mostrar preview com [SEQ] já que será gerado no backend
            const preview = `${categoria}-${linha}-${cor_codigo}-${tamanho}-[AUTO]-${colecao}`;
            setSkuPreview(preview);
        } else {
            setSkuPreview('');
        }
    };

    // ═══════════════════════════════════════════════════════════
    // PROCESSAR IMAGEM
    // ═══════════════════════════════════════════════════════════

    const handleImagemMudada = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArquivo(file);

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagemPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // VALIDAR FORMULÁRIO
    // ═══════════════════════════════════════════════════════════

    const validarFormulario = (): string[] => {
        const erros: string[] = [];

        // Campos obrigatórios do SKU
        if (!dados.categoria) erros.push('Categoria é obrigatória');
        if (!dados.linha) erros.push('Linha (gênero) é obrigatória');
        if (!dados.cor_codigo) erros.push('Cor é obrigatória');
        if (!dados.tamanho) erros.push('Tamanho é obrigatório');
        if (!dados.colecao) erros.push('Coleção é obrigatória');

        // Campos obrigatórios de combinação
        if (!dados.layer_role) erros.push('Layer role é obrigatório');
        if (!dados.color_role) erros.push('Color role é obrigatório');
        if (!dados.fit) erros.push('Fit é obrigatório');
        if (!dados.style_base) erros.push('Style base é obrigatório');

        // Campo nome
        if (!dados.nome || dados.nome.trim().length === 0) {
            erros.push('Nome do produto é obrigatório');
        }

        return erros;
    };

    // ═══════════════════════════════════════════════════════════
    // ENVIAR FORMULÁRIO
    // ═══════════════════════════════════════════════════════════

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro(null);
        setSucesso(null);

        // Validar
        const errosValidacao = validarFormulario();
        if (errosValidacao.length > 0) {
            setErro(errosValidacao.join('; '));
            return;
        }

        try {
            setEnviando(true);

            // Montar FormData para upload de imagem
            const formData = new FormData();

            // Campos obrigatórios
            formData.append('categoria', dados.categoria);
            formData.append('linha', dados.linha);
            formData.append('cor_codigo', dados.cor_codigo);
            formData.append('tamanho', dados.tamanho);
            formData.append('colecao', dados.colecao);
            formData.append('layer_role', dados.layer_role);
            formData.append('color_role', dados.color_role);
            formData.append('fit', dados.fit);
            formData.append('style_base', dados.style_base);
            formData.append('nome', dados.nome);
            formData.append('lojaId', lojaId);

            // Campos opcionais
            if (dados.descricao) formData.append('descricao', dados.descricao);
            if (dados.silhueta) formData.append('silhueta', dados.silhueta);
            if (dados.comprimento) formData.append('comprimento', dados.comprimento);
            if (dados.posicao_cintura) formData.append('posicao_cintura', dados.posicao_cintura);
            if (dados.ocasiao) formData.append('ocasiao', dados.ocasiao);
            if (dados.estacao) formData.append('estacao', dados.estacao);
            if (dados.temperatura) formData.append('temperatura', dados.temperatura);
            if (dados.material_principal) formData.append('material_principal', dados.material_principal);
            if (dados.eco_score) formData.append('eco_score', dados.eco_score);
            if (dados.care_level) formData.append('care_level', dados.care_level);
            if (dados.faixa_preco) formData.append('faixa_preco', dados.faixa_preco);
            if (dados.peca_hero) formData.append('peca_hero', 'true');
            if (dados.classe_margem) formData.append('classe_margem', dados.classe_margem);

            // Imagem
            if (arquivo) {
                formData.append('foto', arquivo);
            }

            // Determinar método e URL
            const isEditando = !!produtoEditar && !!skuOriginal;
            const metodo = isEditando ? 'PUT' : 'POST';
            const url = isEditando ? `/api/produtos/${skuOriginal}` : '/api/produtos';

            console.log(`📤 [CadastroProdutoSKU] ${metodo} ${url}`);

            // Enviar
            const response = await fetch(url, {
                method: metodo,
                body: formData
            });

            console.log(`📤 [CadastroProdutoSKU] ${metodo} ${url} - Status: ${response.status}`);

            const resultado = await response.json();

            if (!response.ok) {
                console.error(`❌ [CadastroProdutoSKU] Erro:`, resultado);
                setErro(resultado.message || (isEditando ? 'Erro ao atualizar produto' : 'Erro ao criar produto'));
                return;
            }

            // Sucesso
            const mensagem = isEditando
                ? `✅ Produto atualizado com sucesso!`
                : `✅ Produto criado! SKU: ${resultado.skuStyleMe}`;

            console.log(`✅ [CadastroProdutoSKU] ${mensagem}`);
            setSucesso(mensagem);

            if (onProdutoCriado) {
                onProdutoCriado(resultado.produto || resultado);
            }

            // Limpar formulário
            setTimeout(() => {
                if (!isEditando) {
                    setDados({
                        categoria: '',
                        linha: '',
                        cor_codigo: '',
                        tamanho: '',
                        colecao: '',
                        layer_role: '',
                        color_role: '',
                        fit: '',
                        style_base: '',
                        nome: ''
                    });
                    setImagemPreview(null);
                    setArquivo(null);
                    setSkuPreview('');
                }
                setSucesso(null);
            }, 2000);
        } catch (e) {
            console.error('Erro:', e);
            const mensagem = produtoEditar ? 'Erro ao atualizar produto' : 'Erro ao criar produto';
            setErro(mensagem);
        } finally {
            setEnviando(false);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════

    if (carregando) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando dicionários...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
                {produtoEditar ? '✏️ Editar Produto' : '📦 Cadastro de Produto'}
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

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SEÇÃO 1: SKU STYLEME */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        🔑 SKU STYLEME (Obrigatórios)
                    </h3>

                    {/* Aviso de modo edição */}
                    {produtoEditar && (
                        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                            <span className="font-medium">📝 Modo Edição:</span> Você pode editar a maioria dos campos abaixo.
                            Alguns campos (como Coleção) foram marcados com 🔒 pois são imutáveis.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* CATEGORIA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoria <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.categoria}
                                onChange={(e) =>
                                    atualizarCampo('categoria', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                {dicionarios['CATEGORIA']?.map((item) => (
                                    <option key={item._id} value={item.codigo}>
                                        {item.codigo} - {item.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* LINHA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Linha <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.linha}
                                onChange={(e) =>
                                    atualizarCampo('linha', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                {dicionarios['LINHA']?.map((item) => (
                                    <option key={item._id} value={item.codigo}>
                                        {item.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* COR */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cor <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.cor_codigo}
                                onChange={(e) =>
                                    atualizarCampo('cor_codigo', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                {dicionarios['COR']?.map((item) => (
                                    <option key={item._id} value={item.codigo}>
                                        {item.codigo} - {item.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* TAMANHO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tamanho <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.tamanho}
                                onChange={(e) =>
                                    atualizarCampo('tamanho', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                {dicionarios['TAMANHO']?.map((item) => (
                                    <option key={item._id} value={item.codigo}>
                                        {item.codigo} - {item.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* COLEÇÃO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coleção <span className="text-red-600">*</span>
                                {produtoEditar && <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">🔒 Não editável</span>}
                            </label>
                            <select
                                value={dados.colecao}
                                onChange={(e) =>
                                    atualizarCampo('colecao', e.target.value)
                                }
                                disabled={!!produtoEditar}
                                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${produtoEditar ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            >
                                <option value="">Selecione...</option>
                                <option value="S24">S24 - Spring 2024</option>
                                <option value="S25">S25 - Spring 2025</option>
                                <option value="F24">F24 - Fall 2024</option>
                                <option value="F25">F25 - Fall 2025</option>
                                <option value="P24">P24 - Premium 2024</option>
                                <option value="P25">P25 - Premium 2025</option>
                            </select>
                        </div>

                        {/* PREVIEW SKU */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preview SKU
                            </label>
                            <div className="w-full px-3 py-2 border-2 border-blue-500 rounded-md bg-blue-50 font-mono text-sm text-blue-900 flex items-center">
                                {skuPreview || '---'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SEÇÃO 2: NÚCLEO DE COMBINAÇÃO */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        🧠 Núcleo de Combinação (Obrigatórios)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* LAYER ROLE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Layer Role <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.layer_role}
                                onChange={(e) =>
                                    atualizarCampo('layer_role', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="BASE">BASE - Base do look</option>
                                <option value="MID">MID - Camada média</option>
                                <option value="OUT">OUT - Camada externa</option>
                            </select>
                        </div>

                        {/* COLOR ROLE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Color Role <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.color_role}
                                onChange={(e) =>
                                    atualizarCampo('color_role', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="NEUTRO">
                                    NEUTRO - Harmoniza
                                </option>
                                <option value="DESTAQUE">
                                    DESTAQUE - Chama atenção
                                </option>
                            </select>
                        </div>

                        {/* FIT */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fit <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.fit}
                                onChange={(e) =>
                                    atualizarCampo('fit', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="JUSTO">JUSTO - Ajustado</option>
                                <option value="REGULAR">
                                    REGULAR - Segue silhueta
                                </option>
                                <option value="SOLTO">
                                    SOLTO - Cai sobre corpo
                                </option>
                                <option value="OVERSIZE">
                                    OVERSIZE - Maior que tamanho
                                </option>
                            </select>
                        </div>

                        {/* STYLE BASE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Style Base <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={dados.style_base}
                                onChange={(e) =>
                                    atualizarCampo('style_base', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Selecione...</option>
                                <option value="CASUAL">CASUAL - Descontraído</option>
                                <option value="FORMAL">FORMAL - Elegante</option>
                                <option value="SPORT">SPORT - Esportivo</option>
                                <option value="CHIC">CHIC - Sofisticado</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SEÇÃO 3: DADOS TÉCNICOS */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        📝 Dados Técnicos
                    </h3>

                    <div className="space-y-4">
                        {/* NOME */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nome do Produto <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={dados.nome}
                                onChange={(e) =>
                                    atualizarCampo('nome', e.target.value)
                                }
                                placeholder="Ex: Camiseta Básica Preta"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* DESCRIÇÃO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descrição
                            </label>
                            <textarea
                                value={dados.descricao || ''}
                                onChange={(e) =>
                                    atualizarCampo('descricao', e.target.value)
                                }
                                placeholder="Descrição detalhada do produto..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* IMAGEM */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Imagem
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagemMudada}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                />
                                {imagemPreview && (
                                    <img
                                        src={imagemPreview}
                                        alt="Preview"
                                        className="h-20 w-20 object-cover rounded-md"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* SEÇÃO 4: RECOMENDADOS (Colapsável) */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="border-b pb-6">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        📊 Campos Recomendados (Opcionais)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* SILHUETA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Silhueta
                            </label>
                            <select
                                value={dados.silhueta || ''}
                                onChange={(e) =>
                                    atualizarCampo('silhueta', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="A">A - Trapézio</option>
                                <option value="H">H - Reta</option>
                                <option value="V">V - Invertida</option>
                                <option value="O">O - Arredondada</option>
                            </select>
                        </div>

                        {/* COMPRIMENTO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comprimento
                            </label>
                            <select
                                value={dados.comprimento || ''}
                                onChange={(e) =>
                                    atualizarCampo('comprimento', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definido</option>
                                <option value="CURTA">Curta</option>
                                <option value="REGULAR">Regular</option>
                                <option value="LONGA">Longa</option>
                            </select>
                        </div>

                        {/* POSIÇÃO CINTURA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Posição Cintura
                            </label>
                            <select
                                value={dados.posicao_cintura || ''}
                                onChange={(e) =>
                                    atualizarCampo(
                                        'posicao_cintura',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="NATURAL">Natural</option>
                                <option value="ALTO">Alto</option>
                                <option value="BAIXO">Baixo</option>
                            </select>
                        </div>

                        {/* OCASIÃO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ocasião
                            </label>
                            <select
                                value={dados.ocasiao || ''}
                                onChange={(e) =>
                                    atualizarCampo('ocasiao', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                {dicionarios['OCASIAO']?.map((item) => (
                                    <option key={item._id} value={item.codigo}>
                                        {item.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* ESTAÇÃO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estação
                            </label>
                            <select
                                value={dados.estacao || ''}
                                onChange={(e) =>
                                    atualizarCampo('estacao', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="SPRING">Primavera</option>
                                <option value="SUMMER">Verão</option>
                                <option value="FALL">Outono</option>
                                <option value="WINTER">Inverno</option>
                                <option value="ALL">O ano todo</option>
                            </select>
                        </div>

                        {/* TEMPERATURA */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Temperatura
                            </label>
                            <select
                                value={dados.temperatura || ''}
                                onChange={(e) =>
                                    atualizarCampo('temperatura', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="COLD">Frio (até 15°C)</option>
                                <option value="MILD">
                                    Ameno (15-25°C)
                                </option>
                                <option value="HOT">Quente (acima 25°C)</option>
                            </select>
                        </div>

                        {/* MATERIAL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Material Principal
                            </label>
                            <select
                                value={dados.material_principal || ''}
                                onChange={(e) =>
                                    atualizarCampo(
                                        'material_principal',
                                        e.target.value
                                    )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definido</option>
                                <option value="ALGODAO">Algodão</option>
                                <option value="POLIESTER">Poliéster</option>
                                <option value="VISCOSE">Viscose</option>
                                <option value="ELASTANO">Elastano</option>
                                <option value="LINHO">Linho</option>
                                <option value="LA">Lã</option>
                                <option value="SEDA">Seda</option>
                                <option value="DENIM">Denim</option>
                            </select>
                        </div>

                        {/* ECO SCORE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Eco Score
                            </label>
                            <select
                                value={dados.eco_score || ''}
                                onChange={(e) =>
                                    atualizarCampo('eco_score', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definido</option>
                                <option value="EXCELLENT">Excelente</option>
                                <option value="GOOD">Bom</option>
                                <option value="MEDIUM">Médio</option>
                                <option value="LOW">Baixo</option>
                            </select>
                        </div>

                        {/* CARE LEVEL */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Care Level
                            </label>
                            <select
                                value={dados.care_level || ''}
                                onChange={(e) =>
                                    atualizarCampo('care_level', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definido</option>
                                <option value="EASY">Fácil</option>
                                <option value="MEDIUM">Médio</option>
                                <option value="COMPLEX">Complexo</option>
                            </select>
                        </div>

                        {/* FAIXA PREÇO */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Faixa Preço
                            </label>
                            <select
                                value={dados.faixa_preco || ''}
                                onChange={(e) =>
                                    atualizarCampo('faixa_preco', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="BUDGET">Budget</option>
                                <option value="STANDARD">Standard</option>
                                <option value="PREMIUM">Premium</option>
                                <option value="LUXURY">Luxury</option>
                            </select>
                        </div>

                        {/* PEÇA HERO */}
                        <div className="flex items-center pt-6">
                            <input
                                type="checkbox"
                                id="peca_hero"
                                checked={dados.peca_hero || false}
                                onChange={(e) =>
                                    atualizarCampo('peca_hero', e.target.checked)
                                }
                                className="h-4 w-4 text-blue-600 rounded"
                            />
                            <label
                                htmlFor="peca_hero"
                                className="ml-2 text-sm font-medium text-gray-700"
                            >
                                É peça destaque?
                            </label>
                        </div>

                        {/* CLASSE MARGEM */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Classe Margem
                            </label>
                            <select
                                value={dados.classe_margem || ''}
                                onChange={(e) =>
                                    atualizarCampo('classe_margem', e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Não definida</option>
                                <option value="LOW">Low</option>
                                <option value="NORMAL">Normal</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════ */}
                {/* BOTÕES DE AÇÃO */}
                {/* ═══════════════════════════════════════════════════════════ */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={enviando}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {enviando
                            ? (produtoEditar ? '⏳ Atualizando...' : '⏳ Criando...')
                            : (produtoEditar ? '✅ Atualizar Produto' : '✅ Criar Produto')
                        }
                    </button>

                    {onCancelar && (
                        <button
                            type="button"
                            onClick={onCancelar}
                            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            ❌ Cancelar
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
