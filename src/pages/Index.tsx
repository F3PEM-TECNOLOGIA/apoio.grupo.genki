import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export default function Index() {
  const { user, perfil, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (perfil === 'GESTOR') return <Navigate to="/gestor" replace />
  if (perfil === 'RH') return <Navigate to="/rh" replace />
  if (perfil === 'ATENDENTE') return <Navigate to="/atendente" replace />

  return <Navigate to="/gestor" replace />
}
