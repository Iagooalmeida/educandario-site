/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    FileText, 
    Settings, 
    LogOut, 
    Menu, 
    User,
    Sun,
    Moon
    } from 'lucide-react';
import NotificationPanel from '@/components/NotificationPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import { firebaseAuthService } from '@/services/firebase/auth';

    const DashboardLayout: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [displayName, setDisplayName] = useState(() => {
        // Primeiro tenta usar dados do Firebase
        if (user?.name) {
            return user.name;
        }
        
        // Fallback para localStorage
        const savedProfile = localStorage.getItem('adminProfile');
        try {
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                return profile.displayName || 'Admin';
            }
        } catch (error) {
            // Erro ao carregar perfil
        }
        return 'Admin';
    });
    const [userRole, setUserRole] = useState(() => {
        // Primeiro tenta usar dados do Firebase
        if (user?.role) {
            return user.role;
        }
        
        // Fallback para localStorage
        const savedProfile = localStorage.getItem('adminProfile');
        try {
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                return profile.role || 'Admin';
            }
        } catch (error) {
            // Erro ao carregar role
        }
        return 'Admin';
    });
    const [avatarUrl, setAvatarUrl] = useState<string | null>(() => {
        return localStorage.getItem('adminAvatar');
    });

    // Links da Sidebar baseados no layout aprovado
    const menuItems = [
        { icon: <LayoutDashboard size={20} />, label: 'Visão Geral', path: '/dashboard' },
        { icon: <FileText size={20} />, label: 'Transparência (PDFs)', path: '/dashboard/transparencia' },
        { icon: <Settings size={20} />, label: 'Configurações', path: '/dashboard/configuracoes' },
    ];

    // --- LÓGICA DO DARK MODE ---
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    // --- SINCRONIZAR PERFIL COM HEADER ---
    useEffect(() => {
        // Atualizar displayName e userRole quando user muda
        if (user?.name) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDisplayName(user.name);
        }
        if (user?.role) {
            setUserRole(user.role);
        }

        // Listener para atualizações de perfil via CustomEvent
        const handleProfileUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail?.displayName) {
                setDisplayName(customEvent.detail.displayName);
            }
            if (customEvent.detail?.role) {
                setUserRole(customEvent.detail.role);
            }
        };

        // Listener para atualizações de avatar
        const handleAvatarUpdate = () => {
            const savedAvatar = localStorage.getItem('adminAvatar');
            setAvatarUrl(savedAvatar);
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        window.addEventListener('avatarUpdated', handleAvatarUpdate);

        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
            window.removeEventListener('avatarUpdated', handleAvatarUpdate);
        };
    }, [user?.name, user?.role]);
    // ---------------------------

    useEffect(() => {
        if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    // Handler para logout
    const handleLogout = async () => {
        try {
            await firebaseAuthService.logout();
            navigate('/admin');
        } catch (error) {
            // Erro ao fazer logout
        }
    };

  // ---------------------------

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 flex font-sans">
        
        {/* Sidebar - Desktop */}
        <aside className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
            transform transition-transform duration-300 lg:translate-x-0
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="h-full flex flex-col p-6">
            {/* Logo / Identidade */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <img 
                    src="/logo-educandario.webp" 
                    alt="Educandário Logo" 
                    className="w-8 h-8 object-contain"
                />
                <span className="font-bold text-slate-900 dark:text-white tracking-tight">Educandário Admin</span>
            </div>

            {/* Menu de Navegação */}
            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/dashboard'}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all
                    ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
                    `}
                >
                    {item.icon}
                    {item.label}
                </NavLink>
                ))}
            </nav>

            {/* Rodapé da Sidebar (Sair) */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-medium"
                >
                    <LogOut size={20} />
                    Sair
                </button>
            </div>
            </div>
        </aside>

        {/* Overlay para Mobile */}
        {isMobileMenuOpen && (
            <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
            
            {/* Top Header */}
            <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
            <button 
                className="p-2 lg:hidden text-slate-600 dark:text-slate-400"
                onClick={() => setIsMobileMenuOpen(true)}
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center gap-4 ml-auto">
                {/* Painel de Notificações */}
                <NotificationPanel />

                {/* Botão Dark Mode */}
                <button 
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-yellow-400 rounded-xl transition-all"
                    title="Alternar tema"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                
                {/* Perfil do Usuário */}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">{userRole}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mt-1">Desenvolvedor</p>
                </div>
                <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    ) : (
                        <User size={20} className="text-white" />
                    )}
                </div>
                </div>
            </div>
            </header>

            {/* Área da Página (Renderiza o index.tsx do Dashboard) */}
            <main className="p-6 md:p-8 flex-1 overflow-x-hidden">
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
        </div>
    );
};

export default DashboardLayout;