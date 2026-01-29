import React, { useState, useContext } from 'react';
import Catalogo from './Catalogo';
import VendedoresList from '../vendor/VendedoresList';
import ConvidarVendedorModal from '../invites/ConvidarVendedorModal';
import CadastroProdutoSKU from '../product/CadastroProdutoSKU';
import CameraProdutoCapture from '../camera/CameraProdutoCapture';
import { UserContext } from '../../../index';

interface LojaPageProps {
  onProdutoSelect: (sku: string) => void;
  lojaId?: string; // ✅ NOVO: ID da loja do usuário logado
}

type TipoCadastro = 'manual' | 'foto' | null;

const LojaPage: React.FC<LojaPageProps> = ({ onProdutoSelect, lojaId }) => {
  const userContext = useContext(UserContext);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [tipoCadastro, setTipoCadastro] = useState<TipoCadastro>(null);
  const [refreshVendedores, setRefreshVendedores] = useState(false);
  const [refreshCatalogo, setRefreshCatalogo] = useState(false);

  // Verificar se o usuário é STORE_ADMIN ou SUPER_ADMIN
  const isAdmin =
    userContext?.user?.role === 'STORE_ADMIN' ||
    userContext?.user?.role === 'SUPER_ADMIN';

  const handleConviteSuccess = () => {
    // Dispara refresh dos vendedores
    setRefreshVendedores((prev) => !prev);
  };

  const handleProdutoCriado = (produto: any) => {
    // Fecha o modal de cadastro
    setTipoCadastro(null);
    // Recarrega o catálogo
    setRefreshCatalogo((prev) => !prev);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">📦 Catálogo da Loja</h1>

      {/* Seção de Vendedores (apenas para admin) */}
      {isAdmin && lojaId && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">👥 Gestão de Vendedores</h2>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
      )}

      {/* Catálogo */}
      <h2 className="text-2xl font-bold mb-4">Produtos</h2>
      <Catalogo onProdutoSelect={onProdutoSelect} lojaId={lojaId} refresh={refreshCatalogo} />

      {/* Seção de Cadastro de Produto (apenas para admin) */}
      {isAdmin && lojaId && !tipoCadastro && (
        <div className="mt-8 flex flex-col gap-4 sm:flex-row justify-center items-center">
          <button
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition text-lg"
            onClick={() => setTipoCadastro('manual')}
          >
            ✨ Cadastro Manual SKU
          </button>
          <button
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-lg"
            onClick={() => setTipoCadastro('foto')}
          >
            📸 Capturar Foto
          </button>
        </div>
      )}

      {/* Formulário de Cadastro Manual */}
      {isAdmin && lojaId && tipoCadastro === 'manual' && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border-2 border-green-300">
          <CadastroProdutoSKU
            lojaId={lojaId}
            onProdutoCriado={handleProdutoCriado}
            onCancelar={() => setTipoCadastro(null)}
          />
        </div>
      )}

      {/* Formulário de Cadastro por Câmera */}
      {isAdmin && lojaId && tipoCadastro === 'foto' && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg border-2 border-blue-300">
          <CameraProdutoCapture
            lojaId={lojaId}
            onProdutosCriados={handleProdutoCriado}
            onCancelar={() => setTipoCadastro(null)}
          />
        </div>
      )}

      {/* Modal de Convite */}
      {isAdmin && lojaId && (
        <ConvidarVendedorModal
          lojaId={lojaId}
          isOpen={showConviteModal}
          onClose={() => setShowConviteModal(false)}
          onSuccess={handleConviteSuccess}
        />
      )}
    </div>
  );
};

export default LojaPage;

