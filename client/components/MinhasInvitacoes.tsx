import React, { useEffect, useState } from 'react';
import { minhasInvitacoes, aceitarConvite, rejeitarConvite, Convite } from '../src/services/conviteService';

export default function MinhasInvitacoes() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const carregarConvites = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await minhasInvitacoes();
      setConvites(data.convites || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar convites';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConvites();
  }, []);

  const handleAceitar = async (conviteId: string) => {
    setProcessingId(conviteId);
    try {
      await aceitarConvite(conviteId);
      setConvites(convites.filter((c) => c._id !== conviteId));
      // ✅ NOVO: Recarregar página após aceitar para atualizar userData
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao aceitar convite';
      setError(`❌ ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejeitar = async (conviteId: string) => {
    setProcessingId(conviteId);
    try {
      await rejeitarConvite(conviteId);
      setConvites(convites.filter((c) => c._id !== conviteId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao rejeitar convite';
      setError(`❌ ${errorMessage}`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 p-8">
        <h1 className="text-4xl font-bold text-gray-900">📧 Minhas Invitações</h1>
        <div className="flex items-center justify-center py-12">
          <p className="text-lg text-gray-600">⏳ Carregando suas invitações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-gray-900">📧 Minhas Invitações</h1>
        {convites.length > 0 && (
          <span className="inline-flex items-center justify-center w-8 h-8 bg-red-600 text-white text-sm font-bold rounded-full">
            {convites.length}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <p className="text-red-700 font-semibold text-lg">{error}</p>
        </div>
      )}

      {convites.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-12 text-center">
          <p className="text-2xl font-bold text-gray-900">😊 Nenhuma invitação pendente</p>
          <p className="text-gray-600 mt-2">Você receberá notificações quando for convidado para vender em uma loja</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {convites.map((convite) => (
            <div
              key={convite._id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-l-4 border-blue-600"
            >
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">🏪 {convite.loja?.nome || 'Loja sem nome'}</h3>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                  Pendente
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Enviado por:</p>
                  <p className="text-gray-900 font-semibold">{convite.usuario?.nome || 'Usuário desconhecido'}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-600">Email:</p>
                  <p className="text-gray-900 font-mono text-sm">{convite.usuario?.email || 'N/A'}</p>
                </div>


                {convite.mensagem && (
                  <div className="space-y-1 p-4 bg-gray-50 rounded-lg border-l-2 border-blue-400">
                    <p className="text-sm font-semibold text-gray-600">Mensagem:</p>
                    <p className="text-gray-700">{convite.mensagem}</p>
                  </div>
                )}

                <div className="space-y-1 text-xs text-gray-500">
                  <p className="text-sm font-semibold text-gray-600">Enviado em:</p>
                  <p>
                    {new Date(convite.criadoEm).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
                <button
                  className="flex-1 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleRejeitar(convite._id)}
                  disabled={processingId === convite._id}
                >
                  {processingId === convite._id ? '⏳' : '❌'} Rejeitar
                </button>
                <button
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAceitar(convite._id)}
                  disabled={processingId === convite._id}
                >
                  {processingId === convite._id ? '⏳' : '✅'} Aceitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
