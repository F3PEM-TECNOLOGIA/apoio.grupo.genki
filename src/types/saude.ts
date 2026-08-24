export type UserPerfil = 'GESTOR' | 'RH' | 'ATENDENTE'
export type TipoProfissional = 'ENFERMEIRO' | 'MEDICO'
export type StatusBeneficiario =
  | 'ELEGIVEL'
  | 'SELECIONADO'
  | 'EM_ATENDIMENTO'
  | 'ATENDIDO'
  | 'INATIVO'
export type TipoVinculo = 'TITULAR' | 'DEPENDENTE'
export type NivelRisco = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
export type StatusLote = 'IMPORTADO' | 'PROCESSADO' | 'ERRO'
export type PrioridadePlano = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
export type MeioContato = 'LIGACAO_TELEFONICA' | 'WHATSAPP' | 'EMAIL' | 'SMS'
export type StatusContato = 'ATENDIDO' | 'OCUPADO' | 'SEM_RESPOSTA' | 'CONTATO_INCORRETO'
export type StatusGeralFicha =
  | 'EM_ACOMPANHAMENTO'
  | 'ALTA'
  | 'DESISTENCIA'
  | 'AGUARDANDO_RETORNO'
  | 'PROXIMO_CONTATO'
  | 'CONTATO_WHATSAPP'
export type TipoApontamentoRH = 'SELECAO' | 'EVOLUCAO' | 'VOLUMETRIA' | 'CUSTO'
export type StatusPesquisa = 'ENVIADO' | 'RESPONDIDO' | 'EXPIRADO'

export interface User {
  id: string
  name: string
  email: string
  perfil: UserPerfil
  registro_profissional?: string
  tipo_profissional?: TipoProfissional
  unidade_regiao?: string
  ativo: boolean
  created?: string
  updated?: string
}

export interface Beneficiario {
  id: string
  id_externo: string
  nome_beneficiario: string
  matricula: string
  unidade_regiao: string
  tipo_vinculo: TipoVinculo
  titular_id?: string
  expand?: {
    titular_id?: Beneficiario
    lote_id?: LoteSelecao
    atendente_id?: User
    selecionado_por?: User
  }
  faixa_etaria: string
  telefone: string
  celular: string
  email: string
  permite_contato_whatsapp_sms: boolean
  status: StatusBeneficiario
  data_selecao?: string
  lote_id?: string
  selecionado_por?: string
  data_selecao_gestao?: string
  atendente_id?: string
  data_distribuicao?: string
  ativo: boolean
  // SENSÍVEIS LGPD (Gestor vê tudo; Atendente vê condicao e risco; RH NUNCA vê)
  condicao_principal?: string
  risco?: NivelRisco
  // HIPER SENSÍVEIS LGPD (Apenas Gestor vê; Atendente e RH NUNCA vêem)
  custo_12_meses?: number
  created?: string
  updated?: string
}

export interface LoteSelecao {
  id: string
  lote_id: string
  data_selecao: string
  status: StatusLote
  total_beneficiarios: number
  custo_total: number
  criado_por?: string
  expand?: {
    criado_por?: User
  }
  created?: string
  updated?: string
}

export interface PlanoAcao {
  id: string
  necessidade_identificada: string
  objetivo: string
  acao_tomada: string
  prazo_acao_dias: number
  prioridade: PrioridadePlano
  ativo: boolean
  created?: string
  updated?: string
}

export interface ControlePrograma {
  id: string
  beneficiario_id: string
  condicao_principal: string
  risco: NivelRisco
  data_selecao: string
  responsavel: string
  ativo: boolean
  expand?: {
    beneficiario_id?: Beneficiario
  }
  created?: string
  updated?: string
}

export interface FichaAtendimento {
  id: string
  ficha_id: string
  beneficiario_id: string
  atendente_id: string
  plano_acao_id?: string
  controle_programa_id?: string
  meio_contato: MeioContato
  condicao_principal: string
  data_contato: string
  risco: NivelRisco
  status_contato: StatusContato
  descricao_atendimento: string
  data_proximo_contato?: string
  responsavel: string
  meta: string
  observacoes: string
  pendencias: string
  status_geral: StatusGeralFicha
  data_alta?: string
  feedback?: number
  data_envio_pesquisa?: string
  data_resposta_pesquisa?: string
  versao: number
  ativo: boolean
  expand?: {
    beneficiario_id?: Beneficiario
    atendente_id?: User
    plano_acao_id?: PlanoAcao
    controle_programa_id?: ControlePrograma
  }
  created?: string
  updated?: string
}

export interface HistoricoFicha {
  id: string
  ficha_id: string
  dados_anteriores: Record<string, unknown>
  campo_alterado: string
  valor_anterior: string
  valor_novo: string
  alterado_por?: string
  expand?: {
    alterado_por?: User
    ficha_id?: FichaAtendimento
  }
  created?: string
  updated?: string
}

export interface PesquisaSatisfacao {
  id: string
  ficha_id: string
  token: string
  nota: number
  comentario: string
  data_envio: string
  data_resposta?: string
  canal: 'EMAIL' | 'WHATSAPP'
  status: StatusPesquisa
  expand?: {
    ficha_id?: FichaAtendimento
  }
  created?: string
  updated?: string
}

export interface ApontamentoRH {
  id: string
  lote_id: string
  tipo_apontamento: TipoApontamentoRH
  descricao: string
  periodo_referencia: string
  metricas: Record<string, unknown>
  created?: string
  updated?: string
}

export interface DashboardCache {
  id: string
  atendente_id?: string
  tipo_dashboard: 'ATENDENTE' | 'GESTOR' | 'COMPARATIVO' | 'SATISFACAO'
  periodo_referencia: string
  indicadores: Record<string, unknown>
  data_atualizacao?: string
}
