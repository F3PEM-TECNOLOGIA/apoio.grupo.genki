import React from 'react'
import { ShieldCheck, Lock } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface LgpdNoticeProps {
  message?: string
  inline?: boolean
  perfil?: string
}

export const LgpdNotice: React.FC<LgpdNoticeProps> = ({ message, inline = false, perfil }) => {
  const defaultText =
    perfil === 'RH'
      ? 'Filtro LGPD Ativo: Campos clínicos, diagnósticos e financeiros estão ocultos para este perfil de acesso.'
      : perfil === 'ATENDENTE'
        ? 'Filtro LGPD Parcial: Acesso aos dados clínicos autorizado para cuidado à saúde. Custos financeiros ocultos.'
        : 'Proteção LGPD Ativa: Acesso e operações monitoradas e auditadas conforme Lei 13.709/2018.'

  const displayMsg = message || defaultText

  if (inline) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 cursor-help">
            <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>LGPD</span>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {displayMsg}
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/80 rounded-lg text-xs text-teal-900 dark:text-teal-100">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-teal-100 dark:bg-teal-900 rounded-md text-teal-700 dark:text-teal-300">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-teal-950 dark:text-teal-50 mr-1.5">
            LGPD em Conformidade:
          </span>
          <span>{displayMsg}</span>
        </div>
      </div>
      <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-teal-200/60 dark:bg-teal-800 text-teal-800 dark:text-teal-200 rounded">
        Auditoria Ativa
      </span>
    </div>
  )
}
