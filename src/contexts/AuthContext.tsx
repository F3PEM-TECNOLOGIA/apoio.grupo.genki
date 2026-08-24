import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { User, UserPerfil } from '@/types/saude'

interface AuthContextType {
  user: User | null
  token: string | null
  perfil: UserPerfil | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
  switchMockProfile?: (perfil: UserPerfil) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(pb.authStore.token)
  const [isLoading, setIsLoading] = useState(true)

  const mapModelToUser = (model: any): User => {
    return {
      id: model.id,
      name: model.name || model.email || 'Usuário',
      email: model.email,
      perfil: (model.perfil || (model.role === 'admin' ? 'GESTOR' : 'GESTOR')) as UserPerfil,
      registro_profissional: model.registro_profissional,
      tipo_profissional: model.tipo_profissional,
      unidade_regiao: model.unidade_regiao,
      ativo: model.ativo ?? true,
      created: model.created,
      updated: model.updated,
    }
  }

  const refreshUser = async () => {
    try {
      if (pb.authStore.isValid && pb.authStore.model) {
        // Refresh token if possible or fetch fresh user record
        const fresh = await pb.collection('users').getOne(pb.authStore.model.id)
        const mapped = mapModelToUser(fresh)
        setUser(mapped)
        setToken(pb.authStore.token)
      } else {
        setUser(null)
        setToken(null)
      }
    } catch {
      setUser(null)
      setToken(null)
      pb.authStore.clear()
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const unsub = pb.authStore.onChange(() => {
      setToken(pb.authStore.token)
      if (pb.authStore.model) {
        setUser(mapModelToUser(pb.authStore.model))
      } else {
        setUser(null)
      }
    })

    refreshUser()

    return () => {
      unsub()
    }
  }, [])

  const login = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true)
    try {
      const authData = await pb.collection('users').authWithPassword(email.trim(), pass)
      const mapped = mapModelToUser(authData.record)
      setUser(mapped)
      setToken(authData.token)
      return mapped
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
    setToken(null)
  }

  // Quick helper to switch during testing / demo between the seed accounts
  const switchMockProfile = async (targetPerfil: UserPerfil) => {
    const map = {
      GESTOR: 'gestor@saude.com',
      RH: 'rh@saude.com',
      ATENDENTE: 'atendente@saude.com',
    }
    const email = map[targetPerfil]
    await login(email, '12345678')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        perfil: user?.perfil || null,
        isLoading,
        login,
        logout,
        refreshUser,
        switchMockProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
