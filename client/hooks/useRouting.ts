import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PublicView, PrivateView, UserData } from '../types/app.types';

interface UseRoutingReturn {
    // Estados
    publicView: PublicView;
    setPublicView: (view: PublicView) => void;
    privateView: PrivateView;
    setPrivateView: (view: PrivateView) => void;
    selectedSku: string | null;
    setSelectedSku: (sku: string | null) => void;
    selectedLojaId: string | null;
    setSelectedLojaId: (id: string | null) => void;
    itemObrigatorio: string | null;
    setItemObrigatorio: (item: string | null) => void;
    gerarLooksLojaId: string | null;
    setGerarLooksLojaId: (id: string | null) => void;
    // Handlers de navegação
    handleProfileClick: () => void;
    handleWardrobeClick: () => void;
    handleLooksClick: () => void;
    handleMyLooksClick: () => void;
    handleLojaClick: (userRole?: string) => void;
    handleInvitacoesClick: () => void;
    handleCarrinhoClick: () => void;
    handleProdutoSelect: (sku: string) => void;
    handleBackToCatalog: () => void;
    handleLogoClick: (isAuthenticated: boolean) => void;
}

/**
 * Hook de Roteamento
 * Encapsula toda a lógica de navegação, states de views e handlers
 * 
 * @param {boolean} isAuthenticated - Se o usuário está autenticado
 * @param {UserData | null} userData - Dados do usuário autenticado
 * @returns {UseRoutingReturn} Estados de routing e handlers de navegação
 */
export const useRouting = (isAuthenticated: boolean, userData: UserData | null): UseRoutingReturn => {
    const navigate = useNavigate();
    const location = useLocation();

    // Estados de Navegação
    const [publicView, setPublicView] = useState<PublicView>(() => {
        // ✅ Verificar se deve mostrar login ao carregar
        if (localStorage.getItem('showLoginPage') === 'true') {
            localStorage.removeItem('showLoginPage');
            return 'login';
        }
        return 'landing';
    });

    const [privateView, setPrivateView] = useState<PrivateView>('home');
    const [selectedSku, setSelectedSku] = useState<string | null>(null);
    const [selectedLojaId, setSelectedLojaId] = useState<string | null>(null);
    const [itemObrigatorio, setItemObrigatorio] = useState<string | null>(null);
    const [gerarLooksLojaId, setGerarLooksLojaId] = useState<string | null>(null);

    /**
     * Detectar rota /gerar-looks direto e verificar autenticação
     */
    useEffect(() => {
        if (location.pathname === '/gerar-looks') {
            const params = new URLSearchParams(location.search);
            const itemObrigatorioParam = params.get('itemObrigatorio');
            const lojaIdParam = params.get('lojaId') || params.get('lojaid');

            // Se não está logado, redirecionar para login
            if (!isAuthenticated) {
                console.log('🔐 [useRouting] Acesso a /gerar-looks sem autenticação. Redirecionando para login...');
                localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
                setPublicView('login');
                navigate('/');
                return;
            }

            if (itemObrigatorioParam && isAuthenticated) {
                console.log(`[useRouting] Detectada rota /gerar-looks com itemObrigatorio: ${itemObrigatorioParam}, lojaId: ${lojaIdParam}`);
                setItemObrigatorio(itemObrigatorioParam);
                if (lojaIdParam) {
                    setGerarLooksLojaId(lojaIdParam);
                }
                setPrivateView('looks');
                setSelectedSku(null);
                localStorage.removeItem('redirectAfterLogin');
            }
        }
    }, [location, isAuthenticated, navigate]);

    // ============ HANDLERS DE NAVEGAÇÃO ============

    const handleProfileClick = () => {
        setPrivateView('profile');
        setSelectedSku(null);
        navigate('/profile');
    };

    const handleWardrobeClick = () => {
        setPrivateView('wardrobes');
        setSelectedSku(null);
        navigate('/wardrobes');
    };

    const handleLooksClick = () => {
        setPrivateView('looks');
        setSelectedSku(null);
        navigate('/looks');
    };

    const handleMyLooksClick = () => {
        setPrivateView('myLooks');
        setSelectedSku(null);
        navigate('/my-looks');
    };

    const handleLojaClick = (userRole?: string) => {
        const role = userRole || userData?.role;
        if (role === 'SALESPERSON') {
            setPrivateView('vendor-lojas');
            navigate('/vendor-lojas');
        } else {
            setPrivateView('admin-loja');
            navigate('/admin-loja');
        }
        setSelectedSku(null);
    };

    const handleInvitacoesClick = () => {
        setPrivateView('invitacoes');
        setSelectedSku(null);
        navigate('/invitacoes');
    };

    const handleCarrinhoClick = () => {
        setPrivateView('carrinho');
        navigate('/carrinho');
        if (selectedSku) setSelectedSku(null);
    };

    const handleProdutoSelect = (sku: string) => {
        setSelectedSku(sku);
        navigate(`/produtos/${sku}`);
    };

    const handleBackToCatalog = () => {
        setSelectedSku(null);
        navigate('/');
    };

    const handleLogoClick = (isAuthenticated: boolean) => {
        setSelectedSku(null);
        if (isAuthenticated) {
            setPrivateView('home');
            navigate('/home');
        } else {
            setPublicView('landing');
            navigate('/');
        }
    };

    return {
        // Estados
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
        // Handlers
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
    };
};
