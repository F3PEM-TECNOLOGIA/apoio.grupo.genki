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
  allowedRoles?: (UserPerfil | 'GESTOR' | 'RH' | 'ATENDENTE')[]
}) {
  const { user, perfil, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
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

  if (allowedRoles && allowedRoles.length > 0 && perfil) {
    // Normalização de papéis permitidos para suportar nomenclaturas
    const normalizedAllowed: string[] = []
    for (const r of allowedRoles) {
      if (r === 'GESTOR') {
        normalizedAllowed.push('GESTOR_VENART', 'GESTOR_PROGRAMA')
      } else if (r === 'RH') {
        normalizedAllowed.push('GESTOR_RH')
      } else if (r === 'ATENDENTE') {
        normalizedAllowed.push('OPERACAO')
      } else {
        normalizedAllowed.push(r)
      }
    }

    if (!normalizedAllowed.includes(perfil)) {
      if (perfil === 'GESTOR_VENART') return <Navigate to="/gestor" replace />
      if (perfil === 'GESTOR_PROGRAMA') return <Navigate to="/gestor" replace />
      if (perfil === 'GESTOR_RH') return <Navigate to="/rh" replace />
      if (perfil === 'OPERACAO') return <Navigate to="/atendente" replace />
      return <Navigate to="/gestor" replace />
    }
  }

  return <>{children}</>
}
