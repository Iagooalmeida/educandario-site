import { useState, useEffect, useCallback } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { userProfileService } from '@/services/userProfileService';

interface UserProfileData {
    displayName: string;
    email: string;
    avatar: string | null;
    role?: string;
}

export const useUserProfile = () => {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Buscar perfil ao montar
    const fetchProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userProfileService.getProfile();
            setProfile(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar perfil');
            console.error('Erro ao buscar perfil:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Listener para mudanças de autenticação
        const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
            console.log('🔐 Auth state changed:', user?.email);
            // Quando o estado de autenticação muda, recarregar o perfil
            fetchProfile();
        });

        return () => unsubscribe();
    }, [fetchProfile]);

    // Atualizar perfil
    const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
        try {
            setError(null);
            const updated = await userProfileService.updateProfile(updates);
            setProfile(updated);
            
            // Disparar evento para atualizar header
            window.dispatchEvent(new CustomEvent('profileUpdated', { detail: updated }));
            
            return updated;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
            setError(errorMsg);
            throw err;
        }
    }, []);

    // Enviar avatar
    const uploadAvatar = useCallback(async (base64: string) => {
        try {
            setError(null);
            const avatarUrl = await userProfileService.uploadAvatar(base64);
            const updated = await userProfileService.getProfile();
            setProfile(updated);
            
            // Disparar evento para atualizar header
            window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: updated }));
            
            return avatarUrl;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao enviar avatar';
            setError(errorMsg);
            throw err;
        }
    }, []);

    // Remover avatar
    const removeAvatar = useCallback(async () => {
        try {
            setError(null);
            await userProfileService.removeAvatar();
            const updated = await userProfileService.getProfile();
            setProfile(updated);
            
            // Disparar evento para atualizar header
            window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: updated }));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Erro ao remover avatar';
            setError(errorMsg);
            throw err;
        }
    }, []);

    // Limpar erro
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        profile,
        loading,
        error,
        fetchProfile,
        updateProfile,
        uploadAvatar,
        removeAvatar,
        clearError
    };
};
