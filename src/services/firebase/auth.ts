/**
 * Implementação Firebase para Autenticação
 * Implementa a interface AuthService do firebase
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  type User,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore } from './config';
import { AuthService, AuthUser, AuthError } from '@/services/api/auth';

/**
 * Implementação Firebase do serviço de autenticação
 */
export class FirebaseAuthService implements AuthService {
  /**
   * Converter Firebase User para AuthUser
   */
  private async firebaseUserToAuthUser(firebaseUser: User): Promise<AuthUser> {
    // Já temos o token de admin no claims
    const idTokenResult = await firebaseUser.getIdTokenResult();
    
    const isAdmin = idTokenResult.claims.admin === true;

    const authUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: firebaseUser.displayName || undefined,
      role: isAdmin ? 'admin' : 'user',
      createdAt: firebaseUser.metadata.creationTime
        ? new Date(firebaseUser.metadata.creationTime)
        : new Date(),
    };
    
    return {
      ...authUser,
      role: (authUser.role as 'admin' | 'user') || 'user',
    };
  }

  /**
   * Login com email e senha
   */
  async login(email: string, password: string): Promise<AuthUser> {
    try {
      // Persistência já foi configurada globalmente no carregamento do módulo
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const authUser = await this.firebaseUserToAuthUser(userCredential.user);
      return authUser;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('❌ [DEBUG] Erro no login:', err.code, err.message);
      // Traduzir erros Firebase
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Usuário desabilitado',
      };

      const message =
        (err.code ? errorMap[err.code] : undefined) || err.message || 'Erro ao fazer login';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('❌ [DEBUG] Erro ao fazer logout:', error);
      throw new AuthError(err.code || 'unknown', 'Erro ao fazer logout', error);
    }
  }

  /**
   * Criar novo usuário admin (apenas para admins)
   */
  async createAdminUser(
    email: string,
    password: string,
    name: string
  ): Promise<AuthUser> {
    try {
      // Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Atualizar perfil
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Salvar dados no Firestore com role admin
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        email,
        name,
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Retornar usuário criado
      return this.firebaseUserToAuthUser(userCredential.user);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const errorMap: Record<string, string> = {
        'auth/email-already-in-use': 'Email já está em uso',
        'auth/weak-password': 'Senha muito fraca',
        'auth/invalid-email': 'Email inválido',
      };

      const message =
        (err.code ? errorMap[err.code] : undefined) || err.message || 'Erro ao criar usuário';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Obter usuário autenticado atualmente
   */
  async getCurrentUser(): Promise<AuthUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    return this.firebaseUserToAuthUser(firebaseUser);
  }

  /**
   * Verificar se está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    return auth.currentUser != null;
  }

  /**
   * Enviar email para resetar senha
   * Por questões de segurança, nunca revela se um email existe ou não
   * (mesma prática de Google, Microsoft, bancos, etc)
   */
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ [DEBUG] Email de reset enviado para:', email);
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      
      // Segurança: nunca revelar que o email não existe
      if (err.code === 'auth/user-not-found') {
        console.log('⚠️ [DEBUG] Email não cadastrado (ocultado do usuário por segurança):', email);
        // Não relança o erro - retorna sucesso silenciosamente
        return;
      }
      
      // Para outros erros, relança
      const message = err.message || 'Erro ao enviar email de reset';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Verificar se o código de reset de senha é válido
   * Retorna o email associado ao código
   */
  async verifyResetCode(code: string): Promise<string> {
    try {
      console.log('🔐 [DEBUG] Verificando código de reset de senha...');
      const email = await verifyPasswordResetCode(auth, code);
      console.log('✅ [DEBUG] Código válido para email:', email);
      return email;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('❌ [DEBUG] Erro ao verificar código:', err.code, err.message);
      const errorMap: Record<string, string> = {
        'auth/expired-action-code': 'Link expirado. Solicite um novo email de recuperação.',
        'auth/invalid-action-code': 'Link inválido. Solicite um novo email de recuperação.',
        'auth/user-disabled': 'Usuário desativado.',
      };

      const message = (err.code ? errorMap[err.code] : undefined) || 'Código de reset inválido';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Confirmar reset de senha com código e nova senha
   * Usado quando o usuário clica no link do email e define uma nova senha
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      console.log('🔐 [DEBUG] Confirmando reset de senha...');
      await confirmPasswordReset(auth, code, newPassword);
      console.log('✅ [DEBUG] Senha resetada com sucesso!');
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('❌ [DEBUG] Erro ao resetar senha:', err.code, err.message);
      const errorMap: Record<string, string> = {
        'auth/expired-action-code': 'Link expirado. Solicite um novo email de recuperação.',
        'auth/invalid-action-code': 'Link inválido. Solicite um novo email de recuperação.',
        'auth/user-disabled': 'Usuário desativado.',
        'auth/weak-password': 'Nova senha muito fraca. Use pelo menos 6 caracteres.',
      };

      const message = (err.code ? errorMap[err.code] : undefined) || 'Erro ao resetar senha';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(updates: Partial<AuthUser>): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      throw new AuthError('auth/not-authenticated', 'Usuário não autenticado');
    }

    try {
      // Atualizar em Firebase Auth (nome)
      if (updates.name) {
        await updateProfile(firebaseUser, { displayName: updates.name });
      }

      // Atualizar em Firestore
      await setDoc(
        doc(firestore, 'users', firebaseUser.uid),
        {
          ...updates,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      throw new AuthError(err.code || 'unknown', 'Erro ao atualizar perfil', error);
    }
  }

  /**
   * Alterar senha do usuário autenticado
   * Requer autenticação prévia com a senha atual
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
      console.error('❌ [DEBUG] Usuário não autenticado para alterar senha');
      throw new AuthError('auth/not-authenticated', 'Usuário não autenticado');
    }

    try {
      console.log('🔐 [DEBUG] Iniciando alteração de senha para:', firebaseUser.email);
      // Reauthenticar com a senha atual
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );
      console.log('🔑 [DEBUG] Criado credencial para reauthenticação');
      
      await reauthenticateWithCredential(firebaseUser, credential);
      console.log('✅ [DEBUG] Reauthenticação bem-sucedida');

      // Atualizar para nova senha
      await updatePassword(firebaseUser, newPassword);
      console.log('✅ [DEBUG] Senha alterada com sucesso no Firebase!');
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      console.error('❌ [DEBUG] Erro ao alterar senha:', err.code, err.message);
      const errorMap: Record<string, string> = {
        'auth/wrong-password': 'Senha atual incorreta',
        'auth/weak-password': 'Nova senha muito fraca',
        'auth/requires-recent-login': 'Faça login novamente por segurança',
      };

      const message = (err.code ? errorMap[err.code] : undefined) || err.message || 'Erro ao alterar senha';
      throw new AuthError(err.code || 'unknown', message, error);
    }
  }

  /**
   * Listener para mudanças de autenticação
   * Retorna função para desinscrever
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    console.log('🔍 [DEBUG] Listener onAuthStateChanged assinado.');
    console.log('⏳ [DEBUG] Aguardando Firebase verificar sessão armazenada...');

    return onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔍 [DEBUG] Firebase retornou usuário:', firebaseUser ? `${firebaseUser.email}` : 'null');
      console.log('🔍 [DEBUG] Timestamp:', new Date().toISOString());
      
      if (firebaseUser) {
        try {
          const authUser = await this.firebaseUserToAuthUser(firebaseUser);
          console.log('✅ [DEBUG] Conversão para AuthUser concluída:', { email: authUser.email, role: authUser.role });
          callback(authUser);
        } catch (e) {
          console.error('❌ [DEBUG] Erro na conversão de usuário:', e);
          callback(null);
        }
      } else {
        console.log('⚠️ [DEBUG] Nenhum usuário encontrado. Possíveis causas:');
        console.log('   1. Usuário não fez login ainda');
        console.log('   2. Sessão expirou');
        console.log('   3. IndexedDB está vazio/corrompido');
        callback(null);
      }
    });
  }
}

// Instância singleton
export const firebaseAuthService = new FirebaseAuthService();
