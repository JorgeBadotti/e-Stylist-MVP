import api from './api';
import { Produto } from '../types/types';

// Busca a lista completa de produtos do catálogo
export const getCatalogo = async (): Promise<Produto[]> => {
  try {
    // A rota no backend foi ajustada para /api/lojas/
    const response = await api.get('/api/lojas');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar o catálogo:', error);
    throw error;
  }
};

// ✅ NOVO: Busca os produtos de uma loja específica
export const getProdutosLoja = async (lojaId: string): Promise<Produto[]> => {
  try {
    console.log(`🔄 [lojaService] Buscando produtos da loja ${lojaId}...`);
    const response = await api.get(`/api/lojas/${lojaId}/produtos`);
    console.log(`✅ [lojaService] ${response.data.length} produtos encontrados`);
    return response.data;
  } catch (error) {
    console.error(`❌ [lojaService] Erro ao buscar produtos da loja ${lojaId}:`, error);
    throw error;
  }
};

// Busca os detalhes de um produto específico pelo SKU
export const getProdutoBySku = async (sku: string): Promise<Produto> => {
  try {
    const response = await api.get(`/api/lojas/catalog/${sku}`); // Esta rota pode precisar de ajuste
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar produto com SKU ${sku}:`, error);
    throw error;
  }
};

/**
 * Adiciona um novo produto ao catálogo de uma loja.
 * @param lojaId - O ID da loja onde o produto será adicionado.
 * @param formData - Os dados do produto, incluindo as fotos, no formato FormData.
 * @returns O novo produto criado.
 */
export const adicionarProduto = async (lojaId: string, formData: FormData): Promise<Produto> => {
  try {
    const response = await api.post(`/api/lojas/${lojaId}/produtos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.produto;
  } catch (error) {
    console.error('Erro ao adicionar produto:', error);
    throw error;
  }
};

