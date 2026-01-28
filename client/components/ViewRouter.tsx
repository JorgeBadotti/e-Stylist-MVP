import React from 'react';
import HomePage from './HomePage';
import IndiceGuardaRoupas from './features/wardrobe/IndiceGuardaRoupas';
import ProfilePage from './ProfilePage';
import LooksPage from './features/looks/LooksPage';
import MyLooksPage from './features/looks/MyLooksPage';
import MinhasInvitacoes from './features/invites/MinhasInvitacoes';
import CarrinhoPage from './features/cart/CarrinhoPage';
import AdminLojaPage from './Admin/AdminLojaPage';
import VendorLojasPage from './Vendor/VendorLojasPage';
import VendorLojaPage from './Vendor/VendorLojaPage';
import ProdutoDetalhe from './Loja/ProdutoDetalhe';
import { PrivateView, UserData } from '../types/app.types';

interface ViewRouterProps {
    // Estado
    privateView: PrivateView;
    setPrivateView: (view: PrivateView) => void;
    selectedSku: string | null;
    setSelectedSku: (sku: string | null) => void;
    selectedLojaId: string | null;
    setSelectedLojaId: (id: string | null) => void;
    itemObrigatorio: string | null;
    gerarLooksLojaId: string | null;
    userData: UserData | null;
    // Handlers
    handleProdutoSelect: (sku: string) => void;
    handleNavigate: (view: PrivateView) => void;
}

/**
 * ViewRouter
 * Componente que decide qual view privada renderizar
 * Gerencia toda a lógica de renderização condicional de views
 * 
 * @param {ViewRouterProps} props
 * @returns {React.ReactElement}
 * 
 * @example
 * <ViewRouter
 *   privateView={privateView}
 *   selectedSku={selectedSku}
 *   ...
 * />
 */
export const ViewRouter: React.FC<ViewRouterProps> = ({
    privateView,
    setPrivateView,
    selectedSku,
    setSelectedSku,
    selectedLojaId,
    setSelectedLojaId,
    itemObrigatorio,
    gerarLooksLojaId,
    userData,
    handleProdutoSelect,
    handleNavigate,
}) => {
    // ✅ Se há um SKU selecionado, renderizar ProdutoDetalhe
    if (selectedSku) {
        return (
            <ProdutoDetalhe
                sku={selectedSku}
                onBack={() => setSelectedSku(null)}
                onGerarLookComPeca={(sku: string) => {
                    console.log(`[LookSession] Callback acionado com SKU: ${sku}`);
                    setSelectedSku(null);
                    setPrivateView('looks');
                    // Navegar para página de gerar looks com itemObrigatorio
                    window.location.href = `/gerar-looks?itemObrigatorio=${sku}&lojaid=696e987bd679d526a83c1395`;
                }}
            />
        );
    }

    // ✅ Renderizar view privada baseado em privateView
    switch (privateView) {
        case 'home':
            return <HomePage onNavigate={setPrivateView} />;

        case 'wardrobes':
            return <IndiceGuardaRoupas />;

        case 'profile':
            return <ProfilePage />;

        case 'looks':
            return (
                <LooksPage
                    onProductClick={handleProdutoSelect}
                    initialItemObrigatorio={itemObrigatorio}
                    initialLojaId={gerarLooksLojaId}
                />
            );

        case 'myLooks':
            return <MyLooksPage onProductClick={handleProdutoSelect} />;

        case 'invitacoes':
            return <MinhasInvitacoes />;

        case 'carrinho':
            return <CarrinhoPage onProductClick={handleProdutoSelect} />;

        case 'vendor-lojas':
            return (
                <VendorLojasPage
                    onSelectLoja={(lojaId) => {
                        setSelectedLojaId(lojaId);
                        setPrivateView('vendor-loja');
                    }}
                />
            );

        case 'vendor-loja':
            if (!selectedLojaId) {
                return <div className="text-red-600">Loja não selecionada</div>;
            }
            return (
                <VendorLojaPage
                    lojaId={selectedLojaId}
                    onBack={() => setPrivateView('vendor-lojas')}
                    selectedSku={selectedSku}
                    onSelectSku={handleProdutoSelect}
                />
            );

        case 'admin-loja':
            if (!userData?.lojaId) {
                return <div className="text-red-600">Loja do usuário não encontrada</div>;
            }
            return (
                <AdminLojaPage
                    lojaId={userData.lojaId}
                    selectedSku={selectedSku}
                    onSelectSku={handleProdutoSelect}
                />
            );

        default:
            // Garantir que todos os casos foram tratados (exhaustive check)
            return (
                <div className="text-red-600 p-4">
                    View '{privateView}' não implementada
                </div>
            );
    }
};
