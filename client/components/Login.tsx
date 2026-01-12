import React, { useState } from 'react';
// Importa a instância configurada do Axios e a URL base para redirecionamentos
import api, { API_BASE_URL } from '../src/services/api';

interface LoginPageProps {
    onLoginSuccess: () => void;
    onSwitchToRegister?: () => void; // <--- Novo (Opcional para não quebrar se faltar)
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
    // Estados para capturar os inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // CORREÇÃO 1: Uso do Axios (api) em vez de fetch manual.
            // Não precisa passar headers ou credentials, o 'api' já faz isso.
            const response = await api.post('/auth/login', { email, password });

            // Se o axios não lançar erro, o status é 2xx (sucesso)
            console.log("Login OK", response.data);
            onLoginSuccess(); // Avisa o App.tsx

        } catch (error) {
            console.error("Erro no login", error);
            alert("Falha no login. Verifique as credenciais.");
        }
    };

    const handleGoogleLogin = () => {
        // CORREÇÃO 2: Uso da constante importada.
        // Em Dev: http://localhost:3000/auth/google
        // Em Prod: /auth/google
        window.location.href = `${API_BASE_URL}/auth/google`;
    };



    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">

                {/* Cabeçalho */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Bem-vindo</h2>
                    <p className="text-gray-500 mt-2">Por favor, insira seus dados.</p>
                </div>

                {/* Formulário */}
                <form onSubmit={handleLogin} className="space-y-6">

                    {/* Campo Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Campo Senha */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {/* Esqueceu a senha */}
                    <div className="flex items-center justify-end">
                        <a href="#" className="text-sm text-blue-600 hover:underline">
                            Esqueceu a senha?
                        </a>
                    </div>

                    {/* Botão de Entrar */}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                    >
                        Entrar
                    </button>
                </form>

                {/* Divisor */}
                <div className="mt-6 flex items-center justify-between">
                    <span className="border-b w-1/5 lg:w-1/4 border-gray-300"></span>
                    <span className="text-xs text-center text-gray-500 uppercase">ou continue com</span>
                    <span className="border-b w-1/5 lg:w-1/4 border-gray-300"></span>
                </div>

                {/* Botão Google */}
                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition duration-150"
                    >
                        {/* Ícone do Google SVG */}
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Entrar com Google
                    </button>
                </div>

                {/* Rodapé - Cadastre-se */}
                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        Não tem uma conta?{' '}
                        <button
                            type="button" // Importante ser type="button" para não submeter o form
                            onClick={onSwitchToRegister} // Chama a função do App.tsx
                            className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
                        >
                            Cadastre-se agora
                        </button>
                    </p>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;