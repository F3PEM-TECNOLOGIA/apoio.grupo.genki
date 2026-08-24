import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getBeneficiarios, getFichas, getPesquisas, getLotes } from '@/services/healthService'
import {
  Users,
  HeartPulse,
  Award,
  Star,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Clock,
  Sparkles,
  Activity,
  Calendar,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RiskBadge } from '@/components/common/RiskBadge'
import { StepTracker } from '@/components/common/StepTracker'
import { LgpdNotice } from '@/components/common/LgpdNotice'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import type { Beneficiario, FichaAtendimento, PesquisaSatisfacao, LoteSelecao } from '@/types'

const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

export default function GestorDashboard() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [fichas, setFichas] = useState<FichaAtendimento[]>([])
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([])
  const [lotes, setLotes] = useState<LoteSelecao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [bList, fList, pList, lList] = await Promise.all([
          getBeneficiarios(),
          getFichas(),
          getPesquisas(),
          getLotes(),
        ])
        setBeneficiarios(bList)
        setFichas(fList)
        setPesquisas(pList)
        setLotes(lList)
      } catch (err) {
        console.error('Erro ao carregar dashboard gestor:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Métricas
  const totalBeneficiarios = beneficiarios.length
  const emAtendimento = beneficiarios.filter((b) => b.status === 'EM_ATENDIMENTO').length
  const altas = fichas.filter((f) => f.status_geral === 'ALTA').length
  const custoTotal = beneficiarios.reduce((acc, b) => acc + (b.custo_12_meses || 0), 0)

  const pesquisasRespondidas = pesquisas.filter(
    (p) => p.status === 'RESPONDIDO' && p.nota !== undefined,
  )
  const mediaSatisfacao =
    pesquisasRespondidas.length > 0
      ? (
          pesquisasRespondidas.reduce((acc, p) => acc + (p.nota || 0), 0) /
          pesquisasRespondidas.length
        ).toFixed(1)
      : '5.0'

  // Dados Gráfico Risco (PieChart)
  const contagemRisco = {
    BAIXO: beneficiarios.filter((b) => b.risco === 'BAIXO').length,
    MEDIO: beneficiarios.filter((b) => b.risco === 'MEDIO').length,
    ALTO: beneficiarios.filter((b) => b.risco === 'ALTO').length,
    CRITICO: beneficiarios.filter((b) => b.risco === 'CRITICO').length,
  }
  const dadosPizzaRisco = [
    { name: 'Baixo Risco', value: contagemRisco.BAIXO, color: '#10b981' },
    { name: 'Médio Risco', value: contagemRisco.MEDIO, color: '#f59e0b' },
    { name: 'Alto Risco', value: contagemRisco.ALTO, color: '#f97316' },
    { name: 'Crítico', value: contagemRisco.CRITICO, color: '#ef4444' },
  ].filter((d) => d.value > 0)

  // Dados Gráfico Atendimentos/Mês
  const dadosAtendimentosMes = [
    { mes: 'Nov/24', atendimentos: 12, altas: 4 },
    { mes: 'Dez/24', atendimentos: 18, altas: 7 },
    { mes: 'Jan/25', atendimentos: 24, altas: 11 },
    { mes: 'Fev/25', atendimentos: 31, altas: 15 },
    { mes: 'Mar/25', atendimentos: fichas.length + 8, altas: altas + 2 },
  ]

  // Dados Gráfico Custo vs Economia Estimada
  const dadosCusto = [
    { mes: 'Nov/24', custo: 58000, reducao: 4200 },
    { mes: 'Dez/24', custo: 62000, reducao: 7800 },
    { mes: 'Jan/25', custo: 54000, reducao: 12400 },
    { mes: 'Fev/25', custo: 48000, reducao: 16800 },
    { mes: 'Mar/25', custo: 41200, reducao: 21500 },
  ]

  const ultimasFichas = fichas.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" /> Painel Executivo do Gestor de Saúde
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão consolidada do ciclo de cuidado, estratificação de riscos e volumetria
            assistencial
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/importar">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Importar Planilha BI
            </Button>
          </Link>
          <Link to="/elegiveis">
            <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5">
              Selecionar Elegíveis &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* Tracker de 9 Etapas */}
      <StepTracker currentStep={9} />

      {/* Aviso de conformidade LGPD */}
      <LgpdNotice perfil="GESTOR" />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Total Beneficiários
              </span>
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground">{totalBeneficiarios}</span>
              <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">
                +100% ativos
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">2 lotes processados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Em Atendimento</span>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                <HeartPulse className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-blue-600">{emAtendimento}</span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                Cuidado ativo
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Distribuídos para equipe</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Altas / Concluídos
              </span>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{altas}</span>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                Meta atingida
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Pacientes estabilizados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Satisfação (NPS)</span>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                <Star className="w-4 h-4 fill-amber-500" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{mediaSatisfacao} ★</span>
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                {pesquisasRespondidas.length} respostas
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Avaliação média pós-alta</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-muted/30 border-border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Custo 12 Meses</span>
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-xl font-black text-foreground">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                }).format(custoTotal)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Total segurados mapeados</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Atendimentos e Altas */}
        <Card className="lg:col-span-2 border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Evolução Mensal de Atendimentos & Altas</span>
              <Badge variant="outline" className="text-[10px]">
                Últimos 5 meses
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Volumetria de intervenções clínicas realizadas pelos atendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosAtendimentosMes}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar
                  dataKey="atendimentos"
                  name="Atendimentos Realizados"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
                <Bar dataKey="altas" name="Altas Clínicas" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico 2: Pizza de Risco */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span>Estratificação de Risco</span>
              <ShieldAlert className="w-4 h-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuição da base de segurados por severidade
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizzaRisco}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {dadosPizzaRisco.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico 3: Custo vs Redução Assistencial */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Curva de Custo Sinistral vs Economia com Atenção Primária (R$)</span>
            <Badge className="bg-teal-600 text-[10px]">Impacto Econômico</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Monitoramento do ROI das intervenções preventivas sobre custos assistenciais crônicos
          </CardDescription>
        </CardHeader>
        <CardContent className="h-56 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosCusto} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <RechartsTooltip
                formatter={(value: unknown) => [
                  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    Number(value) || 0,
                  ),
                  '',
                ]}
                contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Line
                type="monotone"
                dataKey="custo"
                name="Sinistralidade Histórica"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="reducao"
                name="Economia Gerada (Evitação de Internação)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela: Últimos Atendimentos Registrados */}
      <Card className="border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-sm font-bold">Últimos Atendimentos Realizados</CardTitle>
            <CardDescription className="text-xs">
              Fichas clínicas e evoluções mais recentes no sistema
            </CardDescription>
          </div>
          <Link to="/fichas">
            <Button variant="ghost" size="sm" className="text-xs text-primary font-bold">
              Ver todas as fichas &rarr;
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 text-muted-foreground border-y border-border">
                <tr>
                  <th className="p-3 font-semibold">Ficha ID</th>
                  <th className="p-3 font-semibold">Beneficiário</th>
                  <th className="p-3 font-semibold">Condição Principal</th>
                  <th className="p-3 font-semibold">Risco</th>
                  <th className="p-3 font-semibold">Meio</th>
                  <th className="p-3 font-semibold">Status Geral</th>
                  <th className="p-3 font-semibold">Atendente</th>
                  <th className="p-3 font-semibold text-right">Data Contato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ultimasFichas.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-teal-800 dark:text-teal-300">
                      {f.ficha_id}
                    </td>
                    <td className="p-3 font-medium text-foreground">
                      {f.expand?.beneficiario_id?.nome_beneficiario || 'Beneficiário'}
                    </td>
                    <td className="p-3 text-muted-foreground truncate max-w-[180px]">
                      {f.condicao_principal}
                    </td>
                    <td className="p-3">
                      <RiskBadge level={f.risco} size="sm" />
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {f.meio_contato}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={`text-[10px] ${
                          f.status_geral === 'ALTA'
                            ? 'bg-emerald-600'
                            : f.status_geral === 'EM_ACOMPANHAMENTO'
                              ? 'bg-blue-600'
                              : 'bg-amber-600'
                        }`}
                      >
                        {f.status_geral}
                      </Badge>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {f.expand?.atendente_id?.name || f.responsavel}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {new Date(f.data_contato).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
