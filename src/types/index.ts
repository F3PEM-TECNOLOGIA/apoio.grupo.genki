export type UserPerfil = 'GESTOR' | 'RH' | 'ATENDENTE'
export type TipoProfissional = 'ENFERMEIRO' | 'MEDICO'

export interface User {
  id: string
  email: string
  name: string
  perfil?: UserPerfil
  registro_profissional?: string
  tipo_profissional?: TipoProfissional
  unidade_regiao?: string
  ativo?: boolean
  avatar?: string
  role?: string
  created: string
  updated: string
}

export type StatusLote = 'IMPORTADO' | 'PROCESSADO' | 'ERRO'

export interface LoteSelecao {
  id: string
  lote_id: string
  data_selecao: string
  status: StatusLote
  total_beneficiarios: number
  custo_total: number
  criado_por?: string
  created: string
  updated: string
  expand?: {
    criado_por?: User
  }
}

export type StatusBeneficiario =
  | 'ELEGIVEL'
  | 'SELECIONADO'
  | 'EM_ATENDIMENTO'
  | 'ATENDIDO'
  | 'INATIVO'
export type NivelRisco = 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO'
export type TipoVinculo = 'TITULAR' | 'DEPENDENTE'

export interface Beneficiario {
  id: string
  id_externo?: string
  nome_beneficiario: string
  matricula: string
  unidade_regiao: string
  tipo_vinculo: TipoVinculo
  titular_id?: string
  faixa_etaria: string
  telefone: string
  celular: string
  email: string
  custo_12_meses?: number
  data_selecao: string
  lote_id?: string
  status: StatusBeneficiario
  condicao_principal?: string
  risco?: NivelRisco
  permite_contato_whatsapp_sms: boolean
  selecionado_por?: string
  data_selecao_gestao?: string
  atendente_id?: string
  data_distribuicao?: string
  ativo: boolean
  created: string
  updated: string
  expand?: {
    titular_id?: Beneficiario
    lote_id?: LoteSelecao
    selecionado_por?: User
    atendente_id?: User
  }
}

export type PrioridadePlano = 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'

export interface PlanoAcao {
  id: string
  necessidade_identificada: string
  objetivo: string
  acao_tomada: string
  prazo_acao_dias: number
  prioridade: PrioridadePlano
  ativo: boolean
  created: string
  updated: string
}

export interface ControlePrograma {
  id: string
  beneficiario_id: string
  condicao_principal: string
  risco: NivelRisco
  data_selecao: string
  responsavel: string
  ativo: boolean
  created: string
  updated: string
  expand?: {
    beneficiario_id?: Beneficiario
  }
}

export type MeioContato = 'LIGACAO_TELEFONICA' | 'WHATSAPP' | 'EMAIL' | 'SMS'
export type StatusContato = 'ATENDIDO' | 'OCUPADO' | 'SEM_RESPOSTA' | 'CONTATO_INCORRETO'
export type StatusGeralAtendimento =
  | 'EM_ACOMPANHAMENTO'
  | 'ALTA'
  | 'DESISTENCIA'
  | 'AGUARDANDO_RETORNO'
  | 'PROXIMO_CONTATO'

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
  observacoes?: string
  pendencias?: string
  status_geral: StatusGeralAtendimento
  data_alta?: string
  feedback?: number
  data_envio_pesquisa?: string
  data_resposta_pesquisa?: string
  versao: number
  ativo: boolean
  created: string
  updated: string
  expand?: {
    beneficiario_id?: Beneficiario
    atendente_id?: User
    plano_acao_id?: PlanoAcao
    controle_programa_id?: ControlePrograma
  }
}

export interface HistoricoFicha {
  id: string
  ficha_id: string
  dados_anteriores?: Record<string, unknown>
  campo_alterado: string
  valor_anterior: string
  valor_novo: string
  alterado_por?: string
  created: string
  updated: string
  expand?: {
    alterado_por?: User
  }
}

export type CanalPesquisa = 'EMAIL' | 'WHATSAPP'
export type StatusPesquisa = 'ENVIADO' | 'RESPONDIDO' | 'EXPIRADO'

export interface PesquisaSatisfacao {
  id: string
  ficha_id: string
  token: string
  nota?: number
  comentario?: string
  data_envio: string
  data_resposta?: string
  canal: CanalPesquisa
  status: StatusPesquisa
  created: string
  updated: string
  expand?: {
    ficha_id?: FichaAtendimento
  }
}

export interface LogAuditoria {
  id: string
  usuario_id?: string
  acao: string
  entidade: string
  entidade_id?: string
  dados_sensiveis: boolean
  detalhes?: Record<string, unknown>
  created: string
  updated: string
  expand?: {
    usuario_id?: User
  }
}

// Definição das 9 etapas do fluxo
export interface EtapaFluxoDef {
  etapa: number
  titulo: string
  descricao: string
  responsavel: 'GESTOR' | 'RH' | 'ATENDENTE' | 'BENEFICIARIO' | 'SISTEMA'
}

export const ETAPAS_FLUXO: EtapaFluxoDef[] = [
  {
    etapa: 1,
    titulo: 'Geração Planilha BI',
    descricao: 'BI gera planilha de elegíveis (.xlsx/.csv)',
    responsavel: 'SISTEMA',
  },
  {
    etapa: 2,
    titulo: 'Importação e Validação',
    descricao: 'Gestor importa lote e seleciona elegíveis (acesso total)',
    responsavel: 'GESTOR',
  },
  {
    etapa: 3,
    titulo: 'Recepção RH (LGPD)',
    descricao: 'RH visualiza lista protegida por LGPD (sem dados clínicos/custo)',
    responsavel: 'RH',
  },
  {
    etapa: 4,
    titulo: 'Distribuição Atendentes',
    descricao: 'RH distribui beneficiários aos profissionais de saúde',
    responsavel: 'RH',
  },
  {
    etapa: 5,
    titulo: 'Atendimento Clínico',
    descricao: 'Atendente realiza contato (LGPD parcial sem custos)',
    responsavel: 'ATENDENTE',
  },
  {
    etapa: 6,
    titulo: 'Plano de Ação / Alta',
    descricao: 'Atribuição de plano de cuidado individualizado ou alta clínica',
    responsavel: 'ATENDENTE',
  },
  {
    etapa: 7,
    titulo: 'Indicadores e Registro',
    descricao: 'Preenchimento de evolução, pendências e desfecho',
    responsavel: 'ATENDENTE',
  },
  {
    etapa: 8,
    titulo: 'Pesquisa Satisfação',
    descricao: 'Envio de link público de avaliação ao beneficiário',
    responsavel: 'BENEFICIARIO',
  },
  {
    etapa: 9,
    titulo: 'Analytics & Dashboards',
    descricao: 'Gestor analisa resultados clínicos, custos e satisfação',
    responsavel: 'GESTOR',
  },
]
