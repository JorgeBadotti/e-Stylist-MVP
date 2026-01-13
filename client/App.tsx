import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/Login';
import IndiceGuardaRoupas from './components/IndiceGuardaRoupas';
import RegisterPage from './components/Register';
import api from './src/services/api';


// Tipos para as telas de quem NÃO está logado
type PublicView = 'landing' | 'login' | 'register';
// Tipos para as telas de quem ESTÁ logado (Novo!)
type PrivateView = 'home' | 'wardrobes' | 'profile';

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
    const handleProfileClick = () => setPrivateView('profile');

    // AQUI: Agora muda o estado para exibir a lista
    const handleWardrobeClick = () => setPrivateView('wardrobes');

    // Voltar para Home ao clicar no Logo
    const handleLogoClick = () => {
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
            <div className="min-h-screen bg-gray-50">
                <Navbar
                    isAuthenticated={true}
                    user={userData}
                    onLoginClick={() => { }}
                    onLogoutClick={handleLogout}
                    onLogoClick={handleLogoClick}
                    onProfileClick={handleProfileClick}
                    onWardrobeClick={handleWardrobeClick} // Passando a função real agora
                />

                {/* Renderização Condicional das Telas Logadas */}
                <main className="flex-grow">
                    {privateView === 'home' && (
                        <HomePage onLogoutClick={handleLogout} />
                    )}

                    {privateView === 'wardrobes' && (
                        <IndiceGuardaRoupas />
                    )}

                    {privateView === 'profile' && (
                        <div className="p-8 text-center">Tela de Perfil (Em construção)</div>
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