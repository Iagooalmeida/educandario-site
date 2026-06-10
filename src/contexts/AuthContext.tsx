import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { firebaseAuthService } from '@/services/firebase/auth';
import { AuthUser, AuthError } from '@/services/api/auth';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
}

// Criar o context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Listener GLOBAL - montado apenas uma vez
  useEffect(() => {
    
    // Criar listener apenas se não existir
    if (!unsubscribeRef.current) {
      unsubscribeRef.current = firebaseAuthService.onAuthStateChanged((authUser) => {
        setUser(authUser);
        setError(null);
        setLoading(false);
      });
    }

    // Cleanup: manter o listener vivo entre re-renders
    // Não desinscrever aqui - isso causaria o problema!
    return () => {
      // Limpar timeout pendente
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
        logoutTimeoutRef.current = null;
      }
      // NÃO desinscrever o listener global aqui!
      // Ele deve persistir durante toda a vida da aplicação
    };
  }, []); // Dependency array vazio = executa apenas uma vez

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await firebaseAuthService.login(email, password);
    } catch (err) {
      const authError = err instanceof AuthError ? err : new AuthError('unknown', String(err));
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true);
      await firebaseAuthService.logout();
      setUser(null);
    } catch (err) {
      const authError = err instanceof AuthError ? err : new AuthError('unknown', String(err));
      setError(authError);
      throw authError;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await firebaseAuthService.resetPassword(email);
    } catch (err) {
      const authError = err instanceof AuthError ? err : new AuthError('unknown', String(err));
      setError(authError);
      throw authError;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null);
      setLoading(true);
      await firebaseAuthService.changePassword(currentPassword, newPassword);
      
      // ✅ MUDANÇA: Logout automático REMOVIDO
      // O SecuritySection.tsx agora controla o countdown de 5 segundos e o logout
      // Este aqui estava conflitando com o countdown do modal de sucesso
      setLoading(false);
    } catch (err) {
      const authError = err instanceof AuthError ? err : new AuthError('unknown', String(err));
      setError(authError);
      setLoading(false);
      throw authError;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    resetPassword,
    changePassword,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar o context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
