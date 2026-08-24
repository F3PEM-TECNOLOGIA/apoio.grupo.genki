import React, { useEffect, useState } from 'react'
import { UsuariosService, FichasService, PesquisasService } from '@/services/saude'
import { User, FichaAtendimento, PesquisaSatisfacao } from '@/types/saude'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, BarChart3, Star, CheckCircle, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function GestorComparativoPage() {
  const [atendentes, setAtendentes] = useState<User[]>([])
  const [fichas, setFichas] = useState<FichaAtendimento[]>([])
  const [pesquisas, setPesquisas] = useState<PesquisaSatisfacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [aRes, fRes, pRes] = await Promise.all([
          UsuariosService.listAtendentes(),
          FichasService.list(),
          PesquisasService.listAll(),
        ])
        setAtendentes(aRes)
        setFichas(fRes)
        setPesquisas(pRes)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Processar dados comparativos por atendente
  const comparativoData = atendentes.map((atendente) => {
    const atendenteFichas = fichas.filter(
      (f) =>
        f.atendente_id === atendente.id ||
        f.responsavel?.toLowerCase().includes(atendente.name.toLowerCase()),
    )
    const total = atendenteFichas.length
    const altas = atendenteFichas.filter((f) => f.status_geral === 'ALTA').length
    const emAcompanhamento = atendenteFichas.filter(
      (f) => f.status_geral === 'EM_ACOMPANHAMENTO',
    ).length
    const aguardando = atendenteFichas.filter((f) => f.status_geral === 'AGUARDANDO_RETORNO').length

    // Satisfação
    const atendentePesquisas = pesquisas.filter(
      (p) =>
        p.expand?.ficha_id?.atendente_id === atendente.id ||
        p.expand?.ficha_id?.responsavel?.toLowerCase().includes(atendente.name.toLowerCase()),
    )
    const respondidas = atendentePesquisas.filter((p) => p.status === 'RESPONDIDO' && p.nota > 0)
    const mediaNps = respondidas.length
      ? Number((respondidas.reduce((a, c) => a + c.nota, 0) / respondidas.length).toFixed(1))
      : 5.0

    return {
      id: atendente.id,
      nome: atendente.name,
      profissao: atendente.tipo_profissional || 'Enfermeiro',
      registro: atendente.registro_profissional || '—',
      unidade: atendente.unidade_regiao || 'SP',
      totalAtendimentos: total,
      altasConcluidas: altas,
      emAcompanhamento,
      aguardando,
      taxaResolutividade: total > 0 ? Number(((altas / total) * 100).toFixed(0)) : 0,
      mediaSatisfacao: mediaNps,
      totalPesquisas: respondidas.length,
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard Comparativo de Produtividade & Satisfação
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Comparação entre profissionais de saúde: volumetria de contatos, altas clínicas e NPS de
          pacientes
        </p>
      </div>

      {/* Gráficos Comparativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volumetria de Atendimentos */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">
              Volume de Casos & Altas Clínicas por Atendente
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativo de casos em acompanhamento vs altas concedidas
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" fontSize={12} stroke="#888888" />
                <YAxis fontSize={12} stroke="#888888" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="totalAtendimentos"
                  name="Total Fichas"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="altasConcluidas"
                  name="Altas (Concluídos)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfação Média (NPS) */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-800">
              Média de Satisfação dos Beneficiários (0-5 Estrelas)
            </CardTitle>
            <CardDescription className="text-xs">
              Avaliações recolhidas nas pesquisas automatizadas pós-alta
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparativoData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="nome" fontSize={12} stroke="#888888" />
                <YAxis domain={[0, 5]} fontSize={12} stroke="#888888" />
                <Tooltip />
                <Bar
                  dataKey="mediaSatisfacao"
                  name="Média NPS"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Detalhes dos Atendentes */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-800">
            Tabela de Desempenho Clínico por Operador
          </CardTitle>
          <CardDescription className="text-xs">
            Resumo consolidado para suporte em auditoria e dimensionamento de escalas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="p-3.5">Profissional</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Registro</th>
                  <th className="p-3.5">Região</th>
                  <th className="p-3.5">Total Fichas</th>
                  <th className="p-3.5">Em Acompanhamento</th>
                  <th className="p-3.5">Altas Concluídas</th>
                  <th className="p-3.5">Resolutividade</th>
                  <th className="p-3.5">Média NPS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparativoData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-medium text-slate-900">{item.nome}</td>
                    <td className="p-3.5 text-xs text-slate-600">{item.profissao}</td>
                    <td className="p-3.5 font-mono text-xs text-slate-600">{item.registro}</td>
                    <td className="p-3.5 text-xs text-slate-600">{item.unidade}</td>
                    <td className="p-3.5 font-bold text-slate-800">{item.totalAtendimentos}</td>
                    <td className="p-3.5 text-blue-700 font-semibold">{item.emAcompanhamento}</td>
                    <td className="p-3.5 text-emerald-700 font-semibold">{item.altasConcluidas}</td>
                    <td className="p-3.5">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded font-mono font-medium">
                        {item.taxaResolutividade}%
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 w-fit">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{item.mediaSatisfacao} / 5</span>
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
