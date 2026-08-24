import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { User, UserPerfil } from '@/types'

interface AuthContextType {
  user: User | null
  perfil: UserPerfil | null
  isLoading: boolean
  login: (email: string, pass: string) => Promise<UserPerfil>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const loadUserData = () => {
    if (pb.authStore.isValid && pb.authStore.record) {
      const authUser = pb.authStore.record as unknown as User
      // Se não tiver perfil definido (ex: seed antigo), default para GESTOR
      if (!authUser.perfil) {
        if (authUser.role === 'admin' || authUser.role === 'gestor') {
          authUser.perfil = 'GESTOR'
        } else if (authUser.role === 'profissional_saude') {
          authUser.perfil = 'ATENDENTE'
        } else {
          authUser.perfil = 'GESTOR'
        }
      }
      setUser(authUser)
    } else {
      setUser(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    loadUserData()
    return pb.authStore.onChange(() => {
      loadUserData()
    })
  }, [])

  const login = async (email: string, pass: string): Promise<UserPerfil> => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword<User>(email, pass)
      const u = authData.record as User
      let userPerfil: UserPerfil = u.perfil || 'GESTOR'
      if (!u.perfil) {
        if (u.role === 'admin' || u.role === 'gestor') userPerfil = 'GESTOR'
        else if (u.role === 'profissional_saude') userPerfil = 'ATENDENTE'
        else userPerfil = 'GESTOR'
      }
      setUser({ ...u, perfil: userPerfil })
      return userPerfil
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const refreshProfile = async () => {
    if (!pb.authStore.record?.id) return
    try {
      const updated = await pb.collection('users').getOne<User>(pb.authStore.record.id)
      setUser(updated)
    } catch (err) {
      console.warn('Erro ao atualizar perfil do usuário:', err)
    }
  }

  const perfil = user?.perfil || (user?.role === 'admin' ? 'GESTOR' : null)

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }
  return context
}
