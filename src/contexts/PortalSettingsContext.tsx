import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { portalSettingsService } from '@/services/portalSettingsService';

interface PortalSettings {
  id?: string;
  user_id?: string;
  description: string;
  website: string;
  phone: string;
  email?: string;
  phone2?: string;
  address?: string;
  instagram?: string;
  instagramHandle?: string;
  facebook?: string;
  facebookHandle?: string;
  pixKey?: string;
  urgentNeedTitle?: string;
  urgentNeedDescription?: string;
  urgentNeedWindow?: string;
  urgentNeedDelivery?: string;
  updated_at?: string;
}

interface PortalSettingsContextType {
  settings: PortalSettings | null;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<PortalSettings>) => Promise<PortalSettings>;
  clearError: () => void;
}

const PortalSettingsContext = createContext<PortalSettingsContextType | undefined>(undefined);

export const PortalSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Buscar configurações
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await portalSettingsService.getSettings();
      setSettings(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar configurações';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar configurações
  const updateSettings = useCallback(async (updates: Partial<PortalSettings>) => {
    try {
      setError(null);
      const updated = await portalSettingsService.updateSettings(updates);
      setSettings(updated);
      
      // Dispara evento customizado para notificar outros listeners
      window.dispatchEvent(new CustomEvent('portalSettingsUpdated', { detail: updated }));
      
      return updated;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar configurações ao montar
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Listener para atualizações
  useEffect(() => {
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      setSettings(customEvent.detail);
    };

    window.addEventListener('portalSettingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('portalSettingsUpdated', handleSettingsUpdate);
  }, []);

  return (
    <PortalSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
        clearError,
      }}
    >
      {children}
    </PortalSettingsContext.Provider>
  );
};

export const usePortalSettingsContext = () => {
  const context = useContext(PortalSettingsContext);
  if (context === undefined) {
    throw new Error('usePortalSettingsContext deve ser usado dentro de PortalSettingsProvider');
  }
  return context;
};
