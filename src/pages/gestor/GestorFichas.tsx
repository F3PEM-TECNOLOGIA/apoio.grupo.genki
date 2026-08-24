import React, { useEffect, useState } from 'react'
import { FichasService } from '@/services/saude'
import { FichaAtendimento } from '@/types/saude'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RiscoBadge, StatusGeralBadge } from '@/components/common/Badges'
import { Search, Star, MessageSquare, History, Phone, Mail, MessageCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function GestorFichasCrud() {
  const [fichas, setFichas] = useState<FichaAtendimento[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedFicha, setSelectedFicha] = useState<FichaAtendimento | null>(null)
  const [historicoList, setHistoricoList] = useState<any[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await FichasService.list('', '-created')
      setFichas(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenHistorico = async (ficha: FichaAtendimento) => {
    setSelectedFicha(ficha)
    try {
      const h = await FichasService.getHistorico(ficha.id)
      setHistoricoList(h)
    } catch (e) {
      setHistoricoList([])
    }
    setHistoryOpen(true)
  }

  const getContactIcon = (meio: string) => {
    if (meio === 'WHATSAPP') return <MessageCircle className="w-4 h-4 text-emerald-600" />
    if (meio === 'LIGACAO_TELEFONICA') return <Phone className="w-4 h-4 text-blue-600" />
    if (meio === 'EMAIL') return <Mail className="w-4 h-4 text-indigo-600" />
    return <MessageSquare className="w-4 h-4 text-slate-500" />
  }

  const filtered = fichas.filter(
    (f) =>
      (f.ficha_id || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.expand?.beneficiario_id?.nome_beneficiario || '')
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (f.expand?.atendente_id?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.condicao_principal || '').toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fichas de Atendimento & Evolução Clínica
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Auditoria clínica de todos os atendimentos, histórico de versões e pesquisas de
            satisfação
          </p>
        </div>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Pesquisar por Ficha ID, beneficiário ou atendente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="p-3.5">Ficha ID</th>
                  <th className="p-3.5">Beneficiário</th>
                  <th className="p-3.5">Atendente / Responsável</th>
                  <th className="p-3.5">Meio</th>
                  <th className="p-3.5">Condição / Risco</th>
                  <th className="p-3.5">Status Geral</th>
                  <th className="p-3.5">Versão</th>
                  <th className="p-3.5">Pesquisa / Feedback</th>
                  <th className="p-3.5 text-right">Auditoria</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-xs font-semibold text-slate-700">
                      {f.ficha_id}
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-900">
                        {f.expand?.beneficiario_id?.nome_beneficiario || 'Beneficiário'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {f.expand?.beneficiario_id?.matricula || ''}
                      </div>
                    </td>
                    <td className="p-3.5 text-xs text-slate-700">
                      {f.expand?.atendente_id?.name || f.responsavel}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-700">
                        {getContactIcon(f.meio_contato)}
                        <span>{f.meio_contato.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-xs font-medium text-slate-800 max-w-xs truncate">
                        {f.condicao_principal}
                      </div>
                      <div className="mt-1">
                        <RiscoBadge risco={f.risco} />
                      </div>
                    </td>
                    <td className="p-3.5">
                      <StatusGeralBadge status={f.status_geral} />
                    </td>
                    <td className="p-3.5 font-mono text-xs font-bold text-slate-600">
                      v{f.versao || 1}
                    </td>
                    <td className="p-3.5">
                      {f.feedback && f.feedback > 0 ? (
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200 w-fit">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{f.feedback} / 5</span>
                        </div>
                      ) : f.data_envio_pesquisa ? (
                        <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Pesquisa Enviada
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenHistorico(f)}
                        className="text-xs h-7 gap-1"
                      >
                        <History className="w-3.5 h-3.5" />
                        Histórico
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Histórico e Auditoria */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Versões & Auditoria Clínica</DialogTitle>
            <DialogDescription className="text-xs">
              {selectedFicha?.ficha_id} • Beneficiário:{' '}
              {selectedFicha?.expand?.beneficiario_id?.nome_beneficiario}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-3 rounded-lg border text-xs space-y-1">
              <div className="font-semibold text-slate-800">
                Detalhes Atuais (v{selectedFicha?.versao})
              </div>
              <p className="text-slate-600">
                <strong>Descrição:</strong> {selectedFicha?.descricao_atendimento}
              </p>
              <p className="text-slate-600">
                <strong>Meta / Plano:</strong> {selectedFicha?.meta || 'Não informada'}
              </p>
              <p className="text-slate-600">
                <strong>Pendências:</strong> {selectedFicha?.pendencias || 'Nenhuma'}
              </p>
            </div>

            <div className="border-t pt-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Trilha de Modificações (historico_fichas)
              </h4>

              {historicoList.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">
                  Nenhuma alteração anterior registrada para esta ficha (versão inicial).
                </p>
              ) : (
                <div className="space-y-2">
                  {historicoList.map((h, i) => (
                    <div key={i} className="p-3 bg-white border rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500 text-[11px]">
                        <span>{new Date(h.created).toLocaleString('pt-BR')}</span>
                        <span className="font-semibold text-slate-700">
                          {h.expand?.alterado_por?.name || 'Profissional'}
                        </span>
                      </div>
                      <p className="font-medium text-teal-800">{h.campo_alterado}</p>
                      <div className="grid grid-cols-2 gap-2 text-slate-600 bg-slate-50 p-2 rounded">
                        <div>
                          <strong>Antes:</strong> {h.valor_anterior}
                        </div>
                        <div>
                          <strong>Depois:</strong> {h.valor_novo}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
