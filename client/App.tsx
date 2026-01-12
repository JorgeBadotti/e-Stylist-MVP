import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LoginPage from './components/Login';
import RegisterPage from './components/Register';
import api from './src/services/api';

type AuthView = 'landing' | 'login' | 'register';

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
    const [currentView, setCurrentView] = useState<AuthView>('landing');
    const [isLoading, setIsLoading] = useState<boolean>(true);

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
            setUserData(null); // Limpa os dados ao sair
            setCurrentView('landing');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    // Funções de navegação do menu (placeholders)
    const handleProfileClick = () => console.log("Navegar para Perfil");
    const handleWardrobeClick = () => console.log("Navegar para Armário");

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
                    isAuthenticated={true}
                    user={userData} // Passa o estado preenchido aqui
                    onLoginClick={() => { }}
                    onLogoutClick={handleLogout}
                    // Clicar no logo mantém na home logada
                    onLogoClick={() => { }}
                    onProfileClick={handleProfileClick}
                    onWardrobeClick={handleWardrobeClick}
                />

                {/* CORREÇÃO: Adicionada a HomePage aqui, senão ela sumiria */}
                <HomePage onLogoutClick={handleLogout} />
            </div>
        );
    }

    // --- USUÁRIO DESLOGADO ---
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar
                isAuthenticated={false}
                user={null}
                onLoginClick={() => setCurrentView('login')}
                onLogoutClick={() => { }}
                onLogoClick={() => setCurrentView('landing')}
                onProfileClick={() => { }}
                onWardrobeClick={() => { }}
            />

            {currentView === 'login' ? (
                <LoginPage
                    // CORREÇÃO: Ao logar com sucesso, chamamos fetchUserSession
                    // para pegar os dados (nome/foto) sem recarregar a tela.
                    onLoginSuccess={() => fetchUserSession()}
                    onSwitchToRegister={() => setCurrentView('register')}
                />
            ) : currentView === 'register' ? (
                <RegisterPage
                    onSwitchToLogin={() => setCurrentView('login')}
                />
            ) : (
                // LANDING PAGE
                <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
                    <h1 className="text-5xl font-extrabold text-blue-900 mb-6 tracking-tight">
                        Bem-vindo ao e-Stylist
                    </h1>
                    <p className="mb-10 text-xl text-gray-600 max-w-2xl">
                        Sua plataforma inteligente de consultoria de moda e estilo pessoal.
                    </p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setCurrentView('login')}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={() => setCurrentView('register')}
                            className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            Criar Conta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;