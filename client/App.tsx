import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import PublicHomePage from './components/PublicHomePage';
import LoginPage from './components/Login';
import IndiceGuardaRoupas from './components/IndiceGuardaRoupas';
import RegisterPage from './components/Register';
import ProfilePage from './components/ProfilePage';
import LooksPage from './components/LooksPage';
import MyLooksPage from './components/MyLooksPage';
import MinhasInvitacoes from './components/MinhasInvitacoes';
import AdminLojaPage from './components/Admin/AdminLojaPage';
import VendorLojasPage from './components/Vendor/VendorLojasPage';
import VendorLojaPage from './components/Vendor/VendorLojaPage';
import api from './src/services/api';
import { UserContext, UserContextType } from './src/contexts/UserContext';


// Tipos para as telas de quem NÃO está logado
type PublicView = 'landing' | 'login' | 'register';

type PrivateView = 'home' | 'wardrobes' | 'profile' | 'looks' | 'myLooks' | 'vendor-lojas' | 'vendor-loja' | 'admin-loja' | 'invitacoes';


// 1. Definir a interface para os dados do usuário
interface UserData {
    id: string;
    nome: string;
    email: string;
    foto?: string;
    role?: string;
    lojaId?: string;
}

const App: React.FC = () => {
    // Estados Globais
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // 2. Estado para armazenar os dados do usuário
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false); // ✅ NOVO: Evita renderizar view pública durante redirecionamento
    // Controle de navegação
    const [publicView, setPublicView] = useState<PublicView>('landing');
    // Novo estado para controlar a tela interna
    const [privateView, setPrivateView] = useState<PrivateView>('home');
    const [selectedSku, setSelectedSku] = useState<string | null>(null); // 1. Novo estado para o SKU
    const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null); // ✅ NOVO: Loja selecionada pelo vendedor

    // Função centralizada para buscar a sessão e os dados do usuário
    const fetchUserSession = async () => {
        try {
            const response = await api.get('/auth/me');

            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                // Salva os dados do usuário vindos do backend
                setUserData(response.data.user);
            } else {
                setIsAuthenticated(false);
                setUserData(null);
            }
        } catch (error) {
            console.error("Sessão inválida ou erro de rede:", error);
            setIsAuthenticated(false);
            setUserData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Executa ao carregar a página
    useEffect(() => {
        fetchUserSession();
    }, []);

    // ✅ NOVO: UseEffect para monitorar mudanças de autenticação
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            // Quando autenticado, muda para view privada
            setPublicView('landing'); // Isso evita que Landing seja renderizado quando autenticado
        }
    }, [isAuthenticated, isLoading]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
            setUserData(null);
            setPublicView('landing');
            setPrivateView('home'); // Reseta a view privada
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Navegação Interna

    const handleProfileClick = () => { setPrivateView('profile'); setSelectedSku(null); };
    const handleWardrobeClick = () => { setPrivateView('wardrobes'); setSelectedSku(null); };
    const handleLooksClick = () => { setPrivateView('looks'); setSelectedSku(null); };
    const handleMyLooksClick = () => { setPrivateView('myLooks'); setSelectedSku(null) };
    const handleLojaClick = () => {
        // ✅ NOVO: Rota diferente para SALESPERSON e STORE_ADMIN
        if (userData?.role === 'SALESPERSON') {
            setPrivateView('vendor-lojas');
        } else {
            setPrivateView('admin-loja');
        }
        setSelectedSku(null);
    };
    const handleInvitacoesClick = () => { setPrivateView('invitacoes'); setSelectedSku(null); };

    // 2. Funções para selecionar produto e voltar
    const handleProdutoSelect = (sku: string) => {
        setSelectedSku(sku);
    };

    const handleBackToCatalog = () => {
        setSelectedSku(null);
    };


    // Voltar para Home ao clicar no Logo
    const handleLogoClick = () => {
        setSelectedSku(null); // Limpa SKU também
        if (isAuthenticated) setPrivateView('home');
        else setPublicView('landing');
    };


    // ✅ NOVO: Tela de Carregamento durante redirecionamento após cadastro
    if (isRedirecting) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600 font-medium">Entrando na plataforma...</span>
                </div>
            </div>
        );
    }

    // Tela de Carregamento
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <span className="text-gray-600 font-medium">Carregando...</span>
                </div>
            </div>
        );
    }

    // --- USUÁRIO LOGADO ---
    const userContextValue: UserContextType = {
        user: userData || null
    };

    if (isAuthenticated) {
        return (
            <UserContext.Provider value={userContextValue}>
                <div className="min-h-screen bg-gray-100">
                    <Navbar
                        isAuthenticated={isAuthenticated}
                        user={userData ? { nome: userData.nome, foto: userData.foto, email: userData.email, role: userData.role } : null}
                        onLoginClick={() => setPublicView('login')}
                        onLogoutClick={handleLogout}
                        onProfileClick={handleProfileClick}
                        onWardrobeClick={handleWardrobeClick}
                        onLooksClick={handleLooksClick}
                        onLojaClick={handleLojaClick}
                        onLogoClick={handleLogoClick}
                        onMyLooksClick={handleMyLooksClick}
                        onInvitacoesClick={handleInvitacoesClick}
                    />
                    <main className="p-4 sm:p-6 md:p-8">
                        {privateView === 'home' && <HomePage onNavigate={setPrivateView} />}
                        {privateView === 'wardrobes' && <IndiceGuardaRoupas />}
                        {privateView === 'profile' && <ProfilePage />}
                        {privateView === 'looks' && <LooksPage />}
                        {privateView === 'invitacoes' && <MinhasInvitacoes />}

                        {/* ✅ NOVO: Páginas para SALESPERSON (Vendedor) */}
                        {privateView === 'vendor-lojas' && (
                            <VendorLojasPage onSelectLoja={(lojaId) => {
                                setSelectedLojaId(lojaId);
                                setPrivateView('vendor-loja');
                            }} />
                        )}
                        {privateView === 'vendor-loja' && selectedLojaId && (
                            <VendorLojaPage lojaId={selectedLojaId} onBack={() => setPrivateView('vendor-lojas')} />
                        )}

                        {/* ✅ NOVO: Página para STORE_ADMIN */}
                        {privateView === 'admin-loja' && userData?.lojaId && (
                            <AdminLojaPage lojaId={userData.lojaId} />
                        )}

                        {privateView === 'myLooks' && (
                            <MyLooksPage />
                        )}
                    </main>
                </div>
            </UserContext.Provider>
        );
    }

    // --- USUÁRIO DESLOGADO ---
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar
                isAuthenticated={false}
                user={null}
                onLoginClick={() => setPublicView('login')}
                onLogoutClick={() => { }}
                onLogoClick={handleLogoClick}
                onProfileClick={() => { }}
                onWardrobeClick={() => { }}
                onLooksClick={() => { }}
                onLojaClick={() => { }}
                onMyLooksClick={() => { }}
                onInvitacoesClick={() => { }}
            />

            {publicView === 'login' ? (
                <LoginPage
                    onLoginSuccess={() => fetchUserSession()}
                    onSwitchToRegister={() => setPublicView('register')}
                />
            ) : publicView === 'register' ? (
                <RegisterPage
                    onSwitchToLogin={() => setPublicView('login')}
                    onRegisterSuccess={(isStore: boolean) => {
                        // ✅ ATUALIZADO: Setar redirecionando para evitar renderizar view pública
                        console.log(`🔐 [Register] Redirecionando para ${isStore ? 'loja' : 'home'}...`);
                        setIsRedirecting(true); // Mostra tela de carregamento
                        fetchUserSession().then(() => {
                            console.log('✅ [Register] Sessão recarregada');
                            if (isStore) {
                                setPrivateView('admin-loja');
                            } else {
                                setPrivateView('home');
                            }
                            setIsRedirecting(false); // Remove tela de carregamento
                        });
                    }}
                />
            ) : (
                // LANDING PAGE (Home Pública)
                <PublicHomePage
                    onLoginClick={() => setPublicView('login')}
                    onRegisterClick={() => setPublicView('register')}
                />
            )}
        </div>
    );
};

export default App;