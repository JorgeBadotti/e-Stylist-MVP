import React, { useState, useContext } from 'react';
import Catalogo from './Catalogo';
import VendedoresList from '../VendedoresList';
import ConvidarVendedorModal from '../ConvidarVendedorModal';
import { UserContext } from '../../index';

interface LojaPageProps {
  onProdutoSelect: (sku: string) => void;
  lojaId?: string; // ✅ NOVO: ID da loja do usuário logado
}

const LojaPage: React.FC<LojaPageProps> = ({ onProdutoSelect, lojaId }) => {
  const userContext = useContext(UserContext);
  const [showConviteModal, setShowConviteModal] = useState(false);
  const [refreshVendedores, setRefreshVendedores] = useState(false);

  // Verificar se o usuário é STORE_ADMIN ou SUPER_ADMIN
  const isAdmin =
    userContext?.user?.role === 'STORE_ADMIN' ||
    userContext?.user?.role === 'SUPER_ADMIN';

  const handleConviteSuccess = () => {
    // Dispara refresh dos vendedores
    setRefreshVendedores((prev) => !prev);
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
      <Catalogo onProdutoSelect={onProdutoSelect} lojaId={lojaId} />

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

