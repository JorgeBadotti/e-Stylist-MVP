import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../index';
import api from '../../src/services/api';

interface Loja {
  _id: string;
  nome: string;
  logo?: string;
  descricao?: string;
}

interface VendorLojasPageProps {
  onSelectLoja: (lojaId: string) => void;
}

export default function VendorLojasPage({ onSelectLoja }: VendorLojasPageProps) {
  const userContext = useContext(UserContext);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarLojas = async () => {
      try {
        setLoading(true);
        setError('');

        // Buscar dados do usuário com lojas associadas populadas
        const response = await api.get('/auth/me');
        if (response.data.isAuthenticated && response.data.user.id) {
          const usuarioResponse = await api.get(`/api/usuario/${response.data.user.id}`);
          setLojas(usuarioResponse.data.lojas_associadas || []);
        }
      } catch (err: any) {
        console.error('❌ [VendorLojasPage] Erro ao carregar lojas:', err);
        setError('Erro ao carregar suas lojas associadas');
      } finally {
        setLoading(false);
      }
    };

    carregarLojas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 font-medium">⏳ Carregando suas lojas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (lojas.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white rounded-lg shadow p-12">
        <p className="text-xl text-gray-500 mb-2">😶 Você não está associado a nenhuma loja ainda</p>
        <p className="text-gray-400">Aguarde convites de administradores de lojas para começar</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 border-b-4 border-blue-600 pb-4">
          🏪 Lojas Associadas
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lojas.map((loja) => (
          <div
            key={loja._id}
            className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => onSelectLoja(loja._id)}
          >
            {loja.logo && (
              <img
                src={loja.logo}
                alt={loja.nome}
                className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
              />
            )}
            <div className="p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">{loja.nome}</h3>
              {loja.descricao && (
                <p className="text-gray-600 text-sm line-clamp-2">{loja.descricao}</p>
              )}
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 active:scale-95">
                Acessar Loja →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
