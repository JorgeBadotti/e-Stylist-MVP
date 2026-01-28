import React from 'react';
import Navbar from './Navbar';
import { ViewRouter } from './ViewRouter';
import { PrivateView, UserData, NavbarUserData } from '../types/app.types';

interface PrivateLayoutProps {
    // Navbar props
    isAuthenticated: boolean;
    userData: UserData | null;
    onProfileClick: () => void;
    onWardrobeClick: () => void;
    onLooksClick: () => void;
    onLojaClick: (role?: string) => void;
    onLogoClick: (isAuthenticated: boolean) => void;
    onMyLooksClick: () => void;
    onCarrinhoClick: () => void;
    onInvitacoesClick: () => void;
    onLogout: () => Promise<void>;
    // ViewRouter props
    privateView: PrivateView;
    setPrivateView: (view: PrivateView) => void;
    selectedSku: string | null;
    setSelectedSku: (sku: string | null) => void;
    selectedLojaId: string | null;
    setSelectedLojaId: (id: string | null) => void;
    itemObrigatorio: string | null;
    gerarLooksLojaId: string | null;
    handleProdutoSelect: (sku: string) => void;
}

/**
 * PrivateLayout
 * Layout padrão para usuários autenticados
 * Combina Navbar + ViewRouter em uma estrutura consistente
 * 
 * @param {PrivateLayoutProps} props
 * @returns {React.ReactElement}
 * 
 * @example
 * <PrivateLayout
 *   isAuthenticated={true}
 *   userData={userData}
 *   privateView={privateView}
 *   ... outros props
 * />
 */
export const PrivateLayout: React.FC<PrivateLayoutProps> = ({
    // Navbar props
    isAuthenticated,
    userData,
    onProfileClick,
    onWardrobeClick,
    onLooksClick,
    onLojaClick,
    onLogoClick,
    onMyLooksClick,
    onCarrinhoClick,
    onInvitacoesClick,
    onLogout,
    // ViewRouter props
    privateView,
    setPrivateView,
    selectedSku,
    setSelectedSku,
    selectedLojaId,
    setSelectedLojaId,
    itemObrigatorio,
    gerarLooksLojaId,
    handleProdutoSelect,
}) => {
    // Preparar dados do usuário para o Navbar
    const navbarUserData: NavbarUserData | null = userData
        ? {
            nome: userData.nome,
            foto: userData.foto,
            email: userData.email,
            role: userData.role,
        }
        : null;

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <Navbar
                isAuthenticated={isAuthenticated}
                user={navbarUserData}
                onLoginClick={() => { }} // Não usado em usuário autenticado
                onLogoutClick={onLogout}
                onProfileClick={onProfileClick}
                onWardrobeClick={onWardrobeClick}
                onLooksClick={onLooksClick}
                onLojaClick={() => onLojaClick(userData?.role)}
                onLogoClick={() => onLogoClick(isAuthenticated)}
                onMyLooksClick={onMyLooksClick}
                onCarrinhoClick={onCarrinhoClick}
                onInvitacoesClick={onInvitacoesClick}
            />

            {/* Conteúdo Principal */}
            <main className="p-4 sm:p-6 md:p-8">
                <ViewRouter
                    privateView={privateView}
                    setPrivateView={setPrivateView}
                    selectedSku={selectedSku}
                    setSelectedSku={setSelectedSku}
                    selectedLojaId={selectedLojaId}
                    setSelectedLojaId={setSelectedLojaId}
                    itemObrigatorio={itemObrigatorio}
                    gerarLooksLojaId={gerarLooksLojaId}
                    userData={userData}
                    handleProdutoSelect={handleProdutoSelect}
                    handleNavigate={setPrivateView}
                />
            </main>
        </div>
    );
};
