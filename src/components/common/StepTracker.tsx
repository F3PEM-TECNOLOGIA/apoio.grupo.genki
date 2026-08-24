import React from 'react'
import { ETAPAS_FLUXO } from '@/types'
import { Check, Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepTrackerProps {
  currentStep: number
  className?: string
}

export const StepTracker: React.FC<StepTrackerProps> = ({ currentStep, className }) => {
  return (
    <div className={cn('w-full bg-card rounded-xl border border-border p-4 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Ciclo de Cuidado em 9 Etapas
        </h4>
        <span className="text-xs font-semibold text-primary">Etapa {currentStep} de 9</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
        {ETAPAS_FLUXO.map((item) => {
          const isDone = item.etapa < currentStep
          const isCurrent = item.etapa === currentStep

          return (
            <div
              key={item.etapa}
              className={cn(
                'relative flex flex-col p-2 rounded-lg border text-left transition-all duration-200',
                isDone
                  ? 'bg-teal-50/70 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                  : isCurrent
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm ring-2 ring-primary/20'
                    : 'bg-muted/40 border-border text-muted-foreground',
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                    isDone
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                        ? 'bg-white text-teal-800 font-extrabold'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : item.etapa}
                </span>
                {isCurrent && <Clock className="w-3.5 h-3.5 animate-spin text-white opacity-80" />}
              </div>
              <p className={cn('text-[11px] font-bold truncate', isCurrent ? 'text-white' : '')}>
                {item.titulo}
              </p>
              <span
                className={cn(
                  'text-[9px] font-semibold mt-0.5 truncate uppercase tracking-tight',
                  isCurrent ? 'text-teal-100' : 'text-muted-foreground',
                )}
              >
                {item.responsavel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
