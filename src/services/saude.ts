import pb from '@/lib/pocketbase/client'
import {
  Beneficiario,
  LoteSelecao,
  PlanoAcao,
  ControlePrograma,
  FichaAtendimento,
  HistoricoFicha,
  PesquisaSatisfacao,
  User,
  UserPerfil,
  ConfigLgpdCampo,
  CampoLgpd,
} from '@/types/saude'

// Cache em memória para configurações dinâmicas de LGPD
let lgpdConfigCache: Record<string, boolean> | null = null
let lgpdConfigPromise: Promise<Record<string, boolean>> | null = null

// Regras padrão caso a coleção ainda esteja sendo carregada
const defaultLgpdRules: Record<UserPerfil, Record<CampoLgpd, boolean>> = {
  GESTOR_PROGRAMA: {
    nome: true,
    condicao_principal: true,
    risco: true,
    custo_12m: true,
  },
  GESTOR_VENART: {
    nome: false,
    condicao_principal: true,
    risco: true,
    custo_12m: true,
  },
  GESTOR_RH: {
    nome: false,
    condicao_principal: true,
    risco: true,
    custo_12m: true,
  },
  OPERACAO: {
    nome: false,
    condicao_principal: false,
    risco: false,
    custo_12m: false,
  },
}

export async function fetchLgpdConfig(): Promise<Record<string, boolean>> {
  if (lgpdConfigCache) return lgpdConfigCache
  if (lgpdConfigPromise) return lgpdConfigPromise

  lgpdConfigPromise = (async () => {
    try {
      const records = await pb.collection('config_lgpd_campos').getFullList<ConfigLgpdCampo>({
        requestKey: null,
      })
      const map: Record<string, boolean> = {}
      for (const r of records) {
        map[`${r.perfil}:${r.campo}`] = r.visivel
      }
      lgpdConfigCache = map
      return map
    } catch {
      // Fallback para mapa default
      const map: Record<string, boolean> = {}
      for (const [p, campos] of Object.entries(defaultLgpdRules)) {
        for (const [c, vis] of Object.entries(campos)) {
          map[`${p}:${c}`] = vis
        }
      }
      lgpdConfigCache = map
      return map
    } finally {
      lgpdConfigPromise = null
    }
  })()

  return lgpdConfigPromise
}

export function isCampoVisivel(
  perfil: UserPerfil,
  campo: CampoLgpd,
  configMap?: Record<string, boolean> | null,
): boolean {
  const map = configMap || lgpdConfigCache
  if (map && typeof map[`${perfil}:${campo}`] === 'boolean') {
    return map[`${perfil}:${campo}`]
  }
  return defaultLgpdRules[perfil]?.[campo] ?? true
}

/**
 * Sanitiza o beneficiário conforme as regras dinâmicas de LGPD do perfil:
 * - Se nome não for visível, anonimiza com 'Beneficiário (LGPD) [MAT-XXXXX]'
 * - Se condicao_principal não for visível, define como undefined
 * - Se risco não for visível, define como undefined
 * - Se custo_12m não for visível, define como undefined
 */
export function applyLgpdFilter(
  beneficiario: Beneficiario,
  perfil: UserPerfil,
  configMap?: Record<string, boolean> | null,
): Beneficiario {
  const res: Beneficiario = { ...beneficiario }

  // Harmonizar nomes de campos novos e legados
  const nomeOriginal = beneficiario.nome || beneficiario.nome_beneficiario || 'Beneficiário'
  const custoOriginal =
    beneficiario.custo_12m !== undefined ? beneficiario.custo_12m : beneficiario.custo_12_meses

  const nomeVisivel = isCampoVisivel(perfil, 'nome', configMap)
  const condicaoVisivel = isCampoVisivel(perfil, 'condicao_principal', configMap)
  const riscoVisivel = isCampoVisivel(perfil, 'risco', configMap)
  const custoVisivel = isCampoVisivel(perfil, 'custo_12m', configMap)

  if (!nomeVisivel) {
    const anonimo = `Beneficiário Protegido (${beneficiario.matricula})`
    res.nome = anonimo
    res.nome_beneficiario = anonimo
  } else {
    res.nome = nomeOriginal
    res.nome_beneficiario = nomeOriginal
  }

  if (!condicaoVisivel) {
    res.condicao_principal = undefined
  }

  if (!riscoVisivel) {
    res.risco = undefined
  }

  if (!custoVisivel) {
    res.custo_12m = undefined
    res.custo_12_meses = undefined
  } else {
    res.custo_12m = custoOriginal
    res.custo_12_meses = custoOriginal
  }

  return res
}

// ================= BENEFICIARIOS SERVICE =================
export const BeneficiariosService = {
  async list(
    params: {
      page?: number
      perPage?: number
      filter?: string
      sort?: string
      perfil?: UserPerfil
    } = {},
  ) {
    const {
      page = 1,
      perPage = 100,
      filter = '',
      sort = '-created',
      perfil = 'GESTOR_VENART',
    } = params

    // Assegurar carregamento de config LGPD
    const configMap = await fetchLgpdConfig()

    const result = await pb.collection('beneficiarios').getList(page, perPage, {
      filter,
      sort,
      expand: 'titular_id,lote_id,atendente_id,selecionado_por,aprovado_por',
      requestKey: null,
    })

    return {
      ...result,
      items: (result.items as unknown as Beneficiario[]).map((item) =>
        applyLgpdFilter(item, perfil, configMap),
      ),
    }
  },

  async getById(id: string, perfil: UserPerfil = 'GESTOR_VENART'): Promise<Beneficiario> {
    const configMap = await fetchLgpdConfig()
    const record = await pb.collection('beneficiarios').getOne(id, {
      expand: 'titular_id,lote_id,atendente_id,selecionado_por,aprovado_por',
      requestKey: null,
    })
    return applyLgpdFilter(record as unknown as Beneficiario, perfil, configMap)
  },

  async create(data: Partial<Beneficiario>): Promise<Beneficiario> {
    const payload = {
      ...data,
      nome: data.nome || data.nome_beneficiario,
      nome_beneficiario: data.nome || data.nome_beneficiario,
      unidade: data.unidade || data.unidade_regiao,
      unidade_regiao: data.unidade || data.unidade_regiao,
      vinculo: data.vinculo || data.tipo_vinculo || 'TITULAR',
      tipo_vinculo: data.vinculo || data.tipo_vinculo || 'TITULAR',
      faixa: data.faixa || data.faixa_etaria || '30-39',
      faixa_etaria: data.faixa || data.faixa_etaria || '30-39',
      custo_12m: data.custo_12m !== undefined ? data.custo_12m : data.custo_12_meses,
      custo_12_meses: data.custo_12m !== undefined ? data.custo_12m : data.custo_12_meses,
    }
    const record = await pb.collection('beneficiarios').create(payload)
    return record as unknown as Beneficiario
  },

  async update(id: string, data: Partial<Beneficiario>): Promise<Beneficiario> {
    const payload: any = { ...data }
    if (data.nome || data.nome_beneficiario) {
      payload.nome = data.nome || data.nome_beneficiario
      payload.nome_beneficiario = data.nome || data.nome_beneficiario
    }
    if (data.unidade || data.unidade_regiao) {
      payload.unidade = data.unidade || data.unidade_regiao
      payload.unidade_regiao = data.unidade || data.unidade_regiao
    }
    if (data.vinculo || data.tipo_vinculo) {
      payload.vinculo = data.vinculo || data.tipo_vinculo
      payload.tipo_vinculo = data.vinculo || data.tipo_vinculo
    }
    if (data.faixa || data.faixa_etaria) {
      payload.faixa = data.faixa || data.faixa_etaria
      payload.faixa_etaria = data.faixa || data.faixa_etaria
    }
    if (data.custo_12m !== undefined || data.custo_12_meses !== undefined) {
      const v = data.custo_12m !== undefined ? data.custo_12m : data.custo_12_meses
      payload.custo_12m = v
      payload.custo_12_meses = v
    }
    const record = await pb.collection('beneficiarios').update(id, payload)
    return record as unknown as Beneficiario
  },

  async delete(id: string, soft = true): Promise<void> {
    if (soft) {
      await pb.collection('beneficiarios').update(id, { ativo: false, status: 'INATIVO' })
    } else {
      await pb.collection('beneficiarios').delete(id)
    }
  },

  // Transição 1: ELEGIVEL -> SELECIONADO
  async selectForProgram(ids: string[], userId: string): Promise<void> {
    const now = new Date().toISOString()
    for (const id of ids) {
      await pb.collection('beneficiarios').update(id, {
        status: 'SELECIONADO',
        selecionado_por: userId,
        data_selecao: now,
        data_selecao_gestao: now,
      })
    }
  },

  // Transição 2: SELECIONADO -> APROVADO
  async approveForProgram(ids: string[], userId: string): Promise<void> {
    const now = new Date().toISOString()
    for (const id of ids) {
      await pb.collection('beneficiarios').update(id, {
        status: 'APROVADO',
        aprovado_por: userId,
        data_aprovacao: now,
      })
    }
  },

  // Transição 3: Distribuir para operador (status APROVADO -> ATENDIDO ou em atendimento)
  async distributeToAtendente(
    beneficiarioIds: string[],
    operadorId: string,
    markAtendido = false,
  ): Promise<void> {
    const now = new Date().toISOString()
    for (const id of beneficiarioIds) {
      await pb.collection('beneficiarios').update(id, {
        atendente_id: operadorId,
        data_distribuicao: now,
        status: markAtendido ? 'ATENDIDO' : 'APROVADO',
      })
    }
  },
}

// ================= LGPD CONFIG SERVICE =================
export const ConfigLgpdService = {
  async listAll(): Promise<ConfigLgpdCampo[]> {
    const records = await pb.collection('config_lgpd_campos').getFullList({
      sort: 'perfil,campo',
      requestKey: null,
    })
    return records as unknown as ConfigLgpdCampo[]
  },

  async updateVisibilidade(id: string, visivel: boolean, userId: string): Promise<void> {
    await pb.collection('config_lgpd_campos').update(id, {
      visivel,
      atualizado_por: userId,
      atualizado_em: new Date().toISOString(),
    })
    // Invalidar cache
    lgpdConfigCache = null
    await fetchLgpdConfig()
  },
}

// ================= USUÁRIOS SERVICE =================
export const UsuariosService = {
  async list(filter = '', sort = 'name') {
    const result = await pb.collection('users').getFullList({
      filter,
      sort,
      requestKey: null,
    })
    return result as unknown as User[]
  },

  async listOperacao() {
    const result = await pb.collection('users').getFullList({
      filter: 'perfil = "OPERACAO" && ativo = true',
      sort: 'name',
      requestKey: null,
    })
    return result as unknown as User[]
  },

  // Retrocompatibilidade
  async listAtendentes() {
    return this.listOperacao()
  },

  async getById(id: string): Promise<User> {
    const record = await pb.collection('users').getOne(id)
    return record as unknown as User
  },

  async create(data: Partial<User> & { password?: string }): Promise<User> {
    const payload: any = {
      ...data,
      password: data.password || '12345678',
      passwordConfirm: data.password || '12345678',
      emailVisibility: true,
      verified: true,
      tema_preferido: data.tema_preferido || 'LIGHT',
      categoria_profissional: data.categoria_profissional || 'ADMINISTRATIVO',
    }
    const record = await pb.collection('users').create(payload)
    return record as unknown as User
  },

  async update(id: string, data: Partial<User> & { password?: string }): Promise<User> {
    const payload: any = { ...data }
    if (data.password) {
      payload.password = data.password
      payload.passwordConfirm = data.password
    }
    const record = await pb.collection('users').update(id, payload)
    return record as unknown as User
  },

  async toggleAtivo(id: string, ativo: boolean): Promise<User> {
    const record = await pb.collection('users').update(id, { ativo })
    return record as unknown as User
  },

  async updateTema(id: string, tema: 'LIGHT' | 'DARK'): Promise<User> {
    const record = await pb.collection('users').update(id, { tema_preferido: tema })
    return record as unknown as User
  },
}

// ================= LOTES SELEÇÃO SERVICE =================
export const LotesService = {
  async list() {
    const records = await pb.collection('lotes_selecao').getFullList({
      sort: '-created',
      expand: 'criado_por,usuario_importador_id',
      requestKey: null,
    })
    return records as unknown as LoteSelecao[]
  },

  async createWithBeneficiarios(
    loteData: {
      codigo_lote: string
      tipo_lote?: 'NOVO_REGISTRO' | 'ATUALIZACAO'
      total_registros: number
      custo_total: number
      usuario_importador_id: string
    },
    beneficiariosList: Array<Partial<Beneficiario>>,
  ) {
    const now = new Date().toISOString()
    const loteRecord = await pb.collection('lotes_selecao').create({
      codigo_lote: loteData.codigo_lote,
      lote_id: loteData.codigo_lote,
      tipo_lote: loteData.tipo_lote || 'NOVO_REGISTRO',
      data_importacao: now,
      data_selecao: now,
      usuario_importador_id: loteData.usuario_importador_id,
      criado_por: loteData.usuario_importador_id,
      total_registros: loteData.total_registros,
      total_beneficiarios: loteData.total_registros,
      custo_total: loteData.custo_total,
      status_processamento: 'PROCESSADO',
      status: 'PROCESSADO',
    })

    const createdBeneficiarios: Beneficiario[] = []
    for (const b of beneficiariosList) {
      const created = await BeneficiariosService.create({
        ...b,
        lote_id: loteRecord.id,
        status: b.status || 'ELEGIVEL',
        ativo: true,
        data_selecao: now,
      })
      createdBeneficiarios.push(created)
    }

    return {
      lote: loteRecord as unknown as LoteSelecao,
      beneficiarios: createdBeneficiarios,
    }
  },
}

// ================= PLANOS DE AÇÃO SERVICE =================
export const PlanosAcaoService = {
  async list(filter = 'ativo = true') {
    const records = await pb.collection('planos_acao').getFullList({
      filter,
      sort: '-created',
      requestKey: null,
    })
    return records as unknown as PlanoAcao[]
  },

  async create(data: Partial<PlanoAcao>): Promise<PlanoAcao> {
    const record = await pb.collection('planos_acao').create({
      ...data,
      ativo: data.ativo ?? true,
    })
    return record as unknown as PlanoAcao
  },

  async update(id: string, data: Partial<PlanoAcao>): Promise<PlanoAcao> {
    const record = await pb.collection('planos_acao').update(id, data)
    return record as unknown as PlanoAcao
  },

  async toggleAtivo(id: string, ativo: boolean): Promise<PlanoAcao> {
    const record = await pb.collection('planos_acao').update(id, { ativo })
    return record as unknown as PlanoAcao
  },
}

// ================= CONTROLE DE PROGRAMAS SERVICE =================
export const ControleProgramasService = {
  async list() {
    const records = await pb.collection('controle_programas').getFullList({
      sort: '-created',
      expand: 'beneficiario_id',
      requestKey: null,
    })
    return records as unknown as ControlePrograma[]
  },

  async create(data: Partial<ControlePrograma>): Promise<ControlePrograma> {
    const record = await pb.collection('controle_programas').create({
      ...data,
      ativo: data.ativo ?? true,
      data_selecao: data.data_selecao || new Date().toISOString(),
    })
    return record as unknown as ControlePrograma
  },

  async update(id: string, data: Partial<ControlePrograma>): Promise<ControlePrograma> {
    const record = await pb.collection('controle_programas').update(id, data)
    return record as unknown as ControlePrograma
  },

  async toggleAtivo(id: string, ativo: boolean): Promise<ControlePrograma> {
    const record = await pb.collection('controle_programas').update(id, { ativo })
    return record as unknown as ControlePrograma
  },
}

// ================= FICHAS DE ATENDIMENTO SERVICE =================
export const FichasService = {
  async list(filter = '', sort = '-data_contato') {
    const records = await pb.collection('fichas_atendimento').getFullList({
      filter,
      sort,
      expand: 'beneficiario_id,atendente_id,plano_acao_id,controle_programa_id',
      requestKey: null,
    })
    return records as unknown as FichaAtendimento[]
  },

  async getById(id: string): Promise<FichaAtendimento> {
    const record = await pb.collection('fichas_atendimento').getOne(id, {
      expand: 'beneficiario_id,atendente_id,plano_acao_id,controle_programa_id',
      requestKey: null,
    })
    return record as unknown as FichaAtendimento
  },

  async create(data: Partial<FichaAtendimento>): Promise<FichaAtendimento> {
    const record = await pb.collection('fichas_atendimento').create({
      ...data,
      versao: 1,
      ativo: true,
      data_contato: data.data_contato || new Date().toISOString(),
    })
    return record as unknown as FichaAtendimento
  },

  async updateWithVersion(
    id: string,
    newData: Partial<FichaAtendimento>,
    userId: string,
    changeDescription = 'Atualização da ficha de atendimento',
  ): Promise<FichaAtendimento> {
    const current = await pb.collection('fichas_atendimento').getOne(id)
    const newVersion = (current.versao || 1) + 1

    try {
      await pb.collection('historico_fichas').create({
        ficha_id: id,
        dados_anteriores: {
          versao: current.versao,
          status_geral: current.status_geral,
          status_contato: current.status_contato,
          descricao_atendimento: current.descricao_atendimento,
          meta: current.meta,
          observacoes: current.observacoes,
          pendencias: current.pendencias,
          plano_acao_id: current.plano_acao_id,
          risco: current.risco,
          feedback: current.feedback,
        },
        campo_alterado: changeDescription,
        valor_anterior: `v${current.versao} (${current.status_geral})`,
        valor_novo: `v${newVersion} (${newData.status_geral || current.status_geral})`,
        alterado_por: userId,
      })
    } catch (e) {
      console.warn('Falha ao gravar historico_fichas:', e)
    }

    const updated = await pb.collection('fichas_atendimento').update(id, {
      ...newData,
      versao: newVersion,
    })

    return updated as unknown as FichaAtendimento
  },

  async finalizarComAlta(
    fichaId: string,
    beneficiarioId: string,
    userId: string,
    options: {
      observacoes?: string
      canal?: 'EMAIL' | 'WHATSAPP'
    } = {},
  ) {
    const now = new Date().toISOString()
    const token = `survey-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    const ficha = await this.updateWithVersion(
      fichaId,
      {
        status_geral: 'ALTA',
        data_alta: now,
        data_envio_pesquisa: now,
        observacoes: options.observacoes || 'Alta concedida com sucesso.',
      },
      userId,
      'Finalização com ALTA e envio de pesquisa de satisfação',
    )

    try {
      await pb.collection('beneficiarios').update(beneficiarioId, {
        status: 'ATENDIDO',
      })
    } catch (err) {
      console.warn('Erro ao atualizar status beneficiario:', err)
    }

    let surveyRecord: PesquisaSatisfacao | null = null
    try {
      surveyRecord = (await pb.collection('pesquisas_satisfacao').create({
        ficha_id: fichaId,
        token,
        nota: 0,
        comentario: '',
        data_envio: now,
        canal: options.canal || 'WHATSAPP',
        status: 'ENVIADO',
      })) as unknown as PesquisaSatisfacao
    } catch (err) {
      console.warn('Erro ao criar pesquisa_satisfacao:', err)
    }

    const publicSurveyUrl = `${window.location.origin}/pesquisa/${token}`

    return {
      ficha,
      token,
      publicSurveyUrl,
      survey: surveyRecord,
    }
  },

  async getHistorico(fichaId: string) {
    const records = await pb.collection('historico_fichas').getFullList({
      filter: `ficha_id = "${fichaId}"`,
      sort: '-created',
      expand: 'alterado_por',
      requestKey: null,
    })
    return records as unknown as HistoricoFicha[]
  },
}

// ================= PESQUISAS DE SATISFAÇÃO SERVICE (PÚBLICO) =================
export const PesquisasService = {
  async getByToken(token: string) {
    const record = await pb
      .collection('pesquisas_satisfacao')
      .getFirstListItem(`token = "${token}"`, {
        expand: 'ficha_id,ficha_id.beneficiario_id,ficha_id.atendente_id',
        requestKey: null,
      })
    return record as unknown as PesquisaSatisfacao
  },

  async responder(token: string, nota: number, comentario: string) {
    const survey = await this.getByToken(token)
    const now = new Date().toISOString()

    const updatedSurvey = await pb.collection('pesquisas_satisfacao').update(survey.id, {
      nota,
      comentario,
      data_resposta: now,
      status: 'RESPONDIDO',
    })

    if (survey.ficha_id) {
      try {
        await pb.collection('fichas_atendimento').update(survey.ficha_id, {
          feedback: nota,
          data_resposta_pesquisa: now,
        })
      } catch (err) {
        console.warn('Erro ao sincronizar feedback na ficha:', err)
      }
    }

    return updatedSurvey as unknown as PesquisaSatisfacao
  },

  async listAll() {
    const records = await pb.collection('pesquisas_satisfacao').getFullList({
      sort: '-created',
      expand: 'ficha_id,ficha_id.beneficiario_id,ficha_id.atendente_id',
      requestKey: null,
    })
    return records as unknown as PesquisaSatisfacao[]
  },
}
