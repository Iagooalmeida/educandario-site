import React, { useRef, useState, useEffect } from 'react';
import { User, Mail, Shield, Check, AlertCircle, Upload, Trash2 } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const ProfileSection: React.FC = () => {
    const { profile, error: profileError, updateProfile, uploadAvatar, removeAvatar: removeAvatarService, clearError: clearProfileError } = useUserProfile();
    const { fetchLogs } = useAuditLogs();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [editingProfileData, setEditingProfileData] = useState({
        displayName: profile?.displayName || '',
        email: profile?.email || ''
    });

    // Sincronizar dados do profile quando ele muda
    useEffect(() => {
        if (profile) {
            setEditingProfileData({
                displayName: profile.displayName || '',
                email: profile.email || ''
            });
        }
    }, [profile]);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            clearProfileError();

            if (!file.type.startsWith('image/')) {
                throw new Error('Por favor, selecione uma imagem válida (PNG, JPG, etc.)');
            }

            if (file.size > 5 * 1024 * 1024) {
                throw new Error('A imagem não pode exceder 5MB');
            }

            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const result = event.target?.result as string;
                    await uploadAvatar(result);
                    await fetchLogs();
                    setProfileSuccess(true);
                    setTimeout(() => setProfileSuccess(false), 3000);
                } catch (error) {
                    console.error('Erro ao fazer upload do avatar:', error);
                }
            };
            reader.readAsDataURL(file);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erro ao validar imagem';
            console.error('Erro ao fazer upload:', errorMsg);
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            clearProfileError();
            await removeAvatarService();
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            await fetchLogs();
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } catch (error) {
            console.error('Erro ao remover avatar:', error);
        }
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditingProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async () => {
        if (!editingProfileData.displayName.trim()) {
            console.error('O nome é obrigatório');
            return;
        }
        
        try {
            clearProfileError();
            await updateProfile({
                displayName: editingProfileData.displayName
            });
            await fetchLogs();
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
            setEditingProfile(false);
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800/50 bg-linear-to-r from-blue-50/50 to-purple-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl">
                        <User className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Perfil</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Edite suas informações pessoais</p>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {/* Seção de Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    {/* Avatar Display */}
                    <div className="relative">
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-linear-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white dark:border-slate-800 hover:shadow-2xl transition-all">
                            {profile?.avatar ? (
                                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-white" size={48} />
                            )}
                        </div>
                        
                        {/* Overlay de Upload */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                            title="Upload de foto"
                        >
                            <Upload size={16} />
                        </button>
                    </div>

                    {/* Info do Avatar */}
                    <div className="flex-1">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2">Foto de Perfil</h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3">
                            {profile?.avatar ? 'Clique no ícone de câmera para atualizar' : 'Adicione uma foto de perfil para personalizar sua conta'}
                        </p>
                        
                        {/* Botões de Ação */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                            >
                                <Upload size={14} />
                                Enviar
                            </button>
                            {profile?.avatar && (
                                <button
                                    onClick={handleRemoveAvatar}
                                    className="flex items-center justify-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} />
                                    Remover
                                </button>
                            )}
                        </div>

                        {/* Info de Tamanho */}
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Máximo 5MB • PNG, JPG ou GIF</p>
                    </div>

                    {/* Input File Oculto */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        aria-label="Upload de foto de perfil"
                    />
                </div>

                {/* Divisor */}
                <div className="border-t border-slate-100 dark:border-slate-800/50"></div>

                {editingProfile ? (
                    <>
                        {/* Nome */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome de Exibição</label>
                            <input
                                type="text"
                                name="displayName"
                                value={editingProfileData.displayName}
                                onChange={handleProfileChange}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Seu nome"
                            />
                        </div>

                        {/* Email - Somente leitura */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
                            <div className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 flex items-center">
                                {editingProfileData.email || 'Não informado'}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">O e-mail não pode ser alterado aqui. Entre em contato com o administrador se precisar atualizar seu e-mail.</p>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-3 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                onClick={() => {
                                    setEditingProfile(false);
                                    setEditingProfileData({
                                        displayName: profile?.displayName || '',
                                        email: profile?.email || ''
                                    });
                                }}
                                className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                Salvar Perfil
                            </button>
                        </div>

                        {/* Erro do Perfil */}
                        {profileError && (
                            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {profileError}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Visualização */}
                        <div className="space-y-4 sm:space-y-5">
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <User className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Nome</p>
                                        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{profile?.displayName || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-slate-400" size={18} />
                                    <div>
                                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">E-mail</p>
                                        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{profile?.email || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                                <div className="flex items-center gap-3">
                                    <Shield className="text-blue-600 dark:text-blue-400" size={18} />
                                    <div>
                                        <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">Cargo</p>
                                        <p className="text-sm sm:text-base font-semibold text-blue-700 dark:text-blue-300">{profile?.role || 'Usuário'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sucesso do Perfil */}
                        {profileSuccess && (
                            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <Check size={16} />
                                    Perfil atualizado com sucesso!
                                </p>
                            </div>
                        )}

                        {/* Botão de Edição */}
                        <button
                            onClick={() => {
                                setEditingProfileData({
                                    displayName: profile?.displayName || '',
                                    email: profile?.email || ''
                                });
                                setEditingProfile(true);
                            }}
                            className="w-full px-4 py-2.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg font-medium text-sm transition-colors"
                        >
                            Editar Perfil
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfileSection;
