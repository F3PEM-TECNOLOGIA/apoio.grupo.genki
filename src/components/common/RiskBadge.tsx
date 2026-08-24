import React from 'react'
import { Badge } from '@/components/ui/badge'
import { ShieldAlert, ShieldCheck, Shield, AlertTriangle } from 'lucide-react'
import type { NivelRisco } from '@/types'

interface RiskBadgeProps {
  level?: NivelRisco | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level = 'BAIXO',
  size = 'md',
  showIcon = true,
}) => {
  const norm = String(level).toUpperCase()

  const config = {
    CRITICO: {
      label: 'Crítico',
      classes:
        'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
      icon: ShieldAlert,
    },
    ALTO: {
      label: 'Alto Risco',
      classes:
        'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800',
      icon: AlertTriangle,
    },
    MEDIO: {
      label: 'Médio Risco',
      classes:
        'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
      icon: Shield,
    },
    BAIXO: {
      label: 'Baixo Risco',
      classes:
        'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
      icon: ShieldCheck,
    },
  }

  const selected = config[norm as keyof typeof config] || config.BAIXO
  const IconComponent = selected.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }

  return (
    <Badge
      variant="outline"
      className={`${selected.classes} ${sizeClasses[size]} inline-flex items-center rounded-full shadow-sm`}
    >
      {showIcon && <IconComponent className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{selected.label}</span>
    </Badge>
  )
}
