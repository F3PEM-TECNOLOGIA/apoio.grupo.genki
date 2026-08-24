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
} from '@/types/saude'

/**
 * Aplica LGPD Sanitization com base no perfil do usuário logado:
 * - GESTOR: dados totais, sem censura (vê risco, condição e custo financeiro).
 * - ATENDENTE: dados clínicos parciais (vê risco e condição; custo financeiro é omitido).
 * - RH: dados puramente administrativos (vê contato, matrícula, unidade; risco, condição, custo e feedback são omitidos).
 */
export function applyLgpdFilter(beneficiario: Beneficiario, perfil: UserPerfil): Beneficiario {
  if (perfil === 'GESTOR') {
    return beneficiario
  }

  if (perfil === 'ATENDENTE') {
    return {
      ...beneficiario,
      custo_12_meses: undefined, // LGPD restrição financeira
    }
  }

  if (perfil === 'RH') {
    return {
      ...beneficiario,
      condicao_principal: undefined, // LGPD restrição clínica
      risco: undefined, // LGPD restrição clínica
      custo_12_meses: undefined, // LGPD restrição financeira
    }
  }

  return beneficiario
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
    const { page = 1, perPage = 100, filter = '', sort = '-created', perfil = 'GESTOR' } = params
    const result = await pb.collection('beneficiarios').getList(page, perPage, {
      filter,
      sort,
      expand: 'titular_id,lote_id,atendente_id,selecionado_por',
      requestKey: null,
    })

    return {
      ...result,
      items: (result.items as unknown as Beneficiario[]).map((item) =>
        applyLgpdFilter(item, perfil),
      ),
    }
  },

  async getById(id: string, perfil: UserPerfil = 'GESTOR'): Promise<Beneficiario> {
    const record = await pb.collection('beneficiarios').getOne(id, {
      expand: 'titular_id,lote_id,atendente_id,selecionado_por',
      requestKey: null,
    })
    return applyLgpdFilter(record as unknown as Beneficiario, perfil)
  },

  async create(data: Partial<Beneficiario>): Promise<Beneficiario> {
    const record = await pb.collection('beneficiarios').create(data)
    return record as unknown as Beneficiario
  },

  async update(id: string, data: Partial<Beneficiario>): Promise<Beneficiario> {
    const record = await pb.collection('beneficiarios').update(id, data)
    return record as unknown as Beneficiario
  },

  async delete(id: string, soft = true): Promise<void> {
    if (soft) {
      await pb.collection('beneficiarios').update(id, { ativo: false, status: 'INATIVO' })
    } else {
      await pb.collection('beneficiarios').delete(id)
    }
  },

  async selectForProgram(ids: string[], userId: string): Promise<void> {
    const now = new Date().toISOString()
    for (const id of ids) {
      await pb.collection('beneficiarios').update(id, {
        status: 'SELECIONADO',
        selecionado_por: userId,
        data_selecao_gestao: now,
      })
    }
  },

  async distributeToAtendente(beneficiarioIds: string[], atendenteId: string): Promise<void> {
    const now = new Date().toISOString()
    for (const id of beneficiarioIds) {
      await pb.collection('beneficiarios').update(id, {
        atendente_id: atendenteId,
        data_distribuicao: now,
        status: 'EM_ATENDIMENTO',
      })
    }
  },
}

// ================= USUÁRIOS & ATENDENTES SERVICE =================
export const UsuariosService = {
  async list(filter = '', sort = 'name') {
    const result = await pb.collection('users').getFullList({
      filter,
      sort,
      requestKey: null,
    })
    return result as unknown as User[]
  },

  async listAtendentes() {
    const result = await pb.collection('users').getFullList({
      filter: 'perfil = "ATENDENTE" && ativo = true',
      sort: 'name',
      requestKey: null,
    })
    return result as unknown as User[]
  },

  async getById(id: string): Promise<User> {
    const record = await pb.collection('users').getOne(id)
    return record as unknown as User
  },

  async create(data: Partial<User> & { password?: string }): Promise<User> {
    const payload: any = {
      ...data,
      password: data.password || 'senha123',
      passwordConfirm: data.password || 'senha123',
      emailVisibility: true,
      verified: true,
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
}

// ================= LOTES SELEÇÃO SERVICE =================
export const LotesService = {
  async list() {
    const records = await pb.collection('lotes_selecao').getFullList({
      sort: '-created',
      expand: 'criado_por',
      requestKey: null,
    })
    return records as unknown as LoteSelecao[]
  },

  async createWithBeneficiarios(
    loteData: {
      lote_id: string
      total_beneficiarios: number
      custo_total: number
      criado_por: string
    },
    beneficiariosList: Array<Partial<Beneficiario>>,
  ) {
    const loteRecord = await pb.collection('lotes_selecao').create({
      ...loteData,
      status: 'PROCESSADO',
      data_selecao: new Date().toISOString(),
    })

    const createdBeneficiarios: Beneficiario[] = []
    for (const b of beneficiariosList) {
      const created = await pb.collection('beneficiarios').create({
        ...b,
        lote_id: loteRecord.id,
        status: b.status || 'ELEGIVEL',
        ativo: true,
        data_selecao: new Date().toISOString(),
      })
      createdBeneficiarios.push(created as unknown as Beneficiario)
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

  /**
   * Atualiza uma ficha com incremento de versão e registro de auditoria em historico_fichas
   */
  async updateWithVersion(
    id: string,
    newData: Partial<FichaAtendimento>,
    userId: string,
    changeDescription = 'Atualização da ficha de atendimento',
  ): Promise<FichaAtendimento> {
    // 1. Obter estado atual
    const current = await pb.collection('fichas_atendimento').getOne(id)
    const newVersion = (current.versao || 1) + 1

    // 2. Registrar no historico_fichas
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
      console.warn('Falha ao gravar historico_fichas (não-bloqueante):', e)
    }

    // 3. Atualizar a ficha
    const updated = await pb.collection('fichas_atendimento').update(id, {
      ...newData,
      versao: newVersion,
    })

    return updated as unknown as FichaAtendimento
  },

  /**
   * Finaliza atendimento com ALTA e dispara simulação de pesquisa de satisfação
   */
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

    // 1. Atualizar ficha com Alta e data de envio de pesquisa
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

    // 2. Atualizar status do beneficiário para ATENDIDO
    try {
      await pb.collection('beneficiarios').update(beneficiarioId, {
        status: 'ATENDIDO',
      })
    } catch (err) {
      console.warn('Erro ao atualizar status beneficiario:', err)
    }

    // 3. Criar registro de pesquisa de satisfação com token público único
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

    // Sincronizar na ficha de atendimento correspondente
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
