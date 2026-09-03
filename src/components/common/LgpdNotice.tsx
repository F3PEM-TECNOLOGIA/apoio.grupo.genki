import React from 'react'
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'
import { UserPerfil } from '@/types/saude'

export function LgpdNotice({ perfil }: { perfil: UserPerfil | string }) {
  const isGestorPrograma = perfil === 'GESTOR_PROGRAMA'
  const isGestorVenart = perfil === 'GESTOR_VENART'
  const isGestorRh = perfil === 'GESTOR_RH'
  const isOperacao = perfil === 'OPERACAO'

  return (
    <div
      className={`rounded-lg border p-3 flex items-start gap-3 text-xs mb-4 ${
        isGestorPrograma
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
          : isGestorVenart
            ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200'
            : isGestorRh
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
      }`}
    >
      {isGestorPrograma ? (
        <Shield className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
      ) : isOperacao ? (
        <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
      ) : (
        <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      )}
      <div>
        <p className="font-semibold mb-0.5">
          {isGestorPrograma && 'Conformidade LGPD — Perfil GESTOR_PROGRAMA (Acesso Total)'}
          {isGestorVenart && 'Conformidade LGPD — Perfil GESTOR_VENART (Nome Oculto)'}
          {isGestorRh && 'Conformidade LGPD — Perfil GESTOR_RH (Nome Oculto)'}
          {isOperacao && 'Conformidade LGPD — Perfil OPERAÇÃO (Campos Sensíveis Protegidos)'}
        </p>
        <p className="opacity-90">
          {isGestorPrograma &&
            'Seu perfil tem autorização médica irrestrita para visualizar nomes, condições clínicas, classificação de risco e custos.'}
          {isGestorVenart &&
            'Nomes de beneficiários são mantidos anonimizados por padrão (config_lgpd_campos) para privacidade, com visualização de riscos e indicadores financeiros.'}
          {isGestorRh &&
            'Nomes anonimizados por padrão para preservar sigilo, mantendo dados clínicos agregados e de custos visíveis para gestão assistencial.'}
          {isOperacao &&
            'Campos clínicos sensíveis e custos são ocultados ou mascarados conforme governança da coleção config_lgpd_campos.'}
        </p>
      </div>
    </div>
  )
}
export default LgpdNotice
