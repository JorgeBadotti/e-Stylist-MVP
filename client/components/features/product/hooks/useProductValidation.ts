import { DadosProduto } from '../types';

interface UseProductValidationReturn {
    validarFormulario: (dados: DadosProduto) => string[];
}

/**
 * Hook para validar dados do formulário de produto
 * Centraliza todas as regras de validação
 */
export const useProductValidation = (): UseProductValidationReturn => {
    const validarFormulario = (dados: DadosProduto): string[] => {
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

    return { validarFormulario };
};
