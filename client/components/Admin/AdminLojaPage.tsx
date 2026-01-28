import React, { useState } from 'react';
import Catalogo from '../Loja/Catalogo';
import GerenciadorColecoes from '../Loja/GerenciadorColecoes';
import VendedoresList from '../VendedoresList';
import ConvidarVendedorModal from '../features/invites/ConvidarVendedorModal';
import CadastroProdutoSKUManual from '../features/product/CadastroProdutoSKUManual';
import CadastroProdutoSKULotes from '../features/product/CadastroProdutoSKULotes';
import CameraProdutoCapture from '../features/camera/CameraProdutoCapture';
import ProdutoDetalhe from '../Loja/ProdutoDetalhe';
import DetalheGuardaRoupa from '../features/wardrobe/DetalheGuardaRoupa';

interface AdminLojaPageProps {
  lojaId: string;
  selectedSku?: string | null;
  onSelectSku?: (sku: string | null) => void;
}

type TipoCadastroProduto = 'manual' | 'lotes' | 'foto' | null;

export default function AdminLojaPage({ lojaId, selectedSku: globalSelectedSku, onSelectSku }: AdminLojaPageProps) {
  const [selectedColecaoId, setSelectedColecaoId] = useState<string | null>(null);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [tipoCadastroProduto, setTipoCadastroProduto] = useState<TipoCadastroProduto>(null);
  const [refreshVendedores, setRefreshVendedores] = useState(false);
  const [refreshCatalogo, setRefreshCatalogo] = useState(false);
  const [activeTab, setActiveTab] = useState<'produtos' | 'colecoes'>('produtos');

  // Usar selectedSku global se fornecido, senão usar local
  const selectedSku = globalSelectedSku ?? null;
  const setSelectedSku = onSelectSku || (() => { });

  const handleConviteSuccess = () => {
    setRefreshVendedores((prev) => !prev);
  };

  const handleProdutoCriado = (produto: any) => {
    console.log('✅ [AdminLojaPage] Produto criado:', produto);
    // Fecha o modal de cadastro
    setTipoCadastroProduto(null);
    // Recarrega o catálogo
    setRefreshCatalogo((prev) => !prev);
  };

  const handleProdutosCriados = (produtos: any[]) => {
    console.log('✅ [AdminLojaPage] Produtos criados em lote:', produtos);
    // Fecha o modal de cadastro
    setTipoCadastroProduto(null);
    // Recarrega o catálogo
    setRefreshCatalogo((prev) => !prev);
  };

  if (selectedSku) {
    return <ProdutoDetalhe sku={selectedSku} onBack={() => setSelectedSku(null)} lojaId={lojaId} />;
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
            className={`px-6 py-3 font-bold transition-all ${activeTab === 'produtos'
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
            {/* Botões de Seleção do Tipo de Cadastro */}
            {tipoCadastroProduto === null && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <button
                  onClick={() => setTipoCadastroProduto('manual')}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-lg shadow-lg flex-1 sm:flex-none"
                >
                  ✍️ Cadastrar Manualmente
                </button>
                <button
                  onClick={() => setTipoCadastroProduto('lotes')}
                  className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg shadow-lg flex-1 sm:flex-none"
                >
                  📥 Cadastro por Lotes
                </button>
                <button
                  onClick={() => setTipoCadastroProduto('foto')}
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition text-lg shadow-lg flex-1 sm:flex-none"
                >
                  📸 Capturar Foto
                </button>
              </div>
            )}

            {/* Formulário de Cadastro Manual */}
            {tipoCadastroProduto === 'manual' && (
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-green-300 mb-6">
                <CadastroProdutoSKUManual
                  lojaId={lojaId}
                  onProdutoCriado={handleProdutoCriado}
                  onCancelar={() => setTipoCadastroProduto(null)}
                />
              </div>
            )}

            {/* Formulário de Cadastro em Lotes */}
            {tipoCadastroProduto === 'lotes' && (
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-blue-300 mb-6">
                <CadastroProdutoSKULotes
                  lojaId={lojaId}
                  onProdutosCriados={handleProdutosCriados}
                  onCancelar={() => setTipoCadastroProduto(null)}
                />
              </div>
            )}

            {/* Formulário de Cadastro por Câmera */}
            {tipoCadastroProduto === 'foto' && (
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-indigo-300 mb-6">
                <CameraProdutoCapture
                  lojaId={lojaId}
                  onProdutosCriados={handleProdutosCriados}
                  onCancelar={() => setTipoCadastroProduto(null)}
                />
              </div>
            )}

            {/* Catálogo */}
            <Catalogo onProdutoSelect={setSelectedSku} lojaId={lojaId} refresh={refreshCatalogo} />
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
