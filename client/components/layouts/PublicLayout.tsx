import React from 'react';
import LoginPage from '../features/auth/Login';
import RegisterPage from '../features/auth/Register';
import PublicHomePage from '../pages/PublicHomePage';
import Navbar from '../common/Navbar/Navbar';
import { PublicView } from '../../types/app.types';

interface PublicLayoutProps {
    publicView: PublicView;
    setPublicView: (view: PublicView) => void;
    isAuthenticated: boolean;
    onLoginSuccess: () => void;
    onRegisterSuccess: (isStore: boolean) => void;
    onLogoClick: () => void;
}

/**
 * PublicLayout
 * Layout para usuários deslogados
 * Renderiza condicionalmenteLanding Page, Login ou Register
 * 
 * @param {PublicLayoutProps} props
 * @returns {React.ReactElement}
 */
export const PublicLayout: React.FC<PublicLayoutProps> = ({
    publicView,
    setPublicView,
    isAuthenticated,
    onLoginSuccess,
    onRegisterSuccess,
    onLogoClick,
}) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar com estado deslogado */}
            <Navbar
                isAuthenticated={false}
                user={null}
                onLoginClick={() => setPublicView('login')}
                onLogoutClick={() => { }}
                onLogoClick={onLogoClick}
                onProfileClick={() => { }}
                onWardrobeClick={() => { }}
                onLooksClick={() => { }}
                onLojaClick={() => { }}
                onMyLooksClick={() => { }}
                onInvitacoesClick={() => { }}
            />

            {/* Renderizar condicional de views públicas */}
            {publicView === 'login' ? (
                <LoginPage
                    onLoginSuccess={onLoginSuccess}
                    onSwitchToRegister={() => setPublicView('register')}
                />
            ) : publicView === 'register' ? (
                <RegisterPage
                    onSwitchToLogin={() => setPublicView('login')}
                    onRegisterSuccess={onRegisterSuccess}
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
