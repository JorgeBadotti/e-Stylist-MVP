import React, { useState, useEffect } from 'react';
import { useProductForm } from './hooks/useProductForm';
import { DadosProduto, Dicionario, DicionariosMap } from './types';
import { FormProductIdentification } from './FormProductIdentification';
import { FormProductSKU } from './FormProductSKU';
import { FormProductDetails } from './FormProductDetails';
import { FormProductAttributes } from './FormProductAttributes';
import { FormProductSpecs } from './FormProductSpecs';

/**
 * CadastroProdutoSKU.tsx
 * 
 * Interface para cadastro de produto com SKU STYLEME v1
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

interface CadastroProdutoSKUProps {
    lojaId: string;
    onProdutoCriado?: (produto: any) => void;
    onCancelar?: () => void;
}

export default function CadastroProdutoSKU({
    lojaId,
    onProdutoCriado,
    onCancelar
}: CadastroProdutoSKUProps) {
    // ═══════════════════════════════════════════════════════════
    // ESTADOS
    // ═══════════════════════════════════════════════════════════

    const [dicionarios, setDicionarios] = useState<DicionariosMap>({});
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);
    const [sucesso, setSucesso] = useState<string | null>(null);

    // Custom Hook para gerenciar estado do formulário
    const { dados, handleChange, updateFormData } = useProductForm();

    // ═══════════════════════════════════════════════════════════
    // CARREGAR DICIONÁRIOS AO MONTAR
    // ═══════════════════════════════════════════════════════════

    useEffect(() => {
        carregarDicionarios();
    }, []);

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

    // handleChange vem do hook useProductForm

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

            // Campos opcionais - SEMPRE enviar mesmo que vazio para permitir limpeza
            formData.append('descricao', dados.descricao || '');
            formData.append('silhueta', dados.silhueta || '');
            formData.append('comprimento', dados.comprimento || '');
            formData.append('posicao_cintura', dados.posicao_cintura || '');
            formData.append('ocasiao', dados.ocasiao || '');
            formData.append('estacao', dados.estacao || '');
            formData.append('temperatura', dados.temperatura || '');
            formData.append('material_principal', dados.material_principal || '');
            formData.append('eco_score', dados.eco_score || '');
            formData.append('care_level', dados.care_level || '');
            formData.append('faixa_preco', dados.faixa_preco || '');
            if (dados.peca_hero) formData.append('peca_hero', 'true');
            formData.append('classe_margem', dados.classe_margem || '');

            // Imagem - se for base64 do InputFile
            if (dados.imagem && dados.imagem.startsWith('data:image')) {
                formData.append('foto', dados.imagem);
            }

            // Enviar
            const response = await fetch('/api/produtos', {
                method: 'POST',
                body: formData
            });

            console.log(`📤 [CadastroProdutoSKU] POST /api/produtos - Status: ${response.status}`);

            const resultado = await response.json();

            if (!response.ok) {
                console.error(`❌ [CadastroProdutoSKU] Erro:`, resultado);
                setErro(resultado.message || 'Erro ao criar produto');
                return;
            }

            // Sucesso
            console.log(`✅ [CadastroProdutoSKU] Produto criado com SKU:`, resultado.skuStyleMe);
            setSucesso(`✅ Produto criado! SKU: ${resultado.skuStyleMe}`);

            if (onProdutoCriado) {
                onProdutoCriado(resultado.produto);
            }

            // Limpar formulário
            setTimeout(() => {
                updateFormData({
                    categoria: '',
                    linha: '',
                    cor_codigo: '',
                    tamanho: '',
                    colecao: '',
                    layer_role: '',
                    color_role: '',
                    fit: '',
                    style_base: '',
                    nome: '',
                    imagem: ''
                });
                setSucesso(null);
            }, 2000);
        } catch (e) {
            console.error('Erro ao criar produto:', e);
            setErro('Erro ao criar produto');
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
                📦 Cadastro de Produto
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
                {/* SEÇÃO 1: IDENTIFICAÇÃO DO PRODUTO (CATEGORIA, LINHA, COR, TAMANHO) */}
                <FormProductIdentification
                    formData={dados}
                    dicionarios={dicionarios}
                    onChange={handleChange}
                />

                {/* SEÇÃO 2: NÚCLEO DE COMBINAÇÃO (LAYER, COLOR, FIT, STYLE) */}
                <FormProductSKU
                    formData={dados}
                    dicionarios={dicionarios}
                    onChange={handleChange}
                />

                {/* SEÇÃO 3: DADOS TÉCNICOS (NOME, DESCRIÇÃO, IMAGEM) */}
                <FormProductDetails
                    formData={dados}
                    onChange={handleChange}
                />

                {/* SEÇÃO 4: ATRIBUTOS DO PRODUTO (SILHUETA, COMPRIMENTO, OCASIÃO, etc) */}
                <FormProductAttributes
                    formData={dados}
                    dicionarios={dicionarios}
                    onChange={handleChange}
                />

                {/* SEÇÃO 5: ESPECIFICAÇÕES TÉCNICAS (TEMPERATURA, MATERIAL, ECO SCORE, etc) */}
                <FormProductSpecs
                    formData={dados}
                    dicionarios={dicionarios}
                    onChange={handleChange}
                />

                {/* BOTÕES DE AÇÃO */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={enviando}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {enviando ? '⏳ Criando...' : '✅ Criar Produto'}
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
