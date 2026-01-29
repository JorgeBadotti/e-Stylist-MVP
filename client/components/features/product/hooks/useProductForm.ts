import React, { useState } from 'react';
import { DadosProduto } from '../types';

const initialFormData: DadosProduto = {
    // SKU STYLEME - Identificação
    categoria: '',
    linha: '',
    cor_codigo: '',
    tamanho: '',

    // SKU STYLEME - Classificação
    colecao: '',
    layer_role: '',
    color_role: '',
    fit: '',
    style_base: '',

    // Dados Técnicos
    nome: '',
    descricao: '',
    imagem: '',

    // Atributos Físicos
    silhueta: '',
    comprimento: '',
    posicao_cintura: '',
    ocasiao: '',
    estacao: '',

    // Especificações
    temperatura: '',
    material_principal: '',
    eco_score: '',
    care_level: '',
    faixa_preco: '',
    peca_hero: false,
    classe_margem: ''
};

interface UseProductFormReturn {
    dados: DadosProduto;
    setDados: (data: DadosProduto) => void;
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    updateFormData: (data: Partial<DadosProduto>) => void;
}

/**
 * Hook para gerenciar estado do formulário de produto
 * Reutiliza lógica de handleChange para todos os campos
 */
export const useProductForm = (initialData: DadosProduto = initialFormData): UseProductFormReturn => {
    const [dados, setDados] = useState<DadosProduto>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as any;

        // Se for checkbox, pega o checked em vez do value
        const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setDados(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const updateFormData = (data: Partial<DadosProduto>) => {
        setDados(prev => ({ ...prev, ...data }));
    };

    return { dados, setDados, handleChange, updateFormData };
};
