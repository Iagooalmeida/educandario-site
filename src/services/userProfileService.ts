import { getAuth, updateProfile as firebaseUpdateProfile, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import { auditService } from './auditService';

interface UserProfileData {
    displayName: string;
    email: string;
    avatar: string | null;
    role?: string;
}

class UserProfileService {
    private readonly STORAGE_KEY = 'adminProfile';
    private readonly AVATAR_KEY = 'adminAvatar';

    private getCurrentUser(): Promise<any> {
        return new Promise((resolve) => {
            // Primeiro tenta obter o usuário de forma síncrona
            const syncUser = getAuth().currentUser;
            if (syncUser) {
                resolve(syncUser);
                return;
            }

            // Se não houver usuário, aguarda por mudanças de estado
            const unsubscribe = onAuthStateChanged(getAuth(), (user) => {
                unsubscribe();
                resolve(user);
            });
        });
    }

    async getProfile(): Promise<UserProfileData> {
        try {
            // Obter usuário do Firebase com listener
            const currentUser = await this.getCurrentUser();
            
            console.log('📋 [DEBUG] currentUser:', currentUser);
            console.log('📋 [DEBUG] currentUser.displayName:', currentUser?.displayName);
            console.log('📋 [DEBUG] currentUser.email:', currentUser?.email);
            
            // Se há um usuário autenticado, usar seus dados
            if (currentUser) {
                const avatar = localStorage.getItem(this.AVATAR_KEY);
                const profileFromStorage = localStorage.getItem(this.STORAGE_KEY);
                const storedRole = profileFromStorage ? JSON.parse(profileFromStorage).role : 'Admin';

                const profile = {
                    displayName: currentUser.displayName || 'Usuário',
                    email: currentUser.email || '',
                    avatar: avatar,
                    role: storedRole || 'Admin'
                };
                
                console.log('✅ [DEBUG] Perfil carregado do Firebase:', profile);
                return profile;
            }

            // Se não há usuário, retornar dados do localStorage ou padrão
            const profile = localStorage.getItem(this.STORAGE_KEY);
            const avatar = localStorage.getItem(this.AVATAR_KEY);
            
            if (profile) {
                return { ...JSON.parse(profile), avatar };
            }

            return {
                displayName: '',
                email: '',
                avatar: null,
                role: 'Admin'
            };
        } catch (error) {
            console.error('❌ Erro ao carregar perfil do usuário', error);
            return {
                displayName: '',
                email: '',
                avatar: null,
                role: 'Admin'
            };
        }
    }

    async updateProfile(updates: Partial<UserProfileData>): Promise<UserProfileData> {
        try {
            const current = await this.getProfile();
            const updated = { ...current, ...updates };
            
            // Atualizar no Firebase se há usuário autenticado
            const currentUser = await this.getCurrentUser();
            
            if (currentUser && updates.displayName) {
                await firebaseUpdateProfile(currentUser, {
                    displayName: updates.displayName
                });
            }
            
            // Não salvar avatar aqui (é handled separadamente)
            const { avatar, ...profileData } = updated;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profileData));
            
            // Log auditoria
            await auditService.addLog(`👤 Perfil atualizado: ${updated.displayName}`);
            
            return updated;
        } catch (error) {
            throw new Error(`Falha ao atualizar perfil: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async uploadAvatar(base64: string): Promise<string> {
        try {
            // Validar tamanho (máximo 5MB)
            const sizeInBytes = (base64.length * 3) / 4;
            const sizeInMB = sizeInBytes / (1024 * 1024);
            
            if (sizeInMB > 5) {
                throw new Error('Avatar deve ter no máximo 5MB');
            }
            
            localStorage.setItem(this.AVATAR_KEY, base64);
            await auditService.addLog('📷 Foto de perfil atualizada');
            
            return base64;
        } catch (error) {
            throw new Error(`Falha ao enviar avatar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async removeAvatar(): Promise<void> {
        try {
            localStorage.removeItem(this.AVATAR_KEY);
            await auditService.addLog('📷 Foto de perfil removida');
        } catch (error) {
            throw new Error(`Falha ao remover avatar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
    }

    async clearProfile(): Promise<void> {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.AVATAR_KEY);
        } catch (error) {
            console.error('Erro ao limpar perfil', error);
        }
    }
}

export const userProfileService = new UserProfileService();
