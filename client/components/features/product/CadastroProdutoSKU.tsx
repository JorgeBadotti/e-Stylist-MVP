import React, { useState } from 'react';
import { useProductForm } from './hooks/useProductForm';
import { useDicionarios } from './hooks/useDicionarios';
import { useProductValidation } from './hooks/useProductValidation';
import { useProductSubmit } from './hooks/useProductSubmit';
import { FormProductIdentification } from './FormProductIdentification';
import { FormProductSKU } from './FormProductSKU';
import { FormProductDetails } from './FormProductDetails';
import { FormProductAttributes } from './FormProductAttributes';
import { FormProductSpecs } from './FormProductSpecs';
import { FormHeader } from './FormHeader';
import { FormMessages } from './FormMessages';
import { FormActions } from './FormActions';
import { LoadingSpinner } from './LoadingSpinner';

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
    // HOOKS
    // ═══════════════════════════════════════════════════════════

    const { dicionarios, carregando, erro: erroCarregamento } = useDicionarios();
    const { dados, handleChange, updateFormData } = useProductForm();
    const { validarFormulario } = useProductValidation();
    const {
        enviando,
        erro,
        sucesso,
        setErro,
        setSucesso,
        handleSubmit: submitFormulario
    } = useProductSubmit({
        lojaId,
        onProdutoCriado
    });

    // Mostrar erro de carregamento se houver
    const erroTotal = erroCarregamento || erro;

    // Handler para submit com limpeza após sucesso
    const handleSubmitFormulario = async (e: React.FormEvent) => {
        await submitFormulario(e, dados, validarFormulario);

        // Limpar formulário após 2 segundos se foi sucesso
        if (sucesso) {
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
        }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDERIZAÇÃO
    // ═══════════════════════════════════════════════════════════

    if (carregando) {
        return <LoadingSpinner message="Carregando dicionários..." />;
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <FormHeader
                icon="📦"
                title="Cadastro de Produto"
                subtitle="Configure todos os detalhes e características do seu produto"
            />

            <FormMessages erro={erroTotal} sucesso={sucesso} />

            <form onSubmit={handleSubmitFormulario} className="space-y-8">
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
                <FormActions
                    enviando={enviando}
                    onCancel={onCancelar}
                    submitLabel={enviando ? '⏳ Criando...' : '✅ Criar Produto'}
                    cancelLabel="❌ Cancelar"
                />
            </form>
        </div>
    );
}
