import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPesquisas } from '@/services/healthService'
import {
  Star,
  MessageSquare,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LgpdNotice } from '@/components/common/LgpdNotice'
import { StepTracker } from '@/components/common/StepTracker'
import { toast } from 'sonner'
import type { PesquisaSatisfacao } from '@/types'

export default function PesquisasGestao() {
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState('TODOS')

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getPesquisas()
      setPesquisas(data)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar pesquisas de satisfação.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const respondidas = pesquisas.filter((p) => p.status === 'RESPONDIDO' && p.nota !== undefined)
  const mediaNotas =
    respondidas.length > 0
      ? (respondidas.reduce((acc, p) => acc + (p.nota || 0), 0) / respondidas.length).toFixed(1)
      : '5.0'

  const contagemNotas = {
    5: respondidas.filter((p) => p.nota === 5).length,
    4: respondidas.filter((p) => p.nota === 4).length,
    3: respondidas.filter((p) => p.nota === 3).length,
    2: respondidas.filter((p) => p.nota === 2).length,
    1: respondidas.filter((p) => p.nota === 1).length,
  }

  const filtered = pesquisas.filter((p) => filtroStatus === 'TODOS' || p.status === filtroStatus)

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/pesquisa/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Link público copiado para a área de transferência!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" /> Etapa 8: Gestão de Pesquisas
            de Satisfação
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monitoramento das avaliações públicas (0-5 estrelas) enviadas automaticamente aos
            beneficiários após a alta
          </p>
        </div>
      </div>

      <StepTracker currentStep={8} />
      <LgpdNotice perfil="GESTOR" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Média Geral de Satisfação
              </span>
              <div className="text-2xl font-black text-amber-500 flex items-center gap-1.5 mt-1">
                <span>{mediaNotas}</span>
                <Star className="w-5 h-5 fill-amber-500" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {respondidas.length} respostas coletadas
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Star className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Pesquisas Enviadas (Simulação)
              </span>
              <div className="text-2xl font-black text-foreground mt-1">{pesquisas.length}</div>
              <p className="text-[10px] text-teal-600 font-semibold mt-0.5">
                Disparadas via WhatsApp & E-mail
              </p>
            </div>
            <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-primary">
              <Send className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Taxa de Resposta</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {pesquisas.length > 0
                  ? Math.round((respondidas.length / pesquisas.length) * 100)
                  : 0}
                %
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Engajamento pós-atendimento
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Pesquisas */}
      <Card className="border-border shadow-sm">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between border-b border-border">
          <div>
            <CardTitle className="text-sm font-bold">Disparos e Respostas Registradas</CardTitle>
            <CardDescription className="text-xs">
              Links com tokens seguros gerados automaticamente pelo sistema
            </CardDescription>
          </div>
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="RESPONDIDO">Apenas Respondidos</option>
            <option value="ENVIADO">Apenas Pendentes</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border">
                <tr>
                  <th className="p-3 font-semibold">Token / Link</th>
                  <th className="p-3 font-semibold">Canal</th>
                  <th className="p-3 font-semibold">Nota</th>
                  <th className="p-3 font-semibold">Feedback / Depoimento</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-right">Data de Envio</th>
                  <th className="p-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-bold text-teal-800 dark:text-teal-300 block max-w-[140px] truncate">
                        {p.token}
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">
                        {p.canal}
                      </Badge>
                    </td>
                    <td className="p-3">
                      {p.nota !== undefined && p.nota !== null ? (
                        <div className="flex items-center gap-1 font-bold text-amber-500">
                          <span>{p.nota}</span>
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic">Pendente</span>
                      )}
                    </td>
                    <td className="p-3 max-w-xs truncate text-muted-foreground">
                      {p.comentario || '—'}
                    </td>
                    <td className="p-3">
                      <Badge
                        className={`text-[10px] ${p.status === 'RESPONDIDO' ? 'bg-emerald-600' : 'bg-amber-600'}`}
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right text-muted-foreground">
                      {new Date(p.data_envio).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyLink(p.token)}
                          className="h-7 px-2 text-[11px] font-semibold text-primary"
                        >
                          Copiar Link
                        </Button>
                        <Link to={`/pesquisa/${p.token}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
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
