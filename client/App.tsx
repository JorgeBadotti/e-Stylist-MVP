import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import LandingPage from './components/LandingPage';
import LoginPage from './components/Login';
import IndiceGuardaRoupas from './components/IndiceGuardaRoupas';
import RegisterPage from './components/Register';
import ProfilePage from './components/ProfilePage';
import LooksPage from './components/LooksPage';
import MyLooksPage from './components/MyLooksPage';
import MinhasInvitacoes from './components/MinhasInvitacoes';
import CarrinhoPage from './components/CarrinhoPage';
import AdminLojaPage from './components/Admin/AdminLojaPage';
import VendorLojasPage from './components/Vendor/VendorLojasPage';
import VendorLojaPage from './components/Vendor/VendorLojaPage';
import ProdutoDetalhe from './components/Loja/ProdutoDetalhe';
import api, { API_BASE_URL } from './src/services/api';
import { getSessionId, storeSessionId } from './src/services/sessionService';
import { UserContext, UserContextType } from './src/contexts/UserContext';


// Tipos para as telas de quem NÃO está logado
type PublicView = 'landing' | 'login' | 'register';

type PrivateView = 'home' | 'wardrobes' | 'profile' | 'looks' | 'myLooks' | 'vendor-lojas' | 'vendor-loja' | 'admin-loja' | 'invitacoes' | 'carrinho';

// Componente para página pública de produto
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
    // Estados Globais (fora do Router para compartilhar entre rotas)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        const cached = localStorage.getItem('isAuthenticated');
        return cached ? JSON.parse(cached) : false;
    });
    const [userData, setUserData] = useState<UserData | null>(() => {
        const cached = localStorage.getItem('userData');
        return cached ? JSON.parse(cached) : null;
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Função centralizada para buscar a sessão
    const fetchUserSession = async () => {
        try {
            // ✅ NOVO: Garantir que tem sessionId antes de fazer requisições
            // Se não tem, fazer uma requisição vazia para obter um
            const sessionId = getSessionId();
            if (!sessionId) {
                console.log('📍 [App] Nenhum sessionId, obtendo um novo do servidor...');
                try {
                    // Requisição simples para obter sessionId
                    await api.head(`${API_BASE_URL}/auth/me`);
                } catch (e) {
                    // É esperado falhar (visitante anônimo), mas o sessionId foi capturado no interceptor
                    console.log('📍 [App] SessionId obtido do servidor');
                }
            }

            const response = await api.get('/auth/me');
            if (response.data.isAuthenticated) {
                setIsAuthenticated(true);
                setUserData(response.data.user);
                localStorage.setItem('isAuthenticated', JSON.stringify(true));
                localStorage.setItem('userData', JSON.stringify(response.data.user));
            } else {
                setIsAuthenticated(false);
                setUserData(null);
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userData');
            }
        } catch (error) {
            console.error("Sessão inválida ou erro de rede:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Executa ao carregar a página
    useEffect(() => {
        fetchUserSession();
    }, []);

    // ✅ NOVO: Redirecionar para URL salva após login bem-sucedido
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                console.log(`🔐 [App] Login bem-sucedido. Redirecionando para ${redirectUrl}`);
                localStorage.removeItem('redirectAfterLogin');
                // Usar window.location para navegar corretamente com os parâmetros
                window.location.href = redirectUrl;
            }
        }
    }, [isAuthenticated, isLoading]);

    // ✅ NOVO: Verificar após login se há item obrigatório pendente
    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            const pendingItem = localStorage.getItem('pendingItemObrigatorio');
            if (pendingItem) {
                console.log(`[App] Item obrigatório pendente detectado: ${pendingItem}, redirecionando...`);
                localStorage.removeItem('pendingItemObrigatorio');
                // Aguardar um pouco para garantir que o App renderizou
                setTimeout(() => {
                    window.location.href = `/gerar-looks?itemObrigatorio=${pendingItem}&lojaid=696e987bd679d526a83c1395`;
                }, 100);
            }
        }
    }, [isAuthenticated, isLoading]);

    // Sincronizar localStorage
    useEffect(() => {
        localStorage.setItem('isAuthenticated', JSON.stringify(isAuthenticated));
    }, [isAuthenticated]);

    useEffect(() => {
        if (userData) {
            localStorage.setItem('userData', JSON.stringify(userData));
        } else {
            localStorage.removeItem('userData');
        }
    }, [userData]);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            setIsAuthenticated(false);
            setUserData(null);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
        } catch (error) {
            console.error('Logout error:', error);
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userData');
        }
    };

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

interface AppContentProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    userData: UserData | null;
    setUserData: (value: UserData | null) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    handleLogout: () => void;
    fetchUserSession: () => Promise<void>; // ✅ NOVO
    initialSku?: string; // ✅ NOVO: SKU inicial da URL
}

const AppContent: React.FC<AppContentProps> = ({
    isAuthenticated,
    setIsAuthenticated,
    userData,
    setUserData,
    isLoading,
    setIsLoading,
    handleLogout,
    fetchUserSession, // ✅ NOVO
    initialSku // ✅ NOVO
}) => {
    const { sku: urlSku } = useParams<{ sku: string }>();
    const navigate = useNavigate(); // ✅ NOVO: Para navegar para a URL
    const location = useLocation(); // ✅ NOVO: Para detectar rota /gerar-looks
    const [isRedirecting, setIsRedirecting] = useState<boolean>(false);
    const [publicView, setPublicView] = useState<PublicView>(() => {
        // ✅ Verificar se deve mostrar login ao carregar
        if (localStorage.getItem('showLoginPage') === 'true') {
            localStorage.removeItem('showLoginPage');
            return 'login';
        }
        return 'landing';
    });
    const [privateView, setPrivateView] = useState<PrivateView>('home');
    const [selectedSku, setSelectedSku] = useState<string | null>(initialSku || urlSku || null);
    const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
    const [itemObrigatorio, setItemObrigatorio] = useState<string | null>(null); // ✅ NOVO: Armazenar item obrigatório
    const [gerarLooksLojaId, setGerarLooksLojaId] = useState<string | null>(null); // ✅ NOVO: LojaId para /gerar-looks

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
    }, [isAuthenticated, isLoading, initialSku]);

    // ✅ NOVO: Detectar rota /gerar-looks direto e verificar autenticação
    useEffect(() => {
        if (location.pathname === '/gerar-looks') {
            const params = new URLSearchParams(location.search);
            const itemObrigatorioParam = params.get('itemObrigatorio');
            const lojaIdParam = params.get('lojaId') || params.get('lojaid'); // ✅ Aceita tanto lojaId quanto lojaid

            // Se não está logado, redirecionar para login
            if (!isAuthenticated && !isLoading) {
                console.log('🔐 [App] Acesso a /gerar-looks sem autenticação. Redirecionando para login...');
                // Salvar URL de retorno para após o login
                localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
                setPublicView('login');
                // Navegue para a raiz para que o fluxo de login seja renderizado
                navigate('/');
                return;
            }

            if (itemObrigatorioParam && isAuthenticated) {
                console.log(`[App] Detectada rota /gerar-looks com itemObrigatorio: ${itemObrigatorioParam}, lojaId: ${lojaIdParam}`);
                setItemObrigatorio(itemObrigatorioParam);
                if (lojaIdParam) {
                    setGerarLooksLojaId(lojaIdParam);
                }
                setPrivateView('looks');
                setSelectedSku(null); // Não estamos vendo produto, apenas gerando looks
                // Limpar o localStorage de redirecionamento
                localStorage.removeItem('redirectAfterLogin');
            }
        }
    }, [location, isAuthenticated, isLoading, navigate]);

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
    const handleCarrinhoClick = () => {
        setPrivateView('carrinho');
        // Se estava vendo produto, volta para poder renderizar carrinho
        if (selectedSku) setSelectedSku(null);
    };

    // 2. Funções para selecionar produto e voltar
    const handleProdutoSelect = (sku: string) => {
        setSelectedSku(sku);
        navigate(`/produtos/${sku}`); // ✅ NOVO: Navega para a URL do produto
    };

    const handleBackToCatalog = () => {
        setSelectedSku(null);
        navigate('/'); // ✅ NOVO: Volta para home
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
                        onCarrinhoClick={handleCarrinhoClick}
                        onInvitacoesClick={handleInvitacoesClick}
                    />
                    <main className="p-4 sm:p-6 md:p-8">
                        {/* ✅ Se há um SKU selecionado, renderizar ProdutoDetalhe */}
                        {selectedSku ? (
                            <ProdutoDetalhe
                                sku={selectedSku}
                                onBack={() => setSelectedSku(null)}
                                onGerarLookComPeca={(sku: string) => {
                                    console.log(`[LookSession] Callback acionado com SKU: ${sku}`);
                                    setItemObrigatorio(sku); // ✅ Armazena o item obrigatório no estado
                                    setSelectedSku(null);
                                    setPrivateView('looks');
                                    navigate(`/gerar-looks?itemObrigatorio=${sku}&lojaid=696e987bd679d526a83c1395`); // ✅ Inclui lojaId hardcodado
                                }}
                            />
                        ) : (
                            <>
                                {privateView === 'home' && <HomePage onNavigate={setPrivateView} />}
                                {privateView === 'wardrobes' && <IndiceGuardaRoupas />}
                                {privateView === 'profile' && <ProfilePage />}
                                {privateView === 'looks' && <LooksPage onProductClick={handleProdutoSelect} initialItemObrigatorio={itemObrigatorio} initialLojaId={gerarLooksLojaId} />}
                                {privateView === 'invitacoes' && <MinhasInvitacoes />}

                                {/* ✅ NOVO: Páginas para SALESPERSON (Vendedor) */}
                                {privateView === 'vendor-lojas' && (
                                    <VendorLojasPage onSelectLoja={(lojaId) => {
                                        setSelectedLojaId(lojaId);
                                        setPrivateView('vendor-loja');
                                    }} />
                                )}
                                {privateView === 'vendor-loja' && selectedLojaId && (
                                    <VendorLojaPage
                                        lojaId={selectedLojaId}
                                        onBack={() => setPrivateView('vendor-lojas')}
                                        selectedSku={selectedSku}
                                        onSelectSku={handleProdutoSelect}
                                    />
                                )}

                                {/* ✅ NOVO: Página para STORE_ADMIN */}
                                {privateView === 'admin-loja' && userData?.lojaId && (
                                    <AdminLojaPage
                                        lojaId={userData.lojaId}
                                        selectedSku={selectedSku}
                                        onSelectSku={handleProdutoSelect}
                                    />
                                )}

                                {privateView === 'myLooks' && (
                                    <MyLooksPage onProductClick={handleProdutoSelect} />
                                )}

                                {/* ✅ Página do Carrinho */}
                                {privateView === 'carrinho' && (
                                    <CarrinhoPage onProductClick={handleProdutoSelect} />
                                )}
                            </>
                        )}
                    </main>
                </div>
            </UserContext.Provider>
        );
    }

    // --- USUÁRIO DESLOGADO ---
    // A LandingPage já tem sua própria navegação, então o Navbar principal não é necessário
    if (publicView === 'landing') {
        return (
            <LandingPage
                onLoginClick={() => setPublicView('login')}
                onRegisterClick={() => setPublicView('register')}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* O Navbar só é renderizado para as visualizações de login e registro */}
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
            ) : null}
        </div>
    );
};

export default App;