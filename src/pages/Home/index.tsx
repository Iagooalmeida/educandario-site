import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import ImpactStats from '@/components/ImpactStats';
import ProjectCards from '@/components/ProjectCards';
import imgFachada from '@/assets/foto-fachada-educandario..webp';

const Home: React.FC = () => {
    const { hash } = useLocation();
    const yearsOfHistory = new Date().getFullYear() - 1959;

    useEffect(() => {
        if (hash) {
            const element = document.querySelector(hash);
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 120);
            }
        }
    }, [hash]);

    return (
        <main>
        {/* O padding-top compensa a Navbar fixa */}
    
        <div className="pt-20">
            <Hero />
            <ImpactStats />
            <section className="py-16 md:py-24 bg-white dark:bg-slate-900 overflow-hidden transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Lado da Imagem: Fachada com as crianças */}
                        <div className="relative">
                            {/* Elementos decorativos atrás da foto */}
                            <div className="absolute -top-6 -left-6 w-64 h-64 bg-blue-100 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
                            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-orange-100 dark:bg-orange-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70"></div>
                            
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
                                <img 
                                    src={imgFachada} 
                                    alt="Crianças em frente à sede do Educandário N. S. Aparecida" 
                                    className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
                                />
                                {/* Badge flutuante sobre a imagem */}
                                <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-3 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg border border-white/50 dark:border-slate-700/50 max-w-[calc(100%-1.5rem)] sm:max-w-none">
                                    <p className="text-blue-900 dark:text-blue-300 font-black text-base sm:text-xl leading-none">{yearsOfHistory} anos</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wide sm:tracking-wider mt-0.5 sm:mt-1">Transformando vidas</p>
                                </div>
                            </div>
                        </div>

                        {/* Lado do Texto */}
                        <div className="space-y-8">
                            <div>
                                <span className="text-blue-700 dark:text-blue-400 font-bold tracking-widest uppercase text-sm">Desde 1959</span>
                                <h2 className="mt-3 text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                                    Um refúgio de amor e <span className="text-blue-700 dark:text-blue-400">aprendizado em Itapira.</span>
                                </h2>
                            </div>
                            
                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                Nossa sede na Vila Bazani é mais que um prédio; é o ponto de encontro onde mais de 260 crianças recebem apoio pedagógico e oficinas que semeiam o futuro. Estamos sempre abertos para receber doações de alimentos frescos e mantimentos para nossas oficinas.
                            </p>

                            {/* Cards Rápidos de Informação */}
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                    <p className="font-bold text-slate-800 dark:text-slate-100 italic">"Educar é semear o nosso futuro"</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">— Nossa Missão</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800">
                                    <p className="text-blue-900 dark:text-blue-300 font-bold">Atendimento Integral</p>
                                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Apoio para famílias itapirenses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <ProjectCards />
            
        </div>
        </main>
    );
};

export default Home;