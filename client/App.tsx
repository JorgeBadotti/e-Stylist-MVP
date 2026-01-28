import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import { LoadingScreen } from './components/LoadingScreen';
import { PublicLayout } from './components/PublicLayout';
import { ViewRouter } from './components/ViewRouter';
import { PrivateLayout } from './components/PrivateLayout';
import ProdutoDetalhe from './components/Loja/ProdutoDetalhe';
import Navbar from './components/Navbar';
import { UserContext, UserContextType } from './src/contexts/UserContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { PublicView, PrivateView, UserData, AppContentProps } from './types/app.types';
import { useAuth } from './hooks/useAuth';
import { useRouting } from './hooks/useRouting';

const PublicProdutoPage: React.FC<{ isAuthenticated: boolean; user: UserData | null; onLogoutClick: () => void }> = ({ isAuthenticated, user, onLogoutClick }) => {
    const { sku } = useParams<{ sku: string }>();

    if (!sku) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-600 text-lg">Produto não encontrado</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar
                isAuthenticated={isAuthenticated} // ✅ NOVO: Mostrar estado real de autenticação
                user={user} // ✅ NOVO: Mostrar dados do usuário se autenticado
                onLoginClick={() => window.location.href = '/'}
                onLogoutClick={onLogoutClick}
                onLogoClick={() => window.location.href = '/'}
                onProfileClick={() => window.location.href = '/'}
                onWardrobeClick={() => window.location.href = '/'}
                onLooksClick={() => window.location.href = '/'}
                onLojaClick={() => window.location.href = '/'}
                onMyLooksClick={() => window.location.href = '/'}
                onInvitacoesClick={() => window.location.href = '/'}
                onCarrinhoClick={() => window.location.href = '/'}
            />
            <main className="p-4 sm:p-6 md:p-8">
                <ProdutoDetalhe
                    sku={sku}
                    onBack={() => window.history.back()}
                    onGerarLookComPeca={(sku: string) => {
                        console.log('[LookSession] Usuário não autenticado, redirecionando para login');
                        localStorage.setItem('showLoginPage', 'true');
                        localStorage.setItem('pendingItemObrigatorio', sku); // ✅ Salvar SKU para depois do login
                        window.location.href = '/';
                    }}
                />
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppWithAuth />
        </AuthProvider>
    );
};

/**
 * AppWithAuth
 * Componente interno que usa o contexto de autenticação
 * Deve estar dentro do AuthProvider
 */
const AppWithAuth: React.FC = () => {
    // ✅ Usar hook de autenticação para encapsular toda a lógica de auth
    const {
        isAuthenticated,
        setIsAuthenticated,
        userData,
        setUserData,
        isLoading,
        setIsLoading,
        fetchUserSession,
        handleLogout,
    } = useAuth();

    return (
        <Router>
            <Routes>
                {/* Rota pública para visualizar produto por SKU (com s) */}
                <Route
                    path="/produtos/:sku"
                    element={
                        isAuthenticated ? (
                            <AppContent
                                isAuthenticated={isAuthenticated}
                                setIsAuthenticated={setIsAuthenticated}
                                userData={userData}
                                setUserData={setUserData}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                handleLogout={handleLogout}
                                fetchUserSession={fetchUserSession}
                                initialSku={new URLSearchParams(window.location.search).get('sku') || undefined}
                            />
                        ) : (
                            <PublicProdutoPage
                                isAuthenticated={isAuthenticated}
                                user={userData}
                                onLogoutClick={handleLogout}
                            />
                        )
                    }
                />

                {/* Rota para visualizar produto por SKU (sem s) - compatibilidade */}
                <Route
                    path="/produto/:sku"
                    element={
                        isAuthenticated ? (
                            <AppContent
                                isAuthenticated={isAuthenticated}
                                setIsAuthenticated={setIsAuthenticated}
                                userData={userData}
                                setUserData={setUserData}
                                isLoading={isLoading}
                                setIsLoading={setIsLoading}
                                handleLogout={handleLogout}
                                fetchUserSession={fetchUserSession}
                                initialSku={new URLSearchParams(window.location.search).get('sku') || undefined}
                            />
                        ) : (
                            <PublicProdutoPage
                                isAuthenticated={isAuthenticated}
                                user={userData}
                                onLogoutClick={handleLogout}
                            />
                        )
                    }
                />

                {/* Todas as outras rotas */}
                <Route
                    path="/*"
                    element={
                        <AppContent
                            isAuthenticated={isAuthenticated}
                            setIsAuthenticated={setIsAuthenticated}
                            userData={userData}
                            setUserData={setUserData}
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            handleLogout={handleLogout}
                            fetchUserSession={fetchUserSession} // ✅ NOVO
                        />
                    }
                />
            </Routes>
        </Router>
    );
};

const AppContent: React.FC<AppContentProps> = ({
    isAuthenticated,
    setIsAuthenticated,
    userData,
    setUserData,
    isLoading,
    setIsLoading,
    handleLogout,
    fetchUserSession,
    initialSku
}) => {
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

export default App;