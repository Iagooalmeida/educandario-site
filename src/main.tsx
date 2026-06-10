import { RouterProvider } from 'react-router-dom'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './App'
import { AuthProvider } from '@/contexts/AuthContext'
import { PortalSettingsProvider } from '@/contexts/PortalSettingsContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// 🔥 Inicializar Firebase (DEVE ser importado antes de usar)
import '@/services/firebase/config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <PortalSettingsProvider>
          <RouterProvider router={router} />
        </PortalSettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
