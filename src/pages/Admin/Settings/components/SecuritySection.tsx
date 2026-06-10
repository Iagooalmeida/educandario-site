import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SecuritySection: React.FC = () => {
    const navigate = useNavigate();
    const { changePassword, logout } = useAuth();
    const [securityData, setSecurityData] = useState({
        twoFAEnabled: false,
        lastPasswordChange: '15 de março de 2026'
    });
    const [showPasswordModal, setShowPasswordModal] = useState(() => {
        const savedModal = sessionStorage.getItem('showPasswordModal') === 'true';
        return savedModal;
    });
    // PERSISTÊNCIA: Restaura estado do modal do sessionStorage
    const [showSuccessModal, setShowSuccessModal] = useState(() => {
        const savedModal = sessionStorage.getItem('showSuccessModal') === 'true';
        const isPasswordChanging = sessionStorage.getItem('isPasswordChanging') === 'true';
        // Só restaura sucesso se trava está ativa
        return isPasswordChanging && savedModal;
    });
    const [countdownSeconds, setCountdownSeconds] = useState(() => {
        const isPasswordChanging = sessionStorage.getItem('isPasswordChanging') === 'true';
        const saved = sessionStorage.getItem('countdownSeconds');
        const value = isPasswordChanging && saved ? parseInt(saved, 10) : 5;
        return value;
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState(() => {
        const error = sessionStorage.getItem('passwordError');
        return error || '';
    });
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [twoFASuccess, setTwoFASuccess] = useState('');
    const [twoFAMessage, setTwoFAMessage] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // MONITOR: Quando showSuccessModal muda, registra no console E persiste no sessionStorage
    useEffect(() => {
        // PERSISTÊNCIA: Salva no sessionStorage para resistir a remontagems
        if (showSuccessModal) {
            sessionStorage.setItem('showSuccessModal', 'true');
        } else {
            sessionStorage.removeItem('showSuccessModal');
        }
    }, [showSuccessModal, showPasswordModal]);

    // MONITOR: Quando showPasswordModal muda, persiste no sessionStorage
    useEffect(() => {
        if (showPasswordModal) {
            sessionStorage.setItem('showPasswordModal', 'true');
        } else {
            sessionStorage.removeItem('showPasswordModal');
        }
    }, [showPasswordModal]);

    // MONITOR: Quando countdownSeconds muda, registra no console E persiste
    useEffect(() => {
        // PERSISTÊNCIA: Salva no sessionStorage
        if (countdownSeconds > 0) {
            sessionStorage.setItem('countdownSeconds', String(countdownSeconds));
        } else if (countdownSeconds === 0) {
            sessionStorage.removeItem('countdownSeconds');
        }
    }, [countdownSeconds]);

    // MONITOR: Quando passwordError muda, persiste no sessionStorage
    useEffect(() => {
        if (passwordError) {
            sessionStorage.setItem('passwordError', passwordError);
        } else {
            sessionStorage.removeItem('passwordError');
        }
    }, [passwordError]);

    // Countdown timer para modal de sucesso
    useEffect(() => {
        
        if (!showSuccessModal) {
            return;
        }

        if (countdownSeconds > 0) {
            const timer = setTimeout(() => {
                setCountdownSeconds(countdownSeconds - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
        
        if (countdownSeconds === 0) {
            // 1. Limpa a trava de sessão
            sessionStorage.removeItem('isPasswordChanging');
            
            // 2. Executa o redirecionamento e logout
            navigate('/admin');
            
            setTimeout(() => {
                logout();
            }, 500);
        }
    }, [showSuccessModal, countdownSeconds, logout, navigate]);

    const handleToggle2FA = () => {
        const newStatus = !securityData.twoFAEnabled;
        setSecurityData(prev => ({
            ...prev,
            twoFAEnabled: newStatus
        }));
        
        setTwoFAMessage(newStatus ? 'ativada' : 'desativada');
        setTwoFASuccess('true');
        setTimeout(() => setTwoFASuccess(''), 3000);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        // 🔄 MELHORIA: Limpa erro ao usuário começar a digitar
        setPasswordError('');
    };

    const handleChangePassword = async () => {
        
        if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setPasswordError('Todos os campos são obrigatórios');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('As senhas não coincidem');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('A nova senha deve ter pelo menos 8 caracteres');
            return;
        }

        setIsChangingPassword(true);
        setPasswordError('');

        try {
            // 1. TRAVA: Ativa ANTES da mudança que invalida o token
            sessionStorage.setItem('isPasswordChanging', 'true');
            
            // 2. Chamar a função de alterar senha do Firebase
            await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            
            // 3. Preparar transição para modal de sucesso
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            setPasswordError('');
            
            // 4. Fechar modal de entrada (PRIMEIRO)
            setShowPasswordModal(false);
            sessionStorage.removeItem('showPasswordModal'); // Limpa IMEDIATAMENTE do storage
            
            // 5. Ativar modal de sucesso (DEPOIS)
            setCountdownSeconds(5);
            setShowSuccessModal(true);
            
            sessionStorage.setItem('showSuccessModal', 'true');
            sessionStorage.setItem('countdownSeconds', '5');
            sessionStorage.removeItem('passwordError'); // Remove erro anterior se houver
            
            setPasswordSuccess(true);
            
            setIsChangingPassword(false);
            
        } catch (err: any) {
            let userFriendlyError = 'Erro ao alterar a senha';
            if (err.code === 'auth/invalid-credential') {
                userFriendlyError = '❌ Senha atual incorreta. Verifique e tente novamente.';
            } else if (err.code === 'auth/weak-password') {
                userFriendlyError = '⚠️ A senha é muito fraca. Use letras maiúsculas, minúsculas, números e símbolos.';
            } else if (err.code === 'auth/requires-recent-login') {
                userFriendlyError = '⏱️ Você precisa fazer login novamente para alterar a senha.';
            }
            
            sessionStorage.setItem('passwordError', userFriendlyError);
            
            setPasswordError(userFriendlyError);
            setIsChangingPassword(false);
        }
    };

    return (
        <>
            {/* Bloco de Segurança */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-md sticky top-6">
                {/* Header */}
                <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800/50 bg-linear-to-r from-red-50/50 to-orange-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 sm:p-3 bg-red-100 dark:bg-red-900/30 rounded-xl sm:rounded-2xl">
                            <Shield className="text-red-600 dark:text-red-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Segurança</h2>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Proteja sua conta</p>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                    {/* 2FA */}
                    <div className="space-y-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Autenticação de Dois Fatores</h3>
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Adicione uma camada extra de proteção</p>
                            </div>
                            {/* Toggle Switch */}
                            <button
                                onClick={handleToggle2FA}
                                className={`relative inline-flex items-center w-14 sm:w-16 h-8 sm:h-9 rounded-full transition-all shrink-0 ${
                                    securityData.twoFAEnabled
                                        ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                        : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                            >
                                <span
                                    className={`inline-block w-6 sm:w-7 h-6 sm:h-7 bg-white rounded-full transition-transform shadow-md ${
                                        securityData.twoFAEnabled ? 'translate-x-7 sm:translate-x-8' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Status */}
                        <div className={`p-3 sm:p-4 rounded-lg ${
                            securityData.twoFAEnabled
                                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30'
                                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30'
                        }`}>
                            <p className={`text-xs sm:text-sm font-medium ${
                                securityData.twoFAEnabled
                                    ? 'text-green-700 dark:text-green-400'
                                    : 'text-yellow-700 dark:text-yellow-400'
                            }`}>
                                {securityData.twoFAEnabled
                                    ? '✓ Autenticação ativada'
                                    : '⚠ Autenticação desativada'}
                            </p>
                        </div>

                        {/* Sucesso do 2FA */}
                        {twoFASuccess && (
                            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <Check size={16} />
                                    Autenticação de Dois Fatores {twoFAMessage}!
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Divisor */}
                    <div className="border-t border-slate-100 dark:border-slate-800/50" />

                    {/* Alterar Senha */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Alterar Senha</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Última alteração: {securityData.lastPasswordChange}</p>
                        </div>

                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <Lock size={16} />
                            Trocar Senha
                        </button>
                    </div>

                    {/* Status de Sucesso */}
                    {passwordSuccess && (
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                            <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                <Check size={16} />
                                Senha alterada com sucesso!
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Sucesso - Senha Alterada */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-md" />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md p-4 sm:p-8">
                        {/* Ícone de Sucesso */}
                        <div className="flex justify-center mb-4 sm:mb-6">
                            <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 dark:bg-green-900/30 rounded-full">
                                <Check className="text-green-600 dark:text-green-400" size={32} />
                            </div>
                        </div>

                        {/* Título */}
                        <h3 className="text-center text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                            Senha Alterada com Sucesso!
                        </h3>

                        {/* Descrição */}
                        <p className="text-center text-sm sm:text-base text-slate-600 dark:text-slate-300 mb-6 sm:mb-8">
                            Sua senha foi alterada com segurança. Você será desconectado em breve.
                        </p>

                        {/* Contador */}
                        <div className="flex justify-center items-center gap-2 mb-6 sm:mb-8">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                <span className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {countdownSeconds}
                                </span>
                            </div>
                        </div>

                        {/* Texto do Countdown */}
                        <p className="text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
                            Redirecionando para login em {countdownSeconds} segundo{countdownSeconds !== 1 ? 's' : ''}...
                        </p>

                        {/* Botão para Desconectar Agora */}
                        <button
                            onClick={() => {
                                navigate('/admin');
                                setTimeout(() => {
                                    logout();
                                }, 500);
                            }}
                            className="w-full px-4 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm sm:text-base transition-all"
                        >
                            Desconectar Agora
                        </button>
                    </div>
                </div>
            )}

            {/* Modal de Alterar Senha */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setShowPasswordModal(false)}
                    />

                    {/* Modal Container */}
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Trocar Senha</h3>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Digite sua senha atual e a nova senha</p>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                            {/* Senha Atual */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Senha Atual</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        name="currentPassword"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        className={`w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-950/50 border rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 transition-all ${
                                            passwordError 
                                                ? 'border-red-400 dark:border-red-600 focus:ring-red-500' 
                                                : 'border-slate-200 dark:border-slate-700 focus:ring-blue-500'
                                        }`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Nova Senha */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nova Senha</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-4 py-2.5 pr-10 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    >
                                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Mínimo 8 caracteres</p>
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            {/* Erro */}
                            {passwordError && (
                                <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-lg animate-in fade-in-50 duration-200">
                                    <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                        <AlertCircle size={16} className="shrink-0" />
                                        <span>{passwordError}</span>
                                    </p>
                                </div>
                            )}

                            {/* Botões */}
                            <div className="flex gap-3 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    onClick={() => {
                                        // 1. Limpa o formulário
                                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                        setPasswordError('');
                                        // 2. Fecha o modal de entrada
                                        setShowPasswordModal(false);
                                        // 3. Limpa COMPLETAMENTE o estado de sucesso se estiver ativo
                                        setShowSuccessModal(false);
                                        // 4. Remove a trava de sessão para permitir novo ciclo
                                        sessionStorage.removeItem('isPasswordChanging');
                                        sessionStorage.removeItem('showSuccessModal');
                                        sessionStorage.removeItem('countdownSeconds');
                                        sessionStorage.removeItem('passwordError');
                                    }}
                                    disabled={isChangingPassword}
                                    className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleChangePassword}
                                    disabled={isChangingPassword}
                                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                                >
                                    {isChangingPassword ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Alterando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Salvar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SecuritySection;
