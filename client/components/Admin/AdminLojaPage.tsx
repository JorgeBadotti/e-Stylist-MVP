import React, { useState } from 'react';
import Catalogo from '../Loja/Catalogo';
import GerenciadorColecoes from '../Loja/GerenciadorColecoes';
import VendedoresList from '../VendedoresList';
import ConvidarVendedorModal from '../ConvidarVendedorModal';
import ProdutoDetalhe from '../Loja/ProdutoDetalhe';
import DetalheGuardaRoupa from '../DetalheGuardaRoupa';

interface AdminLojaPageProps {
  lojaId: string;
}

export default function AdminLojaPage({ lojaId }: AdminLojaPageProps) {
  const [selectedSku, setSelectedSku] = useState<string | null>(null);
  const [selectedColecaoId, setSelectedColecaoId] = useState<string | null>(null);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [refreshVendedores, setRefreshVendedores] = useState(false);
  const [activeTab, setActiveTab] = useState<'produtos' | 'colecoes'>('produtos');

  const handleConviteSuccess = () => {
    setRefreshVendedores((prev) => !prev);
  };

  if (selectedSku) {
    return <ProdutoDetalhe sku={selectedSku} onBack={() => setSelectedSku(null)} />;
  }

  if (selectedColecaoId) {
    return <DetalheGuardaRoupa guardaRoupaId={selectedColecaoId} onBack={() => setSelectedColecaoId(null)} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="border-b-4 border-green-600 pb-4">
        <h1 className="text-4xl font-bold text-gray-900">🏪 Minha Loja - Administração</h1>
      </div>

      {/* Seção de Gerenciamento de Vendedores */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-3xl font-bold text-gray-900">👥 Gerenciar Vendedores</h2>
          <button
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 active:scale-95 shadow-lg"
            onClick={() => setShowConviteModal(true)}
          >
            ➕ Convidar Vendedor
          </button>
        </div>
        <VendedoresList
          lojaId={lojaId}
          refresh={refreshVendedores}
          onRefreshDone={() => setRefreshVendedores(false)}
        />
      </div>

      {/* Seção de Catálogo */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              console.log('🔄 [AdminLojaPage] Mudando para aba: produtos');
              setActiveTab('produtos');
            }}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'produtos'
                ? 'text-blue-600 border-b-4 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            📦 Produtos
          </button>
          <button
            onClick={() => {
              console.log('🔄 [AdminLojaPage] Mudando para aba: colecoes');
              setActiveTab('colecoes');
            }}
            className={`px-6 py-3 font-bold transition-all ${
              activeTab === 'colecoes'
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

      {/* Modal de Convite */}
      <ConvidarVendedorModal
        lojaId={lojaId}
        isOpen={showConviteModal}
        onClose={() => setShowConviteModal(false)}
        onSuccess={handleConviteSuccess}
      />
    </div>
  );
}
