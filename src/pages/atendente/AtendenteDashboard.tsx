import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { FichasService, BeneficiariosService, PesquisasService } from '@/services/saude'
import { FichaAtendimento, Beneficiario, PesquisaSatisfacao } from '@/types/saude'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RiscoBadge, StatusGeralBadge } from '@/components/common/Badges'
import {
  FileText,
  Users,
  Clock,
  Star,
  Plus,
  ArrowRight,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  ShieldCheck,
  Calendar,
} from 'lucide-react'

export default function AtendenteDashboard() {
  const { user } = useAuth()
  const [fichas, setFichas] = useState<FichaAtendimento[]>([])
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      if (!user) return
      try {
        const [fRes, bRes, pRes] = await Promise.all([
          FichasService.list(),
          BeneficiariosService.list({ perPage: 1200, perfil: 'OPERACAO' }),
          PesquisasService.listAll(),
        ])

        // Filtrar apenas do atendente logado
        const myFichas = fRes.filter(
          (f) =>
            f.atendente_id === user.id ||
            f.responsavel?.toLowerCase().includes(user.name.toLowerCase()),
        )
        const myBeneficiarios = bRes.items.filter((b) => b.atendente_id === user.id)
        const myPesquisas = pRes.filter(
          (p) =>
            p.expand?.ficha_id?.atendente_id === user.id ||
            p.expand?.ficha_id?.responsavel?.toLowerCase().includes(user.name.toLowerCase()),
        )

        setFichas(myFichas)
        setBeneficiarios(myBeneficiarios)
        setPesquisas(myPesquisas)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user])

  const atendimentosHoje = fichas.filter((f) => {
    if (!f.data_contato) return false
    const d = new Date(f.data_contato)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  }).length

  const emAcompanhamento = fichas.filter((f) => f.status_geral === 'EM_ACOMPANHAMENTO').length
  const altas = fichas.filter((f) => f.status_geral === 'ALTA').length
  const aguardando = fichas.filter((f) => f.status_geral === 'AGUARDANDO_RETORNO').length

  const avaliadas = pesquisas.filter((p) => p.status === 'RESPONDIDO' && p.nota > 0)
  const mediaNps = avaliadas.length
    ? (avaliadas.reduce((a, c) => a + c.nota, 0) / avaliadas.length).toFixed(1)
    : '5.0'

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Painel do Atendente de Saúde
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Olá, <strong>{user?.name}</strong> ({user?.registro_profissional || 'Profissional'}).
            Gerencie seus atendimentos clínicos.
          </p>
        </div>
        <Link to="/atendente/fichas/nova">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold gap-2">
            <Plus className="w-4 h-4" /> Novo Atendimento Clínico
          </Button>
        </Link>
      </div>

      {/* LGPD Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
        <div className="text-xs text-blue-900">
          <strong>Filtro LGPD Clínico Ativo:</strong> Você possui acesso irrestrito aos dados de
          contato, condição clínica e risco do beneficiário para conduzir o cuidado. Valores
          financeiros e sinistralidade continuam ocultos conforme as diretrizes institucionais.
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Minha Carteira Ativa
            </CardTitle>
            <Users className="w-5 h-5 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{beneficiarios.length}</div>
            <p className="text-xs text-slate-500 mt-1">Beneficiários sob seus cuidados</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Em Acompanhamento
            </CardTitle>
            <Clock className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{emAcompanhamento}</div>
            <p className="text-xs text-slate-500 mt-1">Fichas ativas com retorno previsto</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Altas Realizadas
            </CardTitle>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{altas}</div>
            <p className="text-xs text-slate-500 mt-1">Casos concluídos com sucesso</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Satisfação dos Pacientes
            </CardTitle>
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900 flex items-center gap-1">
              <span>{mediaNps}</span>
              <span className="text-sm font-normal text-slate-500">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Baseado em {avaliadas.length} avaliações</p>
          </CardContent>
        </Card>
      </div>

      {/* Minhas Fichas Recentes */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Minhas Fichas de Atendimento & Evolução
            </CardTitle>
            <CardDescription className="text-xs">
              Últimos registros e prontuários sob sua gestão clínica
            </CardDescription>
          </div>
          <Link to="/atendente/fichas">
            <Button variant="ghost" size="sm" className="text-xs text-teal-700 gap-1">
              Ver Todas as Fichas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="p-3.5">Ficha</th>
                  <th className="p-3.5">Beneficiário</th>
                  <th className="p-3.5">Condição / Diagnóstico</th>
                  <th className="p-3.5">Risco</th>
                  <th className="p-3.5">Status Contato</th>
                  <th className="p-3.5">Status Geral</th>
                  <th className="p-3.5">Próx. Contato</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {fichas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500 text-xs">
                      Nenhuma ficha registrada no momento. Clique em "Novo Atendimento Clínico" para
                      iniciar.
                    </td>
                  </tr>
                ) : (
                  fichas.slice(0, 6).map((f) => (
                    <tr key={f.id} className="hover:bg-slate-50 text-xs">
                      <td className="p-3.5 font-mono font-medium">{f.ficha_id}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-900">
                          {f.expand?.beneficiario_id?.nome ||
                            f.expand?.beneficiario_id?.nome_beneficiario ||
                            'Paciente'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {f.expand?.beneficiario_id?.matricula}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium max-w-xs truncate">
                        {f.condicao_principal}
                      </td>
                      <td className="p-3.5">
                        <RiscoBadge risco={f.risco} />
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                          {f.status_contato}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <StatusGeralBadge status={f.status_geral} />
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {f.data_proximo_contato
                          ? new Date(f.data_proximo_contato).toLocaleDateString('pt-BR')
                          : '—'}
                      </td>
                      <td className="p-3.5 text-right">
                        <Link to={`/atendente/fichas/${f.id}`}>
                          <Button size="sm" variant="outline" className="text-xs h-7">
                            Abrir Ficha
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
