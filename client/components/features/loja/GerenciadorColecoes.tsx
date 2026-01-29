import React, { useEffect, useState } from 'react';
import { minhasColecoes, deletarColecao, GuardaRoupa } from '../../../src/services/guardaRoupaService';
import NovoGuardaRoupaModal from '../wardrobe/NovoGuardaRoupa';

interface GerenciadorColecoeProps {
  titulo?: string;
  mostraBotaoCriar?: boolean;
  onSelectColecao?: (colecaoId: string) => void;
}

export default function GerenciadorColecoes({
  titulo = '📚 Minhas Coleções',
  mostraBotaoCriar = true,
  onSelectColecao,
}: GerenciadorColecoeProps) {
  const [colecoes, setColecoes] = useState<GuardaRoupa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [colecaoEditando, setColecaoEditando] = useState<any>(null);

  const carregarColecoes = async () => {
    try {
      setLoading(true);
      console.log('📚 [GerenciadorColecoes] Carregando coleções...');
      const data = await minhasColecoes();
      console.log(`✅ [GerenciadorColecoes] ${data.length} coleções carregadas`);
      setColecoes(data);
      setError(null);
    } catch (err: any) {
      console.error('❌ [GerenciadorColecoes] Erro:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Falha ao carregar coleções.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarColecoes();
  }, []);

  // Ação de Deletar
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta coleção? Todas as roupas podem ser perdidas.')) {
      return;
    }

    try {
      await deletarColecao(id);
      console.log('✅ Coleção deletada com sucesso');
      carregarColecoes();
    } catch (error) {
      console.error('❌ Erro ao deletar', error);
      alert('Erro ao deletar coleção.');
    }
  };

  // Ação de Editar
  const handleEdit = (colecao: GuardaRoupa, e: React.MouseEvent) => {
    e.stopPropagation();
    setColecaoEditando(colecao);
    setIsModalOpen(true);
  };

  // Abre modal limpo para Criar
  const handleCreateNew = () => {
    setColecaoEditando(null);
    setIsModalOpen(true);
  };

  // Callback quando modal fecha com sucesso
  const handleModalSuccess = () => {
    setIsModalOpen(false);
    carregarColecoes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">⏳ Carregando suas coleções...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 space-y-2">
        <p className="font-semibold">❌ {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">{titulo}</h2>
        {mostraBotaoCriar && (
          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 active:scale-95 shadow-lg"
          >
            ➕ Novo
          </button>
        )}
      </div>

      {colecoes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg shadow border border-gray-100 space-y-4">
          <p className="text-gray-500">Você ainda não tem nenhuma coleção cadastrada.</p>
          {mostraBotaoCriar && (
            <button onClick={handleCreateNew} className="text-blue-600 hover:underline font-semibold">
              Criar a primeira agora
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {colecoes.map((colecao) => (
            <div
              key={colecao._id}
              onClick={() => onSelectColecao && onSelectColecao(colecao._id)}
              className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200"
            >
              {/* ÁREA DA FOTO */}
              <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                {colecao.foto ? (
                  <img
                    src={colecao.foto}
                    alt={colecao.nome}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-5xl">👗</span>
                  </div>
                )}

                {/* BADGE DE VISIBILIDADE */}
                {colecao.isPublic && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-semibold">
                      🌐 Público
                    </span>
                  </div>
                )}

                {/* BOTÕES DE AÇÃO (Aparecem no hover) */}
                {mostraBotaoCriar && (
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleEdit(colecao, e)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-blue-50 text-blue-600 transition-colors"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => handleDelete(colecao._id, e)}
                      className="bg-white p-2 rounded-full shadow-md hover:bg-red-50 text-red-600 transition-colors"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>

              <div className="p-6 space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {colecao.nome}
                  </h3>
                  {colecao.descricao && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{colecao.descricao}</p>
                  )}
                </div>

                <div className="flex gap-2 text-xs text-gray-500">
                  <span>📅 {new Date(colecao.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectColecao && onSelectColecao(colecao._id);
                  }}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 active:scale-95">
                  Ver Coleção →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Criar/Editar */}
      <NovoGuardaRoupaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        guardaRoupaParaEditar={colecaoEditando}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
