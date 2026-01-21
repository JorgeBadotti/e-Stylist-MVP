import React, { useState } from 'react';
import Catalogo from '../Loja/Catalogo';
import GerenciadorColecoes from '../Loja/GerenciadorColecoes';
import ProdutoDetalhe from '../Loja/ProdutoDetalhe';
import DetalheGuardaRoupa from '../DetalheGuardaRoupa';

interface VendorLojaPageProps {
  lojaId: string;
  onBack: () => void;
  selectedSku?: string | null;
  onSelectSku?: (sku: string | null) => void;
}

export default function VendorLojaPage({ lojaId, onBack, selectedSku: globalSelectedSku, onSelectSku }: VendorLojaPageProps) {
  const [selectedColecaoId, setSelectedColecaoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'produtos' | 'colecoes'>('produtos');

  // Usar selectedSku global se fornecido, senão usar local
  const selectedSku = globalSelectedSku ?? null;
  const setSelectedSku = onSelectSku || (() => { });

  if (selectedSku) {
    return <ProdutoDetalhe sku={selectedSku} onBack={() => setSelectedSku(null)} lojaId={lojaId} />;
  }

  if (selectedColecaoId) {
    return <DetalheGuardaRoupa guardaRoupaId={selectedColecaoId} onBack={() => setSelectedColecaoId(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
      >
        ← Voltar para Minhas Lojas
      </button>

      <div className="border-b-4 border-blue-600 pb-4">
        <h1 className="text-4xl font-bold text-gray-900">📦 Catálogo da Loja</h1>
      </div>

      {/* Abas: Produtos | Coleções */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('produtos')}
            className={`px-6 py-3 font-bold transition-all ${activeTab === 'produtos'
              ? 'text-blue-600 border-b-4 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            📦 Produtos
          </button>
          <button
            onClick={() => setActiveTab('colecoes')}
            className={`px-6 py-3 font-bold transition-all ${activeTab === 'colecoes'
              ? 'text-blue-600 border-b-4 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            📚 Coleções
          </button>
        </div>

        {activeTab === 'produtos' && (
          <div className="space-y-4">
            <Catalogo onProdutoSelect={setSelectedSku} lojaId={lojaId} />
          </div>
        )}

        {activeTab === 'colecoes' && (
          <div className="space-y-4">
            <GerenciadorColecoes
              titulo="📚 Minhas Coleções"
              mostraBotaoCriar={true}
              onSelectColecao={setSelectedColecaoId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
