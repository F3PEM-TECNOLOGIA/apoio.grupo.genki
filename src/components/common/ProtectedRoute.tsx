import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { UserPerfil } from '@/types/saude'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserPerfil[]
}) {
  const { user, perfil, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && perfil && !allowedRoles.includes(perfil)) {
    // Redireciona para a home correspondente ao perfil
    if (perfil === 'GESTOR') return <Navigate to="/gestor" replace />
    if (perfil === 'RH') return <Navigate to="/rh" replace />
    if (perfil === 'ATENDENTE') return <Navigate to="/atendente" replace />
  }

  return <>{children}</>
}
