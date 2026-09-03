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
import {
  HeartPulse,
  Lock,
  Mail,
  Shield,
  AlertCircle,
  UserCheck,
  Building,
  User,
  Sun,
  Moon,
} from 'lucide-react'

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

  const fillQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail)
    setPassword('12345678')
    setError(null)
  }

  const demoAccounts = [
    {
      name: 'Mateus Martins',
      email: 'mateus.martins@venart.com.br',
      perfil: 'GESTOR_VENART',
      tema: 'LIGHT',
      badgeColor:
        'border-purple-300 bg-purple-50 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    },
    {
      name: 'Larissa Alquati',
      email: 'larissa.alquati@venart.com.br',
      perfil: 'GESTOR_VENART',
      tema: 'DARK',
      badgeColor:
        'border-indigo-300 bg-indigo-50 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      name: 'Dr Toshio Oba',
      email: 'toshio.oba@venart.com.br',
      perfil: 'GESTOR_PROGRAMA',
      tema: 'LIGHT',
      badgeColor:
        'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      name: 'Raul Mazia',
      email: 'raul.mazia@venart.com.br',
      perfil: 'GESTOR_RH',
      tema: 'LIGHT',
      badgeColor:
        'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
    {
      name: 'Ketlin Nazário',
      email: 'ketlin.nazario@venart.com.br',
      perfil: 'OPERACAO',
      tema: 'DARK',
      badgeColor: 'border-teal-300 bg-teal-50 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 flex flex-col justify-center items-center p-4">
      {/* Container Central */}
      <div className="w-full max-w-lg space-y-5">
        {/* Brand header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 text-white shadow-xl shadow-teal-500/20 mb-1">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Meu Concierge de Saúde</h1>
          <p className="text-sm text-slate-300">
            Plataforma Corporativa de Gestão e Concierge Clínico (PRD v0.0.4)
          </p>
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
          <CardContent>
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
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs"
                    required
                  />
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

          <CardFooter className="flex flex-col border-t bg-slate-50/70 dark:bg-slate-950/70 p-3.5 rounded-b-lg space-y-2.5">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                5 Usuários Demo (PRD v0.0.4):
              </span>
              <span className="text-[11px] text-teal-700 bg-teal-50 dark:bg-teal-950 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800">
                Senha padrão: <strong>12345678</strong> (RN-07: sem troca obrigatória)
              </span>
            </div>

            <div className="w-full grid grid-cols-1 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillQuickLogin(acc.email)}
                  className="flex items-center justify-between p-2 rounded border text-left text-xs bg-white dark:bg-slate-800/80 hover:border-teal-500 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200 leading-tight">
                        {acc.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{acc.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${acc.badgeColor}`}
                    >
                      {acc.perfil}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded">
                      {acc.tema === 'DARK' ? (
                        <Moon className="w-2.5 h-2.5" />
                      ) : (
                        <Sun className="w-2.5 h-2.5" />
                      )}
                      {acc.tema}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardFooter>
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
