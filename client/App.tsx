import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/Login';
import IndiceGuardaRoupas from './components/IndiceGuardaRoupas';
import RegisterPage from './components/Register';
import ProfilePage from './components/ProfilePage';
import LooksPage from './components/LooksPage';
import LojaPage from './components/Loja/LojaPage';
import ProdutoDetalhe from './components/Loja/ProdutoDetalhe'; // Importar ProdutoDetalhe
import MyLooksPage from './components/MyLooksPage';
import api from './src/services/api';


// Tipos para as telas de quem NÃO está logado
type PublicView = 'landing' | 'login' | 'register';

type PrivateView = 'home' | 'wardrobes' | 'profile' | 'looks' | 'myLooks' | 'loja';


// 1. Definir a interface para os dados do usuário
interface UserData {
    id: string;
    nome: string;
    email: string;
    foto?: string;
}

const App: React.FC = () => {
    // Estados Globais
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    // 2. Estado para armazenar os dados do usuário
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    // Controle de navegação
    const [publicView, setPublicView] = useState<PublicView>('landing');
    // Novo estado para controlar a tela interna
    const [privateView, setPrivateView] = useState<PrivateView>('home');
    const [selectedSku, setSelectedSku] = useState<string | null>(null); // 1. Novo estado para o SKU

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
    const handleLojaClick = () => { setPrivateView('loja'); setSelectedSku(null); }; // Limpa SKU ao ir para loja

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
    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar
                    isAuthenticated={isAuthenticated}
                    user={userData ? { nome: userData.nome, foto: userData.foto, email: userData.email } : null}
                    onLoginClick={() => setPublicView('login')}
                    onLogoutClick={handleLogout}
                    onProfileClick={handleProfileClick}
                    onWardrobeClick={handleWardrobeClick}
                    onLooksClick={handleLooksClick}
                    onLojaClick={handleLojaClick}
                    onLogoClick={handleLogoClick}
                    onMyLooksClick={handleMyLooksClick}
                />
                <main className="p-4 sm:p-6 md:p-8">
                    {privateView === 'home' && <HomePage onNavigate={setPrivateView} />}
                    {privateView === 'wardrobes' && <IndiceGuardaRoupas />}
                    {privateView === 'profile' && <ProfilePage />}
                    {privateView === 'looks' && <LooksPage />}

                    {/* 3. Lógica de renderização para Loja/Detalhe */}
                    {privateView === 'loja' && !selectedSku && (
                        <LojaPage onProdutoSelect={handleProdutoSelect} />
                    )}
                    {privateView === 'loja' && selectedSku && (
                        <ProdutoDetalhe sku={selectedSku} onBack={handleBackToCatalog} />
                    )}

                    {privateView === 'myLooks' && (
                        <MyLooksPage />
                    )}
                </main>
            </div>
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
                onMyLooksClick={() => { }}
            />

            {publicView === 'login' ? (
                <LoginPage
                    onLoginSuccess={() => fetchUserSession()}
                    onSwitchToRegister={() => setPublicView('register')}
                />
            ) : publicView === 'register' ? (
                <RegisterPage
                    onSwitchToLogin={() => setPublicView('login')}
                />
            ) : (
                // LANDING PAGE (Código resumido para não ficar gigante)
                <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-blue-900 mb-6">Bem-vindo ao e-Stylist</h1>
                    <button onClick={() => setPublicView('login')} className="bg-blue-600 text-white px-8 py-3 rounded-lg">
                        Entrar
                    </button>
                </div>
            )}
        </div>
    );
};

export default App;