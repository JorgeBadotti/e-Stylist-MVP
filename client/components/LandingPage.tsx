import React from 'react';

interface LandingPageProps {
    onLoginClick: () => void;
    onRegisterClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onRegisterClick }) => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-white/5">
                <div className="text-primary flex size-10 shrink-0 items-center justify-center" data-icon="AutoAwesome">
                    <span className="material-symbols-outlined text-3xl">auto_awesome</span>
                </div>
                <h2 className="text-slate-900 dark:text-white text-xl font-extrabold leading-tight tracking-[-0.015em] flex-1 ml-2">e-Stylist</h2>
                <div className="flex w-10 items-center justify-end">
                    <button onClick={onLoginClick} className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <span className="material-symbols-outlined">person</span>
                    </button>
                </div>
            </nav>

            <main className="max-w-md mx-auto pb-24">
                {/* Hero Section */}
                <section className="p-4">
                    <div
                        className="relative min-h-[520px] flex flex-col gap-6 overflow-hidden rounded-xl items-center justify-center p-6 text-center"
                        data-alt="Fashion model wearing futuristic neon-lit clothing in dark setting"
                        style={{
                            backgroundImage: `linear-gradient(rgba(22, 16, 34, 0.6) 0%, rgba(22, 16, 34, 0.9) 100%), url("/hero-background.jpg")`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <div className="z-10 flex flex-col gap-3">
                            <span className="inline-block self-center px-3 py-1 bg-primary/20 text-primary text-xs font-bold tracking-widest uppercase rounded-full border border-primary/30">
                                AI Fashion Intelligence
                            </span>
                            <h1 className="text-white text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                                Seu Estilo.<br />Sua Roupa.<br /><span className="text-primary">Seu Stylist.</span>
                            </h1>
                            <p className="text-slate-300 text-base font-medium max-w-[280px] mx-auto">
                                A inteligência artificial que transforma seu guarda-roupa em um clique.
                            </p>
                        </div>
                        <button onClick={onRegisterClick} className="z-10 mt-4 flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-14 px-8 bg-primary text-white text-base font-bold shadow-lg shadow-primary/40 active:scale-95 transition-transform">
                            <span>Começar Agora</span>
                            <span className="material-symbols-outlined ml-2">arrow_forward</span>
                        </button>
                    </div>
                </section>

                {/* Feature Grid Section */}
                <section className="mt-4">
                    <h4 className="text-primary text-xs font-black leading-normal tracking-[0.2em] px-6 py-2 uppercase opacity-80">Recursos Principais</h4>
                    <div className="grid grid-cols-1 gap-4 p-4">
                        {/* Card 1 */}
                        <div className="relative group h-48 rounded-xl overflow-hidden glass-card flex flex-col justify-end p-6 border border-white/10" data-alt="Organized modern digital closet interface mockup">
                            <div className="absolute top-6 left-6 size-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">checkroom</span>
                            </div>
                            <div className="z-10">
                                <h3 className="text-white text-lg font-bold">Guarda-Roupa Digital</h3>
                                <p className="text-slate-400 text-sm">Organize suas peças automaticamente com IA.</p>
                            </div>
                            <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-primary/40 to-transparent pointer-events-none"></div>
                        </div>
                        {/* Card 2 */}
                        <div className="relative group h-48 rounded-xl overflow-hidden glass-card flex flex-col justify-end p-6 border border-white/10" data-alt="Artificial intelligence suggesting outfit combinations">
                            <div className="absolute top-6 left-6 size-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                            </div>
                            <div className="z-10">
                                <h3 className="text-white text-lg font-bold">Looks Inteligentes</h3>
                                <p className="text-slate-400 text-sm">Sugestões diárias baseadas no clima e ocasião.</p>
                            </div>
                            <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-primary/40 to-transparent pointer-events-none"></div>
                        </div>
                        {/* Card 3 */}
                        <div className="relative group h-48 rounded-xl overflow-hidden glass-card flex flex-col justify-end p-6 border border-white/10" data-alt="Integrated e-commerce shopping experience for clothes">
                            <div className="absolute top-6 left-6 size-12 rounded-full bg-primary/20 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">shopping_bag</span>
                            </div>
                            <div className="z-10">
                                <h3 className="text-white text-lg font-bold">Shopping Integrado</h3>
                                <p className="text-slate-400 text-sm">Compre o que falta para completar seu visual.</p>
                            </div>
                            <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-primary/40 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </section>

                {/* Technology Section */}
                <section className="mt-8 px-4">
                    <div className="rounded-xl bg-slate-100 dark:bg-white/5 p-6 flex flex-col items-center gap-4 border border-slate-200 dark:border-white/5">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Powered By Advanced Tech</span>
                        <div className="flex items-center gap-8 opacity-70 grayscale">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-2xl">memory</span>
                                <span className="font-bold text-lg">Google Gemini</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-2xl">label</span>
                                <span className="font-bold text-lg tracking-tighter italic">VestTAG</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Target Audiences */}
                <section className="mt-12">
                    <h4 className="text-primary text-xs font-black leading-normal tracking-[0.2em] px-6 py-2 uppercase opacity-80 text-center">Para quem é o e-Stylist?</h4>
                    <div className="flex flex-col gap-3 p-4">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <div className="size-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">person</span>
                            </div>
                            <div>
                                <p className="font-bold text-lg">Consumidores</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Personalize seu estilo e nunca mais perca tempo escolhendo o que vestir.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <div className="size-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">content_cut</span>
                            </div>
                            <div>
                                <p className="font-bold text-lg">Personal Stylists</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie o guarda-roupa de seus clientes com ferramentas de IA de ponta.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10">
                            <div className="size-12 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">store</span>
                            </div>
                            <div>
                                <p className="font-bold text-lg">Lojas de Moda</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Aumente suas vendas com recomendações precisas para cada perfil.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer / Bottom Space */}
                <footer className="mt-12 p-8 text-center opacity-40">
                    <p className="text-xs">© 2024 e-Stylist. Todos os direitos reservados.</p>
                </footer>
            </main>

            {/* Fixed Bottom Action Bar (iOS Style) */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-t border-white/5 z-50">
                <div className="max-w-md mx-auto">
                    <button onClick={onRegisterClick} className="w-full flex items-center justify-center gap-2 rounded-full bg-primary h-14 text-white font-bold text-lg shadow-2xl shadow-primary/20">
                        Baixar o App
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
