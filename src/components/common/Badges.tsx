import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react'
import { UserPerfil } from '@/types/saude'

export function LgpdBadge({ perfil }: { perfil: UserPerfil }) {
  if (perfil === 'GESTOR') {
    return (
      <Badge
        variant="outline"
        className="bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1"
      >
        <Shield className="w-3.5 h-3.5" />
        Acesso Total (Gestão / Sem Filtro LGPD)
      </Badge>
    )
  }

  if (perfil === 'ATENDENTE') {
    return (
      <Badge
        variant="outline"
        className="bg-blue-50 text-blue-700 border-blue-300 flex items-center gap-1"
      >
        <ShieldCheck className="w-3.5 h-3.5" />
        Filtro LGPD Clínico (Dados Financeiros Ocultos)
      </Badge>
    )
  }

  return (
    <Badge
      variant="outline"
      className="bg-amber-50 text-amber-800 border-amber-300 flex items-center gap-1"
    >
      <ShieldAlert className="w-3.5 h-3.5" />
      Filtro LGPD Ativo (Dados Clínicos e Financeiros Ocultos)
    </Badge>
  )
}

export function RiscoBadge({ risco }: { risco?: string }) {
  if (!risco) {
    return <span className="text-muted-foreground text-xs italic">Não informado / Oculto</span>
  }

  const map: Record<string, { label: string; className: string }> = {
    BAIXO: { label: 'Baixo', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    MEDIO: { label: 'Médio', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    ALTO: { label: 'Alto', className: 'bg-orange-100 text-orange-800 border-orange-300' },
    CRITICO: { label: 'Crítico', className: 'bg-rose-100 text-rose-800 border-rose-300' },
  }

  const item = map[risco.toUpperCase()] || {
    label: risco,
    className: 'bg-slate-100 text-slate-800',
  }

  return (
    <Badge variant="outline" className={`font-semibold ${item.className}`}>
      {item.label}
    </Badge>
  )
}

export function StatusBeneficiarioBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ELEGIVEL: { label: 'Elegível', className: 'bg-slate-100 text-slate-700 border-slate-300' },
    SELECIONADO: {
      label: 'Selecionado',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    EM_ATENDIMENTO: {
      label: 'Em Atendimento',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    ATENDIDO: {
      label: 'Atendido (Alta)',
      className: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    INATIVO: { label: 'Inativo', className: 'bg-zinc-100 text-zinc-500 border-zinc-200' },
  }

  const item = map[status] || { label: status, className: 'bg-slate-100 text-slate-700' }

  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  )
}

export function StatusGeralBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    EM_ACOMPANHAMENTO: {
      label: 'Em Acompanhamento',
      className: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    ALTA: { label: 'Alta Médica', className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    DESISTENCIA: { label: 'Desistência', className: 'bg-rose-100 text-rose-800 border-rose-300' },
    AGUARDANDO_RETORNO: {
      label: 'Aguardando Retorno',
      className: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    PROXIMO_CONTATO: {
      label: 'Próximo Contato',
      className: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    CONTATO_WHATSAPP: { label: 'WhatsApp', className: 'bg-teal-100 text-teal-800 border-teal-300' },
  }

  const item = map[status] || { label: status, className: 'bg-slate-100 text-slate-700' }

  return (
    <Badge variant="outline" className={item.className}>
      {item.label}
    </Badge>
  )
}
