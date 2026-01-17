import api from './api';

export interface GuardaRoupa {
  _id: string;
  nome: string;
  descricao?: string;
  foto?: string;
  isPublic: boolean;
  createdAt: string;
}

// Buscar todas as coleções (GuardaRoupas) do usuário logado
export const minhasColecoes = async (): Promise<GuardaRoupa[]> => {
  try {
    console.log('📚 [guardaRoupaService] Buscando coleções do usuário...');
    const response = await api.get('/api/guarda-roupas');
    console.log(`✅ [guardaRoupaService] ${response.data.length} coleções encontradas`);
    return response.data;
  } catch (error) {
    console.error('❌ [guardaRoupaService] Erro ao buscar coleções:', error);
    throw error;
  }
};

// Buscar uma coleção específica
export const getColecaoById = async (id: string): Promise<GuardaRoupa> => {
  try {
    const response = await api.get(`/api/guarda-roupas/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ [guardaRoupaService] Erro ao buscar coleção:', error);
    throw error;
  }
};

// Criar nova coleção
export const criarColecao = async (formData: FormData): Promise<GuardaRoupa> => {
  try {
    const response = await api.post('/api/guarda-roupas', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ [guardaRoupaService] Erro ao criar coleção:', error);
    throw error;
  }
};

// Atualizar coleção
export const atualizarColecao = async (id: string, formData: FormData): Promise<GuardaRoupa> => {
  try {
    const response = await api.put(`/api/guarda-roupas/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('❌ [guardaRoupaService] Erro ao atualizar coleção:', error);
    throw error;
  }
};

// Deletar coleção
export const deletarColecao = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/guarda-roupas/${id}`);
    console.log(`✅ [guardaRoupaService] Coleção ${id} deletada`);
  } catch (error) {
    console.error('❌ [guardaRoupaService] Erro ao deletar coleção:', error);
    throw error;
  }
};
