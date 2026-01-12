import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../src/services/api';

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
}

// Interface atualizada: Removemos onRegisterSuccess para forçar o login após cadastro
interface RegisterPageProps {
    onSwitchToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onSwitchToLogin }) => {
    // ... (Estados mantêm-se iguais: name, email, password...)
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
        score: 0, label: '', color: 'bg-gray-200'
    });

    // ... (UseEffect da senha mantém-se igual)
    useEffect(() => {
        if (!password) {
            setPasswordStrength({ score: 0, label: '', color: 'bg-gray-200' });
            return;
        }
        let score = 0;
        if (password.length > 5) score++;
        if (password.length > 9) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        const finalScore = Math.min(score, 4);
        const strengthMap = [
            { label: 'Muito Fraca', color: 'bg-red-500' },
            { label: 'Fraca', color: 'bg-orange-500' },
            { label: 'Média', color: 'bg-yellow-500' },
            { label: 'Forte', color: 'bg-green-500' },
            { label: 'Muito Forte', color: 'bg-green-600' }
        ];
        setPasswordStrength({ score: finalScore, ...strengthMap[finalScore] });
    }, [password]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }
        if (!acceptedTerms) {
            setError("Você precisa aceitar os termos de serviço.");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register', { nome: name, email, password });
            setSuccess(true);
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || "Erro ao criar conta.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleRegister = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    // --- CORREÇÃO AQUI ---
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
                <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Conta Criada!</h2>
                    <p className="text-gray-600 mb-6">Seu cadastro foi realizado com sucesso. Agora você pode fazer login.</p>

                    {/* Botão corrigido: Usa a função do React em vez de href */}
                    <button
                        onClick={onSwitchToLogin}
                        className="inline-block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition duration-150"
                    >
                        Ir para Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Crie sua conta</h2>
                    <p className="text-gray-500 mt-2">Comece a usar o e-Stylist hoje mesmo.</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* ... Inputs de Nome, Email, Senha mantêm-se iguais ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={password} onChange={(e) => setPassword(e.target.value)} />
                        {password && (
                            <div className="mt-2">
                                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full transition-all duration-300 ${passwordStrength.color}`} style={{ width: `${(passwordStrength.score + 1) * 20}%` }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 text-right">{passwordStrength.label}</p>
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Senha</label>
                        <input type="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input id="terms" type="checkbox" required className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-medium text-gray-700">
                                Eu concordo com os <a href="#" className="text-blue-600 hover:underline">Termos de Serviço</a> e <a href="#" className="text-blue-600 hover:underline">Política de Privacidade</a>
                            </label>
                        </div>
                    </div>

                    <button type="submit" disabled={isLoading} className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150`}>
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                    <span className="border-b w-1/5 border-gray-300"></span>
                    <span className="text-xs text-center text-gray-500 uppercase">ou cadastre-se com</span>
                    <span className="border-b w-1/5 border-gray-300"></span>
                </div>

                <div className="mt-6">
                    <button onClick={handleGoogleRegister} className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition duration-150">
                        {/* SVG do Google ... */}
                        <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                        Cadastrar com Google
                    </button>
                </div>

                <div className="mt-8 text-center text-sm text-gray-600">
                    <p>
                        Já tem uma conta?{' '}
                        {/* Botão corrigido */}
                        <button onClick={onSwitchToLogin} className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                            Faça login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;