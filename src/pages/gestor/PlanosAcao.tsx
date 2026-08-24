import React, { useState, useEffect } from 'react'
import {
  getAllPlanosAcao,
  createPlanoAcao,
  updatePlanoAcao,
  toggleAtivoPlanoAcao,
} from '@/services/healthService'
import {
  Target,
  Plus,
  Search,
  Edit,
  Power,
  PowerOff,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { LgpdNotice } from '@/components/common/LgpdNotice'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { PlanoAcao, PrioridadePlano } from '@/types'

export default function PlanosAcao() {
  const [planos, setPlanos] = useState<PlanoAcao[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PlanoAcao | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    necessidade_identificada: '',
    objetivo: '',
    acao_tomada: '',
    prazo_acao_dias: 30,
    prioridade: 'MEDIA' as PrioridadePlano,
    ativo: true,
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getAllPlanosAcao()
      setPlanos(data)
    } catch (err) {
      console.error(err)
      toast.error('Erro ao carregar planos de ação.')
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
    setModalOpen(true)
  }

  const handleOpenEdit = (p: PlanoAcao) => {
    setEditingItem(p)
    setFormData({
      necessidade_identificada: p.necessidade_identificada,
      objetivo: p.objetivo,
      acao_tomada: p.acao_tomada || '',
      prazo_acao_dias: p.prazo_acao_dias || 30,
      prioridade: p.prioridade || 'MEDIA',
      ativo: p.ativo ?? true,
    })
    setModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      if (editingItem) {
        await updatePlanoAcao(editingItem.id, formData)
        toast.success('Plano de Ação atualizado!')
      } else {
        await createPlanoAcao(formData)
        toast.success('Novo Plano de Ação cadastrado!')
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar plano de ação.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleAtivo = async (p: PlanoAcao) => {
    try {
      await toggleAtivoPlanoAcao(p.id, p.ativo)
      toast.success(p.ativo ? 'Plano de ação desativado!' : 'Plano de ação reativado!')
      await loadData()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao alterar status do plano.')
    }
  }

  const filtered = planos.filter(
    (p) =>
      p.necessidade_identificada.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.objetivo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getPrioridadeBadge = (prio: PrioridadePlano) => {
    switch (prio) {
      case 'URGENTE':
        return <Badge className="bg-red-600 text-white text-[10px]">URGENTE</Badge>
      case 'ALTA':
        return <Badge className="bg-orange-600 text-white text-[10px]">ALTA</Badge>
      case 'MEDIA':
        return <Badge className="bg-amber-600 text-white text-[10px]">MÉDIA</Badge>
      case 'BAIXA':
        return <Badge className="bg-emerald-600 text-white text-[10px]">BAIXA</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" /> Catálogo de Planos de Ação e Cuidados
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Modelos de conduta terapêutica e protocolos atribuíveis aos atendimentos clínicos
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="bg-primary hover:bg-primary/90 text-xs font-semibold gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Novo Plano de Ação
        </Button>
      </div>

      <LgpdNotice perfil="GESTOR" />

      {/* Busca */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar planos de ação por necessidade ou objetivo..."
              className="pl-9 text-xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Total cadastrado: <span className="font-bold text-foreground">{filtered.length}</span>
          </p>
        </CardContent>
      </Card>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((plano) => (
          <Card
            key={plano.id}
            className={`border-border shadow-sm flex flex-col justify-between ${!plano.ativo ? 'opacity-60 bg-muted/20' : ''}`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-1">
                {getPrioridadeBadge(plano.prioridade)}
                <Badge variant="outline" className="text-[10px] gap-1 font-mono">
                  <Clock className="w-3 h-3 text-primary" /> {plano.prazo_acao_dias} dias
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-foreground line-clamp-2">
                {plano.necessidade_identificada}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs flex-1">
              <div>
                <span className="font-bold text-primary block text-[11px]">Objetivo Esperado:</span>
                <p className="text-muted-foreground line-clamp-2">{plano.objetivo}</p>
              </div>
              {plano.acao_tomada && (
                <div>
                  <span className="font-bold text-foreground block text-[11px]">
                    Conduta Padrão:
                  </span>
                  <p className="text-muted-foreground line-clamp-2">{plano.acao_tomada}</p>
                </div>
              )}
            </CardContent>
            <div className="p-3 border-t border-border flex items-center justify-between bg-muted/20">
              <Badge className={`text-[10px] ${plano.ativo ? 'bg-emerald-600' : 'bg-red-600'}`}>
                {plano.ativo ? 'ATIVO' : 'DESATIVADO'}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenEdit(plano)}
                  className="h-7 w-7"
                >
                  <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleAtivo(plano)}
                  className={`h-7 w-7 ${plano.ativo ? 'text-amber-600' : 'text-emerald-600'}`}
                  title={plano.ativo ? 'Desativar' : 'Reativar'}
                >
                  {plano.ativo ? (
                    <PowerOff className="w-3.5 h-3.5" />
                  ) : (
                    <Power className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal CRUD Plano de Ação */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-primary">
                {editingItem ? 'Editar Plano de Ação' : 'Novo Modelo de Plano de Ação'}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Defina a necessidade, conduta terapêutica e prazo padrão de acompanhamento.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-4 text-xs">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">
                  Necessidade Identificada / Diagnóstico
                </Label>
                <Input
                  required
                  value={formData.necessidade_identificada}
                  onChange={(e) =>
                    setFormData({ ...formData, necessidade_identificada: e.target.value })
                  }
                  placeholder="Ex: Hipertensão com picos frequentes"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Objetivo / Meta Terapêutica</Label>
                <Textarea
                  required
                  rows={2}
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  placeholder="Ex: Reduzir PA para < 130/80 mmHg em 30 dias"
                  className="text-xs resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Ação / Conduta Tomada</Label>
                <Textarea
                  rows={2}
                  value={formData.acao_tomada}
                  onChange={(e) => setFormData({ ...formData, acao_tomada: e.target.value })}
                  placeholder="Ex: Encaminhamento cardiológico, suporte nutricional..."
                  className="text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Prazo de Ação (Dias)</Label>
                  <Input
                    type="number"
                    value={formData.prazo_acao_dias}
                    onChange={(e) =>
                      setFormData({ ...formData, prazo_acao_dias: Number(e.target.value) })
                    }
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Prioridade</Label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData({ ...formData, prioridade: e.target.value as PrioridadePlano })
                    }
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-1" /> Salvar Plano
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
