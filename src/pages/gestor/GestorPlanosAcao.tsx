import React, { useEffect, useState } from 'react'
import { PlanosAcaoService } from '@/services/saude'
import { PlanoAcao, PrioridadePlano } from '@/types/saude'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Search, Plus, Edit, Target, Clock } from 'lucide-react'

export default function GestorPlanosAcaoCrud() {
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanoAcao | null>(null)

  const [formData, setFormData] = useState<Partial<PlanoAcao>>({
    necessidade_identificada: '',
    objetivo: '',
    acao_tomada: '',
    prazo_acao_dias: 30,
    prioridade: 'MEDIA',
    ativo: true,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await PlanosAcaoService.list('')
      setPlanos(res)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpenCreate = () => {
    setEditingItem(null)
    setFormData({
      necessidade_identificada: '',
      objetivo: '',
      acao_tomada: '',
      prazo_acao_dias: 30,
      prioridade: 'MEDIA',
      ativo: true,
    })
    setDialogOpen(true)
  }

  const handleOpenEdit = (p: PlanoAcao) => {
    setEditingItem(p)
    setFormData({ ...p })
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await PlanosAcaoService.update(editingItem.id, formData)
      } else {
        await PlanosAcaoService.create(formData)
      }
      setDialogOpen(false)
      loadData()
    } catch (err: any) {
      alert('Erro ao salvar plano de ação: ' + err.message)
    }
  }

  const handleToggleAtivo = async (p: PlanoAcao) => {
    try {
      await PlanosAcaoService.toggleAtivo(p.id, !p.ativo)
      loadData()
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message)
    }
  }

  const getPriorityBadge = (p: PrioridadePlano) => {
    const map = {
      BAIXA: 'bg-slate-100 text-slate-800 border-slate-300',
      MEDIA: 'bg-blue-100 text-blue-800 border-blue-300',
      ALTA: 'bg-orange-100 text-orange-800 border-orange-300',
      URGENTE: 'bg-rose-100 text-rose-800 border-rose-300',
    }
    return (
      <Badge variant="outline" className={map[p] || ''}>
        {p}
      </Badge>
    )
  }

  const filtered = planos.filter(
    (p) =>
      p.necessidade_identificada.toLowerCase().includes(search.toLowerCase()) ||
      p.objetivo.toLowerCase().includes(search.toLowerCase()) ||
      p.acao_tomada.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Catálogo de Planos de Ação Clínica
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Padronize metas, necessidades e intervenções para os atendentes aplicarem nas fichas
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Novo Plano de Ação
        </Button>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <Input
              placeholder="Pesquisar por necessidade ou objetivo..."
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
                  <th className="p-3.5">Necessidade Identificada</th>
                  <th className="p-3.5">Objetivo Clínico</th>
                  <th className="p-3.5">Ação Tomada / Protocolo</th>
                  <th className="p-3.5">Prazo (Dias)</th>
                  <th className="p-3.5">Prioridade</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-medium text-slate-900 max-w-xs">
                      {p.necessidade_identificada}
                    </td>
                    <td className="p-3.5 text-xs text-slate-700 max-w-xs">{p.objetivo}</td>
                    <td className="p-3.5 text-xs text-slate-600 max-w-xs">{p.acao_tomada}</td>
                    <td className="p-3.5 text-xs font-medium text-slate-700">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {p.prazo_acao_dias} dias
                      </span>
                    </td>
                    <td className="p-3.5">{getPriorityBadge(p.prioridade)}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.ativo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(p)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAtivo(p)}
                        className={`text-xs h-8 px-2 ${p.ativo ? 'text-rose-600' : 'text-emerald-600'}`}
                      >
                        {p.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Editar Plano de Ação' : 'Novo Plano de Ação'}</DialogTitle>
            <DialogDescription className="text-xs">
              Configure as diretrizes clínicas e prazos de acompanhamento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Necessidade Identificada</Label>
              <Input
                value={formData.necessidade_identificada || ''}
                onChange={(e) =>
                  setFormData({ ...formData, necessidade_identificada: e.target.value })
                }
                placeholder="Ex: Não adesão ao tratamento medicamentoso"
                required
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Objetivo Clínico</Label>
              <Input
                value={formData.objetivo || ''}
                onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                placeholder="Ex: Conscientizar sobre os horários e evitar complicações vasculares"
                required
                className="text-xs mt-1"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Ação Tomada / Protocolo de Cuidado</Label>
              <Textarea
                value={formData.acao_tomada || ''}
                onChange={(e) => setFormData({ ...formData, acao_tomada: e.target.value })}
                placeholder="Ex: Envio de tabela de horários, alinhamento com familiar e contato quinzenal"
                rows={3}
                required
                className="text-xs mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Prazo de Ação (Dias)</Label>
                <Input
                  type="number"
                  value={formData.prazo_acao_dias || 30}
                  onChange={(e) =>
                    setFormData({ ...formData, prazo_acao_dias: parseInt(e.target.value) || 30 })
                  }
                  className="text-xs mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Nível de Prioridade</Label>
                <Select
                  value={formData.prioridade || 'MEDIA'}
                  onValueChange={(val) =>
                    setFormData({ ...formData, prioridade: val as PrioridadePlano })
                  }
                >
                  <SelectTrigger className="text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAIXA">Baixa</SelectItem>
                    <SelectItem value="MEDIA">Média</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="URGENTE">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="plano-ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
              />
              <Label htmlFor="plano-ativo" className="text-xs font-medium cursor-pointer">
                Plano de Ação Disponível para Seleção
              </Label>
            </div>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
              >
                Salvar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
