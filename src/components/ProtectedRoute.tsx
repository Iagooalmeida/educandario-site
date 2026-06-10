import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rotas que exigem autenticação
 * Redireciona para /admin se não estiver autenticado
 * 
 * Importante: Aguarda loading=false antes de renderizar qualquer coisa
 * Isso garante que o Firebase teve tempo de verificar a sessão persistida
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  // TRAVA: Verifica se uma troca de senha está em andamento
  // Se estiver, ignora o user === null temporariamente
  const isPasswordChanging = sessionStorage.getItem('isPasswordChanging') === 'true';

  // Enquanto Firebase está verificando sessão, mostra loading
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
          <p>Carregando Painel...</p>
        </div>
      </div>
    );
  }

  // Depois que Firebase respondeu (loading=false):
  // Se não estiver autenticado E não há mudança de senha em curso, redireciona
  if (!user && !isPasswordChanging) {
    return <Navigate to="/admin" replace />;
  }

  // Se há mudança de senha em curso, permite continuar renderizando (modal de sucesso)
  if (!user && isPasswordChanging) {
    return <>{children}</>;
  }

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
};

export default ProtectedRoute;
