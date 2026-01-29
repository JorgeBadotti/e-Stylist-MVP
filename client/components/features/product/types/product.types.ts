/**
 * Product Types
 * Tipos compartilhados para o módulo de produtos
 */

export interface Dicionario {
    _id: string;
    codigo: string;
    descricao: string;
    categoria_pai?: string;
}

export interface DadosProduto {
    // SKU STYLEME - Identificação
    categoria: string;
    linha: string;
    cor_codigo: string;
    tamanho: string;

    // SKU STYLEME - Classificação
    colecao: string;
    layer_role: string;
    color_role: string;
    fit: string;
    style_base: string;

    // Dados Técnicos
    nome: string;
    descricao?: string;
    imagem?: string; // URL ou base64

    // Atributos Físicos
    silhueta?: string;
    comprimento?: string;
    posicao_cintura?: string;
    ocasiao?: string;
    estacao?: string;

    // Especificações
    temperatura?: string;
    material_principal?: string;
    eco_score?: string;
    care_level?: string;
    faixa_preco?: string;
    peca_hero?: boolean;
    classe_margem?: string;
}

export interface ProductPayload {
    // SKU STYLEME
    categoria: string;
    linha: string;
    cor_codigo: string;
    tamanho: string;
    colecao: string;
    layer_role: string;
    color_role: string;
    fit: string;
    style_base: string;

    // Dados Técnicos
    nome: string;
    descricao?: string;
    imagem?: string;

    // Atributos
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
}

export interface Message {
    type: 'success' | 'error';
    text: string;
}

export interface DicionariosMap {
    [key: string]: Dicionario[];
}
