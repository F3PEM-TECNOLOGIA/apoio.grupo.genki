import React, { useState, useEffect } from 'react'
import { getBeneficiarios, getFichas, getPesquisas } from '@/services/healthService'
import {
  BarChart3,
  TrendingDown,
  Star,
  Award,
  Download,
  FileSpreadsheet,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LgpdNotice } from '@/components/common/LgpdNotice'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { toast } from 'sonner'
import type { Beneficiario, FichaAtendimento, PesquisaSatisfacao } from '@/types'

export default function RelatoriosExecutivos() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([])
  const [fichas, setFichas] = useState<FichaAtendimento[]>([])
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [b, f, p] = await Promise.all([getBeneficiarios(), getFichas(), getPesquisas()])
        setBeneficiarios(b)
        setFichas(f)
        setPesquisas(p)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Dados Satisfação por Canal
  const dadosSatisfacaoBarras = [
    { canal: 'WhatsApp API', notas5: 2, notas4: 0, media: 5.0 },
    { canal: 'E-mail Transacional', notas5: 1, notas4: 1, media: 4.5 },
    { canal: 'SMS Direto', notas5: 0, notas4: 0, media: 0 },
  ]

  // Tabela Cruzada Custo-Benefício por Risco
  const tabelaCruzada = [
    {
      risco: 'CRITICO',
      label: 'Crítico',
      qtd: beneficiarios.filter((b) => b.risco === 'CRITICO').length,
      custoTotal: beneficiarios
        .filter((b) => b.risco === 'CRITICO')
        .reduce((acc, b) => acc + (b.custo_12_meses || 0), 0),
      altas: fichas.filter((f) => f.risco === 'CRITICO' && f.status_geral === 'ALTA').length,
      impactoEconomico: 'R$ 28.500 (Economia de 38%)',
    },
    {
      risco: 'ALTO',
      label: 'Alto Risco',
      qtd: beneficiarios.filter((b) => b.risco === 'ALTO').length,
      custoTotal: beneficiarios
        .filter((b) => b.risco === 'ALTO')
        .reduce((acc, b) => acc + (b.custo_12_meses || 0), 0),
      altas: fichas.filter((f) => f.risco === 'ALTO' && f.status_geral === 'ALTA').length,
      impactoEconomico: 'R$ 19.200 (Economia de 24%)',
    },
    {
      risco: 'MEDIO',
      label: 'Médio Risco',
      qtd: beneficiarios.filter((b) => b.risco === 'MEDIO').length,
      custoTotal: beneficiarios
        .filter((b) => b.risco === 'MEDIO')
        .reduce((acc, b) => acc + (b.custo_12_meses || 0), 0),
      altas: fichas.filter((f) => f.risco === 'MEDIO' && f.status_geral === 'ALTA').length,
      impactoEconomico: 'R$ 8.400 (Economia de 15%)',
    },
    {
      risco: 'BAIXO',
      label: 'Baixo Risco',
      qtd: beneficiarios.filter((b) => b.risco === 'BAIXO').length,
      custoTotal: beneficiarios
        .filter((b) => b.risco === 'BAIXO')
        .reduce((acc, b) => acc + (b.custo_12_meses || 0), 0),
      altas: fichas.filter((f) => f.risco === 'BAIXO' && f.status_geral === 'ALTA').length,
      impactoEconomico: 'Prevenção e Estabilidade',
    },
  ]

  const handleExportRelatorio = () => {
    toast.success('Relatório executivo gerado e exportado em formato consolidado (simulado)!')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Relatórios de Acompanhamento e
            Custo-Benefício
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Análise aprofundada de resultados clínicos, índices de satisfação e ROI sobre a
            sinistralidade do plano
          </p>
        </div>
        <Button
          onClick={handleExportRelatorio}
          className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" /> Exportar Dados (.xlsx)
        </Button>
      </div>

      <LgpdNotice perfil="GESTOR" />

      {/* Relatório 1: Satisfação por Canal */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <span>Relatório de Satisfação por Canal de Envio (NPS)</span>
            <Badge className="bg-amber-500 text-[10px]">Avaliação 0-5</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Comparativo de aderência e notas entre WhatsApp e E-mail
          </CardDescription>
        </CardHeader>
        <CardContent className="h-64 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dadosSatisfacaoBarras}
              margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="canal" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar
                dataKey="media"
                name="Média de Nota (Estrelas)"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Relatório 2: Tabela Cruzada Custo-Benefício */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">
            Matriz de Custo-Benefício por Estrato de Risco
          </CardTitle>
          <CardDescription className="text-xs">
            Cruzamento entre sinistralidade histórica e desfechos clínicos favoráveis (altas
            alcançadas)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted text-muted-foreground border-y border-border">
                <tr>
                  <th className="p-3 font-semibold">Estrato de Risco</th>
                  <th className="p-3 font-semibold text-center">Segurados no Grupo</th>
                  <th className="p-3 font-semibold text-right">Custo Total 12m</th>
                  <th className="p-3 font-semibold text-right">Custo Médio / Vida</th>
                  <th className="p-3 font-semibold text-center">Altas Concluídas</th>
                  <th className="p-3 font-semibold text-right">Economia Projetada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tabelaCruzada.map((item) => (
                  <tr key={item.risco} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-bold text-foreground">{item.label}</td>
                    <td className="p-3 text-center font-semibold">{item.qtd}</td>
                    <td className="p-3 text-right font-mono font-bold text-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.custoTotal)}
                    </td>
                    <td className="p-3 text-right font-mono text-muted-foreground">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(item.qtd > 0 ? item.custoTotal / item.qtd : 0)}
                    </td>
                    <td className="p-3 text-center">
                      <Badge className="bg-emerald-600 text-white text-[10px]">
                        {item.altas} altas
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                      {item.impactoEconomico}
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
