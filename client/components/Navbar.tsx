import React, { useState, useRef, useEffect } from 'react';

// Interface do objeto User (baseado no que vem do seu backend)
interface UserData {
    nome?: string;
    foto?: string;
    email?: string;
}

interface NavbarProps {
    isAuthenticated: boolean;
    user?: UserData | null; // NOVA PROP: Dados do usuário para mostrar o avatar
    onLoginClick: () => void;
    onLogoutClick: () => void;
    onLogoClick: () => void;
    // NOVAS PROPS para as ações do menu
    onProfileClick: () => void;
    onWardrobeClick: () => void;
    onLooksClick: () => void;
    onLojaClick: () => void; // 1. Adicionar a prop
}

const Navbar: React.FC<NavbarProps> = ({
    isAuthenticated,
    user,
    onLoginClick,
    onLogoutClick,
    onLogoClick,
    onProfileClick,
    onWardrobeClick,
    onLooksClick,
    onLojaClick, // 2. Receber a prop
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fecha o menu se clicar fora dele
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Função auxiliar para renderizar avatar ou iniciais
    const renderAvatar = () => {
        if (user?.foto) {
            return (
                <img
                    src={user.foto}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                />
            );
        }
        // Fallback: Círculo com a inicial do nome
        const initial = user?.nome ? user.nome.charAt(0).toUpperCase() : 'U';
        return (
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                {initial}
            </div>
        );
    };

    return (
        <nav className="w-full bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* --- ESQUERDA: LOGO --- */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={onLogoClick}>
                        <h1 className="text-2xl font-extrabold select-none">
                            <span className="text-blue-800">e-Stylist</span>
                            <span className="text-blue-500"> MVP</span>
                        </h1>
                    </div>

                    {/* --- CENTRO: LINKS (Visível apenas em Desktop) --- */}
                    <div className="hidden md:flex items-center space-x-6">
                        <button onClick={onLogoClick} className="text-gray-600 hover:text-blue-800 font-medium transition-colors">
                            Home
                        </button>
                        {isAuthenticated && (
                            <>
                                <button
                                    onClick={onLooksClick}
                                    className="text-gray-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Gerar Looks
                                </button>
                                {/* 3. Adicionar o botão Loja */}
                                <button
                                    onClick={onLojaClick}
                                    className="text-gray-600 hover:text-blue-800 font-medium transition-colors"
                                >
                                    Loja
                                </button>
                            </>
                        )}
                    </div>

                    {/* --- DIREITA: AUTH & MENU --- */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated ? (
                            // MENU DROPDOWN DO USUÁRIO
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    {renderAvatar()}

                                    {/* Seta para baixo */}
                                    <svg className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* O Menu Flutuante (Drawer) */}
                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                                        <div className="px-4 py-2 border-b">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user?.nome || 'Usuário'}</p>
                                        </div>
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); onWardrobeClick(); setIsMenuOpen(false); }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Meu Guarda-Roupa
                                        </a>
                                        {/* 4. Adicionar o link Loja no menu mobile também */}
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); onLojaClick(); setIsMenuOpen(false); }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Loja
                                        </a>
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); onProfileClick(); setIsMenuOpen(false); }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Meu Perfil
                                        </a>
                                        <div className="border-t my-1"></div>
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); onLogoutClick(); setIsMenuOpen(false); }}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            Sair
                                        </a>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // BOTÃO DE LOGIN
                            <button
                                onClick={onLoginClick}
                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Entrar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;