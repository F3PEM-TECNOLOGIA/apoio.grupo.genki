import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { HeartPulse, Lock, Mail, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const user = await login(email, password)
      if (user.perfil === 'GESTOR_VENART') navigate('/gestor')
      else if (user.perfil === 'GESTOR_PROGRAMA') navigate('/gestor')
      else if (user.perfil === 'GESTOR_RH') navigate('/rh')
      else if (user.perfil === 'OPERACAO') navigate('/atendente')
      else navigate('/gestor')
    } catch (err: any) {
      setError(err?.message || 'E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4">
      {/* Container Central */}
      <div className="w-full max-w-md space-y-5">
        {/* Brand header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20 mb-1">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Apoio Grupo Genki</h1>
          <p className="text-sm text-slate-300">Plataforma Apoio Saúde</p>
        </div>

        {/* Card Formulário */}
        <Card className="border-slate-700/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-1 pb-3">
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-white">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Entre com suas credenciais para acessar seu perfil de governança ou operação
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <form onSubmit={handleLogin} className="space-y-3.5">
              {error && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  E-mail Corporativo
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@venart.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Senha de Acesso
                </Label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-9 text-xs"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-hidden"
                    title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-9 font-semibold text-xs"
                disabled={loading}
              >
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security and LGPD Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>LGPD Dinâmica ativa conforme coleção config_lgpd_campos</span>
        </div>
      </div>
    </div>
  )
}
