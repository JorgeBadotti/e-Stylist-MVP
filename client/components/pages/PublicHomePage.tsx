import React from 'react';

interface PublicHomePageProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

const PublicHomePage: React.FC<PublicHomePageProps> = ({ onLoginClick, onRegisterClick }) => {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome to e-Stylist
                    </h2>
                    <p className="text-xl md:text-2xl text-blue-100 mb-8">
                        Discover your perfect style with AI-powered fashion recommendations
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onLoginClick}
                            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={onRegisterClick}
                            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-400 transition-colors border-2 border-white"
                        >
                            Cadastrar-se
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Por que escolher e-Stylist?</h3>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Recomendações Inteligentes</h3>
                        <p className="text-gray-600">
                            Obtenha sugestões de moda personalizadas usando algoritmos de IA avançados
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Simples de Usar</h3>
                        <p className="text-gray-600">
                            Envie fotos e receba recomendações de estilo em segundos
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Compartilhe seu Estilo</h3>
                        <p className="text-gray-600">
                            Salve e compartilhe seus looks favoritos com amigos
                        </p>
                    </div>
                </div>
            </section>

            {/* Additional Features Section */}
            <section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-3xl font-bold text-gray-800 text-center mb-12">Recursos Principais</h3>
                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Feature A */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">Análise de Tipo de Corpo</h4>
                                <p className="text-gray-600">
                                    A IA analisa seu tipo de corpo para recomendar peças que realçam melhor sua silhueta
                                </p>
                            </div>
                        </div>

                        {/* Feature B */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-600 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">Guarda-roupa Digital</h4>
                                <p className="text-gray-600">
                                    Organize suas roupas em um guarda-roupa virtual e crie combinações infinitas
                                </p>
                            </div>
                        </div>

                        {/* Feature C */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-600 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4m8 0H8m8 0V2m0 0h4m-4 0h-4" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">Looks por Ocasião</h4>
                                <p className="text-gray-600">
                                    Receba recomendações específicas para diferentes ocasiões e eventos
                                </p>
                            </div>
                        </div>

                        {/* Feature D */}
                        <div className="flex gap-6">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-600 text-white">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-gray-800 mb-2">Integração com Lojas</h4>
                                <p className="text-gray-600">
                                    Encontre e compre itens recomendados diretamente em lojas parceiras
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h3 className="text-4xl font-bold mb-4">Pronto para Transformar seu Estilo?</h3>
                    <p className="text-blue-100 mb-8 text-lg">
                        Comece a explorar recomendações de moda personalizadas hoje mesmo
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <button
                            onClick={onLoginClick}
                            className="bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            Faça Login
                        </button>
                        <button
                            onClick={onRegisterClick}
                            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-400 transition-colors border-2 border-white"
                        >
                            Cadastre-se Agora
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Section */}
            <section className="bg-gray-800 text-gray-400 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h4 className="text-white font-bold mb-4">e-Stylist</h4>
                            <p className="text-sm">Transforme seu guarda-roupa com IA</p>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Recursos</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Guarda-roupa</a></li>
                                <li><a href="#" className="hover:text-white transition">Looks</a></li>
                                <li><a href="#" className="hover:text-white transition">Lojas</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Empresa</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition">Contato</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 pt-8 text-center text-sm">
                        <p>&copy; 2026 e-Stylist. Todos os direitos reservados.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHomePage;
