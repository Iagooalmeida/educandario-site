import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, LogIn, Sun, Moon, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { firebaseAuthService } from '@/services/firebase/auth';
import { AuthError } from '@/services/api/auth';
import ForgotPasswordModal from '@/components/Admin/ForgotPasswordModal';

const Login: React.FC = () => {
  const navigate = useNavigate();
  // Estados do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    
    // Estado para controlar o tema localmente na página de login
    const [isDark, setIsDark] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return savedTheme === 'dark' || (!savedTheme && prefersDark);
    });

    // Sincroniza com a preferência do sistema ou localStorage no carregamento
    useEffect(() => {
        if (isDark) {
        document.documentElement.classList.add('dark');
        } else {
        document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    // Carrega email salvo ao montar o componente
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberMeEmail');
        const savedRememberMe = localStorage.getItem('rememberMeChecked') === 'true';
        
        if (savedEmail && savedRememberMe) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    // Limpa mensagens de erro/sucesso após 5 segundos
    useEffect(() => {
        if (error || success) {
        const timer = setTimeout(() => {
            setError('');
            setSuccess(false);
        }, 5000);
        return () => clearTimeout(timer);
        }
    }, [error, success]);

    // Validação básica de email
    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Manipulador de envio do formulário
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validação
        if (!email.trim()) {
        setError('Por favor, insira seu e-mail');
        return;
        }

        if (!isValidEmail(email)) {
        setError('Por favor, insira um e-mail válido');
        return;
        }

        if (!password) {
        setError('Por favor, insira sua senha');
        return;
        }

        setError('');
        setIsLoading(true);

        try {
            // Fazer login com Firebase
            const user = await firebaseAuthService.login(email, password);
            
            // Salvar email se "Lembrar-me" está marcado
            if (rememberMe) {
                localStorage.setItem('rememberMeEmail', email);
                localStorage.setItem('rememberMeChecked', 'true');
            } else {
                // Limpar dados salvos se desmarcar a opção
                localStorage.removeItem('rememberMeEmail');
                localStorage.removeItem('rememberMeChecked');
            }
            
            // Sucesso
            setSuccess(true);
            setEmail('');
            setPassword('');
            
            // Login realizado com sucesso
            
            // Redirecionar para o dashboard após 1.5 segundos
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err: any) {
            setIsLoading(false);
            
            // Limpar dados salvos em caso de erro (senha incorreta, etc)
            localStorage.removeItem('rememberMeEmail');
            localStorage.removeItem('rememberMeChecked');
            
            // Mapear erros do Firebase para mensagens amigáveis em português
            let userFriendlyError = 'Erro ao fazer login. Tente novamente.';
            
            if (err?.code === 'auth/invalid-credential') {
                userFriendlyError = '❌ E-mail ou senha incorretos. Verifique seus dados e tente novamente.';
            } else if (err?.code === 'auth/user-not-found') {
                userFriendlyError = '❌ Usuário não encontrado. Verifique seu e-mail.';
            } else if (err?.code === 'auth/wrong-password') {
                userFriendlyError = '❌ Senha incorreta. Tente novamente.';
            } else if (err?.code === 'auth/too-many-requests') {
                userFriendlyError = '⏱️ Muitas tentativas de login. Tente novamente mais tarde.';
            } else if (err?.code === 'auth/user-disabled') {
                userFriendlyError = '🔒 Esta conta foi desativada. Entre em contato com o suporte.';
            } else if (err?.code === 'auth/invalid-email') {
                userFriendlyError = '❌ E-mail inválido. Verifique o formato e tente novamente.';
            } else if (err instanceof AuthError) {
                userFriendlyError = err.message;
            } else if (err?.message) {
                userFriendlyError = err.message;
            }
            
            setError(userFriendlyError);
            // Erro ao fazer login
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        }
    };

    const handleResetPassword = async (resetEmail: string) => {
        try {
            await firebaseAuthService.resetPassword(resetEmail);
            // Email de reset enviado
        } catch (err: any) {
            // Erro ao enviar email de reset
            throw err;
        }
    };

    return (
        // O container principal agora reage à classe 'dark' e usa transições suaves
        <div className={`${isDark ? 'dark' : ''} min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-500 relative overflow-hidden font-sans`}>
        
        {/* Detalhes de fundo (Blur dinâmico que muda de cor no dark mode) */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-[100px] opacity-70 transition-colors duration-500" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-200 dark:bg-blue-900/30 rounded-full blur-[100px] opacity-70 transition-colors duration-500" />

        {/* Header de Acessibilidade (Voltar + Toggle de Tema) */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <a 
            href="/" 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Voltar ao site</span>
            </a>

            {/* Botão de Toggle de Tema Moderno */}
            <button 
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-yellow-400 hover:scale-110 transition-all active:scale-95"
            title="Alternar contraste"
            >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        <div className="w-full max-w-md z-10">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.5)] border border-slate-200/60 dark:border-slate-800/60 transition-all duration-500">
            
            <div className="text-center mb-10">
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">Área Administrativa</h1>
                <p className="text-slate-600 dark:text-slate-400">Portal de Gestão Educandário</p>
            </div>

            {/* Mensagem de Sucesso */}
            {success && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-2xl animate-in fade-in slide-in-from-top">
                <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Login realizado com sucesso!</p>
                </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl animate-in fade-in slide-in-from-top">
                <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-300 ml-1">E-mail</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                    type="email" 
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all dark:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                </div>
                </div>

                <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-sm font-semibold text-slate-800 dark:text-slate-300">Senha</label>
                    <button 
                        type="button"
                        onClick={() => setShowForgotPasswordModal(true)}
                        className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer">
                        Esqueceu a senha?
                    </button>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                    }}
                    disabled={isLoading}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-950 outline-none transition-all dark:text-white hover:border-slate-300 dark:hover:border-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    title="Mostrar/ocultar senha"
                    >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                </div>

                {/* Checkbox Lembrar-me */}
                <div className="flex items-center gap-3">
                <input 
                    type="checkbox" 
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                />
                <label htmlFor="remember" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Lembrar-me neste dispositivo
                </label>
                </div>

                <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 disabled:cursor-not-allowed
                    text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center 
                    gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 disabled:hover:scale-100 disabled:shadow-blue-500/20 cursor-pointer"
                >
                {isLoading ? (
                    <>
                    <span className="inline-flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </span>
                    Autenticando...
                    </>
                ) : (
                    <>
                    <LogIn size={20} />
                    Acessar Painel
                    </>
                )}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-semibold">
                Segurança Educandário N. S. Aparecida
                </p>
            </div>
            </div>
        </div>

        {/* Modal de Recuperação de Senha */}
        <ForgotPasswordModal 
            isOpen={showForgotPasswordModal}
            onClose={() => setShowForgotPasswordModal(false)}
            onReset={handleResetPassword}
        />
        </div>
    );
};

export default Login;