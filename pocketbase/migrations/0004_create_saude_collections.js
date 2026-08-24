migrate(
  (app) => {
    // 1. Atualizar users auth collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    if (!users.fields.getByName('perfil')) {
      users.fields.add(
        new SelectField({
          name: 'perfil',
          values: ['GESTOR', 'RH', 'ATENDENTE'],
          maxSelect: 1,
        }),
      )
    }

    if (!users.fields.getByName('registro_profissional')) {
      users.fields.add(
        new TextField({
          name: 'registro_profissional',
        }),
      )
    }

    if (!users.fields.getByName('tipo_profissional')) {
      users.fields.add(
        new SelectField({
          name: 'tipo_profissional',
          values: ['ENFERMEIRO', 'MEDICO'],
          maxSelect: 1,
        }),
      )
    }

    if (!users.fields.getByName('unidade_regiao')) {
      users.fields.add(
        new TextField({
          name: 'unidade_regiao',
        }),
      )
    }

    if (!users.fields.getByName('ativo')) {
      users.fields.add(
        new BoolField({
          name: 'ativo',
        }),
      )
    }

    app.save(users)

    // 2. Criar lotes_selecao
    const lotesSelecao = new Collection({
      name: 'lotes_selecao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'lote_id', type: 'text', required: true },
        { name: 'data_selecao', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['IMPORTADO', 'PROCESSADO', 'ERRO'],
          maxSelect: 1,
        },
        { name: 'total_beneficiarios', type: 'number' },
        { name: 'custo_total', type: 'number' },
        { name: 'criado_por', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_lotes_lote_id ON lotes_selecao (lote_id)',
        'CREATE INDEX idx_lotes_status ON lotes_selecao (status)',
      ],
    })
    app.save(lotesSelecao)

    // 3. Criar planos_acao
    const planosAcao = new Collection({
      name: 'planos_acao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'necessidade_identificada', type: 'text', required: true },
        { name: 'objetivo', type: 'text', required: true },
        { name: 'acao_tomada', type: 'text' },
        { name: 'prazo_acao_dias', type: 'number' },
        {
          name: 'prioridade',
          type: 'select',
          values: ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE'],
          maxSelect: 1,
        },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_planos_prioridade ON planos_acao (prioridade)',
        'CREATE INDEX idx_planos_ativo ON planos_acao (ativo)',
      ],
    })
    app.save(planosAcao)

    // 4. Criar beneficiarios
    const beneficiarios = new Collection({
      name: 'beneficiarios',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'id_externo', type: 'text' },
        { name: 'nome_beneficiario', type: 'text', required: true },
        { name: 'matricula', type: 'text', required: true },
        { name: 'unidade_regiao', type: 'text' },
        { name: 'tipo_vinculo', type: 'select', values: ['TITULAR', 'DEPENDENTE'], maxSelect: 1 },
        { name: 'faixa_etaria', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'celular', type: 'text' },
        { name: 'email', type: 'text' },
        { name: 'custo_12_meses', type: 'number' },
        { name: 'data_selecao', type: 'date' },
        { name: 'lote_id', type: 'relation', collectionId: lotesSelecao.id, maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['ELEGIVEL', 'SELECIONADO', 'EM_ATENDIMENTO', 'ATENDIDO', 'INATIVO'],
          maxSelect: 1,
        },
        { name: 'condicao_principal', type: 'text' },
        {
          name: 'risco',
          type: 'select',
          values: ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'],
          maxSelect: 1,
        },
        { name: 'permite_contato_whatsapp_sms', type: 'bool' },
        {
          name: 'selecionado_por',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'data_selecao_gestao', type: 'date' },
        { name: 'atendente_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'data_distribuicao', type: 'date' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_beneficiarios_matr ON beneficiarios (matricula)',
        'CREATE INDEX idx_beneficiarios_status ON beneficiarios (status)',
        'CREATE INDEX idx_beneficiarios_risco ON beneficiarios (risco)',
        'CREATE INDEX idx_beneficiarios_atendente ON beneficiarios (atendente_id)',
        'CREATE INDEX idx_beneficiarios_lote ON beneficiarios (lote_id)',
      ],
    })
    app.save(beneficiarios)

    // Adicionar campo auto-referencial titular_id em beneficiarios
    beneficiarios.fields.add(
      new RelationField({
        name: 'titular_id',
        collectionId: beneficiarios.id,
        maxSelect: 1,
      }),
    )
    app.save(beneficiarios)

    // 5. Criar controle_programas
    const controleProgramas = new Collection({
      name: 'controle_programas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'beneficiario_id',
          type: 'relation',
          required: true,
          collectionId: beneficiarios.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'condicao_principal', type: 'text' },
        {
          name: 'risco',
          type: 'select',
          values: ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'],
          maxSelect: 1,
        },
        { name: 'data_selecao', type: 'date' },
        { name: 'responsavel', type: 'text' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_programas_beneficiario ON controle_programas (beneficiario_id)',
        'CREATE INDEX idx_programas_risco ON controle_programas (risco)',
      ],
    })
    app.save(controleProgramas)

    // 6. Criar fichas_atendimento
    const fichasAtendimento = new Collection({
      name: 'fichas_atendimento',
      type: 'base',
      // Public view rule for survey token resolution if needed or auth
      listRule: "@request.auth.id != ''",
      viewRule: '', // Public read so public survey can fetch by id/token link
      createRule: "@request.auth.id != ''",
      updateRule: '', // Allow update for public satisfaction feedback submit as well as auth
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'ficha_id', type: 'text' },
        {
          name: 'beneficiario_id',
          type: 'relation',
          required: true,
          collectionId: beneficiarios.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'atendente_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'plano_acao_id', type: 'relation', collectionId: planosAcao.id, maxSelect: 1 },
        {
          name: 'controle_programa_id',
          type: 'relation',
          collectionId: controleProgramas.id,
          maxSelect: 1,
        },
        {
          name: 'meio_contato',
          type: 'select',
          values: ['LIGACAO_TELEFONICA', 'WHATSAPP', 'EMAIL', 'SMS'],
          maxSelect: 1,
        },
        { name: 'condicao_principal', type: 'text' },
        { name: 'data_contato', type: 'date' },
        {
          name: 'risco',
          type: 'select',
          values: ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO'],
          maxSelect: 1,
        },
        {
          name: 'status_contato',
          type: 'select',
          values: ['ATENDIDO', 'OCUPADO', 'SEM_RESPOSTA', 'CONTATO_INCORRETO'],
          maxSelect: 1,
        },
        { name: 'descricao_atendimento', type: 'text' },
        { name: 'data_proximo_contato', type: 'date' },
        { name: 'responsavel', type: 'text' },
        { name: 'meta', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'pendencias', type: 'text' },
        {
          name: 'status_geral',
          type: 'select',
          values: [
            'EM_ACOMPANHAMENTO',
            'ALTA',
            'DESISTENCIA',
            'AGUARDANDO_RETORNO',
            'PROXIMO_CONTATO',
          ],
          maxSelect: 1,
        },
        { name: 'data_alta', type: 'date' },
        { name: 'feedback', type: 'number', min: 0, max: 5 },
        { name: 'data_envio_pesquisa', type: 'date' },
        { name: 'data_resposta_pesquisa', type: 'date' },
        { name: 'versao', type: 'number' },
        { name: 'ativo', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_fichas_beneficiario ON fichas_atendimento (beneficiario_id)',
        'CREATE INDEX idx_fichas_atendente ON fichas_atendimento (atendente_id)',
        'CREATE INDEX idx_fichas_status ON fichas_atendimento (status_geral)',
        'CREATE INDEX idx_fichas_risco ON fichas_atendimento (risco)',
      ],
    })
    app.save(fichasAtendimento)

    // 7. Criar historico_fichas
    const historicoFichas = new Collection({
      name: 'historico_fichas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'ficha_id',
          type: 'relation',
          required: true,
          collectionId: fichasAtendimento.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'dados_anteriores', type: 'json' },
        { name: 'campo_alterado', type: 'text' },
        { name: 'valor_anterior', type: 'text' },
        { name: 'valor_novo', type: 'text' },
        { name: 'alterado_por', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_historico_ficha ON historico_fichas (ficha_id)'],
    })
    app.save(historicoFichas)

    // 8. Criar apontamentos_rh
    const apontamentosRh = new Collection({
      name: 'apontamentos_rh',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'lote_id', type: 'relation', collectionId: lotesSelecao.id, maxSelect: 1 },
        {
          name: 'tipo_apontamento',
          type: 'select',
          values: ['SELECAO', 'EVOLUCAO', 'VOLUMETRIA', 'CUSTO'],
          maxSelect: 1,
        },
        { name: 'descricao', type: 'text' },
        { name: 'periodo_referencia', type: 'text' },
        { name: 'metricas', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(apontamentosRh)

    // 9. Criar dashboard_cache
    const dashboardCache = new Collection({
      name: 'dashboard_cache',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'atendente_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        {
          name: 'tipo_dashboard',
          type: 'select',
          values: ['ATENDENTE', 'GESTOR', 'COMPARATIVO', 'SATISFACAO'],
          maxSelect: 1,
        },
        { name: 'periodo_referencia', type: 'text' },
        { name: 'indicadores', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(dashboardCache)

    // 10. Criar pesquisas_satisfacao (Public read & write via token)
    const pesquisasSatisfacao = new Collection({
      name: 'pesquisas_satisfacao',
      type: 'base',
      listRule: '', // Public list/view so anyone with token can find it
      viewRule: '',
      createRule: "@request.auth.id != ''",
      updateRule: '', // Public update to submit note & comments
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'ficha_id',
          type: 'relation',
          required: true,
          collectionId: fichasAtendimento.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'token', type: 'text', required: true },
        { name: 'nota', type: 'number', min: 0, max: 5 },
        { name: 'comentario', type: 'text' },
        { name: 'data_envio', type: 'date' },
        { name: 'data_resposta', type: 'date' },
        { name: 'canal', type: 'select', values: ['EMAIL', 'WHATSAPP'], maxSelect: 1 },
        {
          name: 'status',
          type: 'select',
          values: ['ENVIADO', 'RESPONDIDO', 'EXPIRADO'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_pesquisas_token ON pesquisas_satisfacao (token)',
        'CREATE INDEX idx_pesquisas_ficha ON pesquisas_satisfacao (ficha_id)',
        'CREATE INDEX idx_pesquisas_status ON pesquisas_satisfacao (status)',
      ],
    })
    app.save(pesquisasSatisfacao)

    // 11. Criar logs_auditoria
    const logsAuditoria = new Collection({
      name: 'logs_auditoria',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'usuario_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'acao', type: 'text', required: true },
        { name: 'entidade', type: 'text', required: true },
        { name: 'entidade_id', type: 'text' },
        { name: 'dados_sensiveis', type: 'bool' },
        { name: 'detalhes', type: 'json' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_logs_usuario ON logs_auditoria (usuario_id)',
        'CREATE INDEX idx_logs_entidade ON logs_auditoria (entidade)',
      ],
    })
    app.save(logsAuditoria)
  },
  (app) => {
    const toDelete = [
      'logs_auditoria',
      'pesquisas_satisfacao',
      'dashboard_cache',
      'apontamentos_rh',
      'historico_fichas',
      'fichas_atendimento',
      'controle_programas',
      'beneficiarios',
      'planos_acao',
      'lotes_selecao',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
