import api from './api';

export interface Convite {
  _id: string;
  usuario: {
    _id: string;
    email: string;
    nome: string;
  };
  loja: {
    _id: string;
    nome: string;
  };
  email: string;
  status: 'pending' | 'accepted' | 'rejected';
  mensagem?: string;
  criadoEm: string;
  respondidoEm?: string;
}

// Enviar convite para um usuário específico
export const enviarConvite = async (lojaId: string, email: string, mensagem?: string) => {
  const response = await api.post('/api/convites/enviar', { lojaId, email, mensagem });
  return response.data;
};

// Obter minhas invitações (para o usuário logado)
export const minhasInvitacoes = async () => {
  const response = await api.get('/api/convites/minhas');
  return response.data;
};

// Aceitar uma invitação
export const aceitarConvite = async (conviteId: string) => {
  const response = await api.put(`/api/convites/${conviteId}/aceitar`);
  return response.data;
};

// Rejeitar uma invitação
export const rejeitarConvite = async (conviteId: string) => {
  const response = await api.put(`/api/convites/${conviteId}/rejeitar`);
  return response.data;
};

// Listar vendedores de uma loja (apenas para STORE_ADMIN da loja)
export const listarVendedoresLoja = async (lojaId: string) => {
  const response = await api.get(`/api/convites/loja/${lojaId}/vendedores`);
  return response.data;
};

// Listar convites pendentes de uma loja (apenas para STORE_ADMIN da loja)
export const listarConvitesPendentes = async (lojaId: string) => {
  const response = await api.get(`/api/convites/loja/${lojaId}/pendentes`);
  return response.data;
};
