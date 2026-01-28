// ==========================================
// App Types - Centralized type definitions
// ==========================================

// ---- View Types ----
export type PublicView = 'landing' | 'login' | 'register';

export type PrivateView =
    | 'home'
    | 'wardrobes'
    | 'profile'
    | 'looks'
    | 'myLooks'
    | 'vendor-lojas'
    | 'vendor-loja'
    | 'admin-loja'
    | 'invitacoes'
    | 'carrinho';

// ---- User Data ----
export interface UserData {
    id: string;
    nome: string;
    email: string;
    foto?: string;
    role?: string;
    lojaId?: string;
}

// ---- AppContent Props ----
export interface AppContentProps {
    isAuthenticated: boolean;
    setIsAuthenticated: (value: boolean) => void;
    userData: UserData | null;
    setUserData: (value: UserData | null) => void;
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
    handleLogout: () => void;
    fetchUserSession: () => Promise<void>;
    initialSku?: string;
}

// ---- NavBar User Data (subset) ----
export interface NavbarUserData {
    nome: string;
    foto?: string;
    email: string;
    role?: string;
}
