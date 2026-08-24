import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { LgpdBadge } from '@/components/common/Badges'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  HeartPulse,
  LayoutDashboard,
  Upload,
  CheckSquare,
  Users,
  UserCheck,
  FileText,
  Target,
  Activity,
  BarChart3,
  FileSpreadsheet,
  Share2,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Stethoscope,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react'
import { UserPerfil } from '@/types/saude'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, perfil, logout, switchMockProfile } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const gestorNav: NavItem[] = [
    { label: 'Visão Geral', href: '/gestor', icon: LayoutDashboard },
    { label: 'Importar Lote', href: '/gestor/importar', icon: Upload },
    { label: 'Selecionar Beneficiários', href: '/gestor/selecionar', icon: CheckSquare },
    { label: 'Gestão de Beneficiários', href: '/gestor/beneficiarios', icon: Users },
    { label: 'Gestão de Usuários', href: '/gestor/usuarios', icon: UserCheck },
    { label: 'Fichas de Atendimento', href: '/gestor/fichas', icon: FileText },
    { label: 'Planos de Ação', href: '/gestor/planos-acao', icon: Target },
    { label: 'Controle de Programas', href: '/gestor/programas', icon: Activity },
    { label: 'Dashboard Comparativo', href: '/gestor/comparativo', icon: BarChart3 },
    { label: 'Relatórios & Auditoria', href: '/gestor/relatorios', icon: FileSpreadsheet },
  ]

  const rhNav: NavItem[] = [
    { label: 'Dashboard RH', href: '/rh', icon: LayoutDashboard },
    { label: 'Distribuir Selecionados', href: '/rh/distribuir', icon: Share2 },
  ]

  const atendenteNav: NavItem[] = [
    { label: 'Meu Painel', href: '/atendente', icon: LayoutDashboard },
    { label: 'Minhas Fichas de Cuidado', href: '/atendente/fichas', icon: FileText },
  ]

  let navItems: NavItem[] = []
  if (perfil === 'GESTOR') navItems = gestorNav
  else if (perfil === 'RH') navItems = rhNav
  else if (perfil === 'ATENDENTE') navItems = atendenteNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-800 text-sm tracking-tight">CareTrack Saúde</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-200 md:static md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-0 hidden md:flex'
        }`}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-md">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-base text-white tracking-wide leading-none">CareTrack</h1>
            <span className="text-[11px] text-teal-400 font-medium">Ciclo de Acompanhamento</span>
          </div>
        </div>

        {/* Current user badge */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Perfil Ativo
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                perfil === 'GESTOR'
                  ? 'bg-purple-950 text-purple-300 border border-purple-800'
                  : perfil === 'RH'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-teal-950 text-teal-300 border border-teal-800'
              }`}
            >
              {perfil}
            </span>
          </div>
          <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          {user?.registro_profissional && (
            <p className="text-[11px] text-slate-400 mt-0.5">{user.registro_profissional}</p>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Operacional
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Fast profile switcher (for effortless evaluation and testing of RBAC) */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-teal-400" /> Alternar Perfil Demo
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {(['GESTOR', 'RH', 'ATENDENTE'] as UserPerfil[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={async () => {
                  if (switchMockProfile) {
                    await switchMockProfile(p)
                    if (p === 'GESTOR') navigate('/gestor')
                    if (p === 'RH') navigate('/rh')
                    if (p === 'ATENDENTE') navigate('/atendente')
                  }
                }}
                className={`text-[11px] py-1.5 rounded text-center font-medium transition ${
                  perfil === p
                    ? 'bg-teal-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>LGPD Compliance</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 h-8 px-2"
          >
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">{perfil && <LgpdBadge perfil={perfil} />}</div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
              <span className="text-xs text-slate-500">
                {user?.unidade_regiao || 'Unidade Principal'} • {user?.perfil}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-medium">{user?.perfil}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="font-semibold text-sm">{user?.name}</p>
                  <p className="text-xs text-slate-500 font-normal">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    navigate(
                      perfil === 'GESTOR' ? '/gestor' : perfil === 'RH' ? '/rh' : '/atendente',
                    )
                  }
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Painel Principal
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-600 focus:text-rose-600"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Encerrar Sessão
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
