import React, { useEffect, useState } from 'react';
import { listarVendedoresLoja } from '../../../src/services/conviteService';

interface Vendedor {
  _id: string;
  email: string;
  nome: string;
  lojas: number; // ✅ CORRIGIDO: backend retorna 'lojas' como número, não array
}

interface VendedoresListProps {
  lojaId: string;
  refresh?: boolean;
  onRefreshDone?: () => void;
}

export default function VendedoresList({
  lojaId,
  refresh,
  onRefreshDone,
}: VendedoresListProps) {
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const carregarVendedores = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listarVendedoresLoja(lojaId);
      setVendedores(data.vendedores || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao carregar vendedores';
      setError(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
      if (onRefreshDone) onRefreshDone();
    }
  };

  useEffect(() => {
    carregarVendedores();
  }, [lojaId]);

  useEffect(() => {
    if (refresh) {
      carregarVendedores();
    }
  }, [refresh]);

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-lg text-gray-600">⏳ Carregando vendedores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700 font-semibold">{error}</p>
      </div>
    );
  }

  if (vendedores.length === 0) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
        <p className="text-lg font-semibold text-gray-900">😶 Nenhum vendedor cadastrado ainda</p>
        <p className="text-gray-600 mt-2">Convide vendedores para começar a expandir sua loja</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-gray-900">👥 Meus Vendedores ({vendedores.length})</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Nome</th>
              <th className="px-6 py-4 text-left font-semibold">Email</th>
              <th className="px-6 py-4 text-center font-semibold">Lojas Associadas</th>
            </tr>
          </thead>
          <tbody>
            {vendedores.map((vendedor, index) => (
              <tr
                key={vendedor._id}
                className={`border-b transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white font-bold rounded-full">
                      V
                    </span>
                    <span className="font-semibold text-gray-900">{vendedor.nome}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-700 font-mono text-sm">{vendedor.email}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-bold rounded-full text-sm">
                    {vendedor.lojas}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
