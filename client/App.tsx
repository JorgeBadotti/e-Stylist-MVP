/**
 * ============================================================================
 * APP.TSX - Root Application Component
 * ============================================================================
 * 
 * Architecture Pattern:
 * ├── App (Root)
 * │   └── AuthProvider (Context Wrapper)
 * │       └── AppWithAuth (Smart Router)
 * │           ├── PublicProdutoPage (Public product view)
 * │           └── AppContent (Main router, uses useAuth + useRouting hooks)
 * │               ├── PublicLayout (Landing, Login, Register)
 * │               └── PrivateLayout (Navbar + ViewRouter)
 * │                   ├── Navbar
 * │                   └── ViewRouter (Homepage, Wardrobes, etc)
 * 
 * State Management:
 * - ✅ No prop drilling: AppContent uses useAuthContext() directly
 * - ✅ No passing auth props through routes: Each component accesses AuthContext
 * - ✅ Clean router setup: AppWithAuth only manages route structure
 * 
 * Authentication Flow:
 * 1. AuthProvider wraps entire app with Context.Provider
 * 2. AppWithAuth checks isAuthenticated from useAuthContext
 * 3. AppContent uses both useAuth and useRouting hooks internally
 * 4. All child components access auth state via useAuthContext hook
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { AppContent } from './components/AppContent';
import ProdutoDetalhe from './components/Loja/ProdutoDetalhe';
import Navbar from './components/Navbar';
import { AuthProvider } from './src/contexts/AuthContext';
import { useAuthContext } from './src/contexts/AuthContext';
import { UserData } from './types/app.types';

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
 * 
 * Este componente gerencia o roteamento principal e usa dados de autenticação
 * via AuthContext, evitando prop drilling desnecessário
 */
const AppWithAuth: React.FC = () => {
    // ✅ Usar contexto de autenticação ao invés de props
    const { isAuthenticated, userData, handleLogout } = useAuthContext();

    return (
        <Router>
            <Routes>
                {/* Rota pública para visualizar produto por SKU (com s) */}
                <Route
                    path="/produtos/:sku"
                    element={
                        isAuthenticated ? (
                            <AppContent initialSku={new URLSearchParams(window.location.search).get('sku') || undefined} />
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
                            <AppContent initialSku={new URLSearchParams(window.location.search).get('sku') || undefined} />
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
                    element={<AppContent />}
                />
            </Routes>
        </Router>
    );
};

export default App;