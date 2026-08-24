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
import { HeartPulse, Lock, Mail, Shield, AlertCircle, CheckCircle2 } from 'lucide-react'
import { UserPerfil } from '@/types/saude'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      if (user.perfil === 'GESTOR') navigate('/gestor')
      else if (user.perfil === 'RH') navigate('/rh')
      else if (user.perfil === 'ATENDENTE') navigate('/atendente')
      else navigate('/gestor')
    } catch (err: any) {
      setError(err?.message || 'E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const fillQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail)
    setPassword('12345678')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4">
      {/* Container Central */}
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20 mb-2">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">CareTrack Saúde</h1>
          <p className="text-sm text-slate-300">
            Plataforma Integrada de Gestão do Ciclo de Cuidado em Saúde
          </p>
        </div>

        {/* Card Formulário */}
        <Card className="border-slate-700/80 bg-white/95 backdrop-blur shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-slate-900">
              Acesso ao Sistema
            </CardTitle>
            <CardDescription className="text-slate-500">
              Entre com suas credenciais para acessar seu perfil de atendimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  E-mail Corporativo
                </Label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu.email@saude.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Senha de Acesso
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-10 text-sm"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white h-10 font-semibold"
                disabled={loading}
              >
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t bg-slate-50/70 p-4 rounded-b-lg space-y-3">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Perfis de Demonstração:</span>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Senha padrão: 12345678
              </span>
            </div>

            <div className="w-full grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickLogin('gestor@saude.com')}
                className="text-xs h-8 border-purple-200 hover:bg-purple-50 hover:text-purple-700 text-purple-900"
              >
                1. Gestor
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickLogin('rh@saude.com')}
                className="text-xs h-8 border-amber-200 hover:bg-amber-50 hover:text-amber-700 text-amber-900"
              >
                2. RH
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fillQuickLogin('atendente@saude.com')}
                className="text-xs h-8 border-teal-200 hover:bg-teal-50 hover:text-teal-700 text-teal-900"
              >
                3. Atendente
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Security and LGPD Note */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Filtro de Privacidade LGPD ativo por perfil de usuário</span>
        </div>
      </div>
    </div>
  )
}
