import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Index() {
  const { user, perfil, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-pulse text-sm">Carregando Meu Concierge de Saúde...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Redirecionamento baseado nos 4 perfis do PRD v0.0.4
  if (perfil === 'GESTOR_VENART' || perfil === 'GESTOR_PROGRAMA') {
    return <Navigate to="/gestor" replace />
  }
  if (perfil === 'GESTOR_RH') {
    return <Navigate to="/rh" replace />
  }
  if (perfil === 'OPERACAO') {
    return <Navigate to="/atendente" replace />
  }

  return <Navigate to="/gestor" replace />
}
