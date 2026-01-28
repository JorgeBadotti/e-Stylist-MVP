import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { LoadingScreen } from './ui/LoadingScreen';
import { PublicLayout } from './PublicLayout';
import { PrivateLayout } from './PrivateLayout';
import ProdutoDetalhe from './Loja/ProdutoDetalhe';
import Navbar from './common/Navbar/Navbar';
import { UserContext, UserContextType } from '../src/contexts/UserContext';
import { UserData } from '../types/app.types';
import { useRouting } from '../hooks/useRouting';
import { useAuthContext } from '../src/contexts/AuthContext';

/**
 * AppContent
 * Componente que contém toda a lógica de roteamento e renderização
 * Usa AuthContext ao invés de receber props, evitando prop drilling
 * 
 * Deve estar dentro de AuthProvider e Router
 */
interface AppContentProps {
    initialSku?: string;
}

export const AppContent: React.FC<AppContentProps> = ({ initialSku }) => {
    // ✅ Usar APENAS AuthContext para toda a lógica de autenticação (sem duplicar hooks)
    const {
        isAuthenticated,
        userData,
        isLoading,
        handleLogout,
        fetchUserSession,
    } = useAuthContext();
    const { sku: urlSku } = useParams<{ sku: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);

    // ✅ Usar hook de roteamento para gerenciar states de navegação
    const {
        publicView,
        setPublicView,
        privateView,
        setPrivateView,
        selectedSku,
        setSelectedSku,
        selectedLojaId,
        setSelectedLojaId,
        itemObrigatorio,
        setItemObrigatorio,
        gerarLooksLojaId,
        setGerarLooksLojaId,
        handleProfileClick,
        handleWardrobeClick,
        handleLooksClick,
        handleMyLooksClick,
        handleLojaClick,
        handleInvitacoesClick,
        handleCarrinhoClick,
        handleProdutoSelect,
        handleBackToCatalog,
        handleLogoClick,
    } = useRouting(isAuthenticated, userData);

    // ✅ UseEffect para monitorar mudanças de autenticação
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            // Quando autenticado, muda para view privada
            setPublicView('landing');
            // Se tem initialSku, usa ele
            if (initialSku) {
                setSelectedSku(initialSku);
            }
        }
    }, [isAuthenticated, isLoading, initialSku, setPublicView, setSelectedSku]);

    // ✅ NOVO: Tela de Carregamento durante redirecionamento após cadastro
    if (isRedirecting) {
        return <LoadingScreen variant="redirecting" />;
    }

    // Tela de Carregamento
    if (isLoading) {
        return <LoadingScreen variant="loading" />;
    }

    // --- USUÁRIO LOGADO ---
    const userContextValue: UserContextType = {
        user: userData || null
    };

    if (isAuthenticated) {
        return (
            <UserContext.Provider value={userContextValue}>
                <PrivateLayout
                    isAuthenticated={isAuthenticated}
                    userData={userData}
                    onProfileClick={handleProfileClick}
                    onWardrobeClick={handleWardrobeClick}
                    onLooksClick={handleLooksClick}
                    onLojaClick={handleLojaClick}
                    onLogoClick={handleLogoClick}
                    onMyLooksClick={handleMyLooksClick}
                    onCarrinhoClick={handleCarrinhoClick}
                    onInvitacoesClick={handleInvitacoesClick}
                    onLogout={handleLogout}
                    privateView={privateView}
                    setPrivateView={setPrivateView}
                    selectedSku={selectedSku}
                    setSelectedSku={setSelectedSku}
                    selectedLojaId={selectedLojaId}
                    setSelectedLojaId={setSelectedLojaId}
                    itemObrigatorio={itemObrigatorio}
                    gerarLooksLojaId={gerarLooksLojaId}
                    handleProdutoSelect={handleProdutoSelect}
                />
            </UserContext.Provider>
        );
    }

    // --- USUÁRIO DESLOGADO ---
    return (
        <PublicLayout
            publicView={publicView}
            setPublicView={setPublicView}
            isAuthenticated={isAuthenticated}
            onLoginSuccess={() => fetchUserSession()}
            onRegisterSuccess={(isStore: boolean) => {
                console.log(`🔐 [Register] Redirecionando para ${isStore ? 'loja' : 'home'}...`);
                setIsRedirecting(true);
                fetchUserSession().then(() => {
                    console.log('✅ [Register] Sessão recarregada');
                    if (isStore) {
                        setPrivateView('admin-loja');
                    } else {
                        setPrivateView('home');
                    }
                    setIsRedirecting(false);
                });
            }}
            onLogoClick={() => handleLogoClick(isAuthenticated)}
        />
    );
};
