migrate(
  (app) => {
    const employees = app.findCollectionByNameOrId('employees')

    // 1. monitoring_flows
    const flows = new Collection({
      name: 'monitoring_flows',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || colaborador_id.id = @request.auth.funcionario_id.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'colaborador_id',
          type: 'relation',
          required: true,
          collectionId: employees.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'ciclo', type: 'text', required: true },
        {
          name: 'status_global',
          type: 'select',
          values: ['em_andamento', 'concluido', 'pausado'],
          maxSelect: 1,
        },
        { name: 'data_inicio', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_flows_colab ON monitoring_flows (colaborador_id)',
        'CREATE INDEX idx_flows_status ON monitoring_flows (status_global)',
        'CREATE INDEX idx_flows_ciclo ON monitoring_flows (ciclo)',
      ],
    })
    app.save(flows)

    // 2. flow_steps
    const flowSteps = new Collection({
      name: 'flow_steps',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'etapa', type: 'number', required: true, min: 1, max: 9, onlyInt: true },
        {
          name: 'status',
          type: 'select',
          values: ['pendente', 'em_andamento', 'concluido'],
          maxSelect: 1,
        },
        { name: 'data_conclusao', type: 'date' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_flowsteps_fluxo ON flow_steps (fluxo_id)',
        'CREATE INDEX idx_flowsteps_etapa ON flow_steps (etapa)',
      ],
    })
    app.save(flowSteps)

    // 3. health_assessments (CLINICAL — LGPD: gestor blocked)
    const healthAssessments = new Collection({
      name: 'health_assessments',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'peso', type: 'number' },
        { name: 'altura', type: 'number' },
        { name: 'fumante', type: 'bool' },
        { name: 'hipertensao', type: 'bool' },
        { name: 'diabetes', type: 'bool' },
        { name: 'colesterol_alto', type: 'bool' },
        { name: 'doenca_cronica', type: 'text' },
        { name: 'medicamentos', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_health_fluxo ON health_assessments (fluxo_id)'],
    })
    app.save(healthAssessments)

    // 4. exams (CLINICAL — gestor can see metadata only if needed, but per prompt: gestor NÃO acessa collections clínicas exams)
    const exams = new Collection({
      name: 'exams',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'tipo_exame',
          type: 'select',
          values: [
            'sangue',
            'urina',
            'audiometria',
            'eletrocardiograma',
            'espirometria',
            'oftalmologico',
          ],
          maxSelect: 1,
        },
        { name: 'data_agendamento', type: 'date' },
        { name: 'data_realizacao', type: 'date' },
        {
          name: 'status',
          type: 'select',
          values: ['agendado', 'realizado', 'laudo_emitido'],
          maxSelect: 1,
        },
        { name: 'resultado', type: 'text' },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_exams_fluxo ON exams (fluxo_id)',
        'CREATE INDEX idx_exams_status ON exams (status)',
      ],
    })
    app.save(exams)

    // 5. medical_reports (CLINICAL — LGPD: gestor blocked)
    const medicalReports = new Collection({
      name: 'medical_reports',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'profissional_saude')",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'diagnostico', type: 'text' },
        {
          name: 'classificacao_risco',
          type: 'select',
          values: ['baixo', 'medio', 'alto'],
          maxSelect: 1,
        },
        {
          name: 'aptidao',
          type: 'select',
          values: ['apto', 'apto_com_restricao', 'inapto_temporario', 'inapto'],
          maxSelect: 1,
        },
        { name: 'recomendacoes', type: 'text' },
        {
          name: 'profissional_id',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'data_emissao', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_reports_fluxo ON medical_reports (fluxo_id)',
        'CREATE INDEX idx_reports_risco ON medical_reports (classificacao_risco)',
      ],
    })
    app.save(medicalReports)

    // 6. followup_plans
    const followupPlans = new Collection({
      name: 'followup_plans',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'acao', type: 'text', required: true },
        {
          name: 'responsavel',
          type: 'select',
          values: ['colaborador', 'gestor', 'profissional'],
          maxSelect: 1,
        },
        { name: 'prazo', type: 'date' },
        { name: 'status', type: 'select', values: ['pendente', 'concluida'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_followup_fluxo ON followup_plans (fluxo_id)',
        'CREATE INDEX idx_followup_status ON followup_plans (status)',
      ],
    })
    app.save(followupPlans)

    // 7. satisfaction_surveys
    const satisfactionSurveys = new Collection({
      name: 'satisfaction_surveys',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || fluxo_id.colaborador_id.id = @request.auth.funcionario_id.id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        {
          name: 'fluxo_id',
          type: 'relation',
          required: true,
          collectionId: flows.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'canais', type: 'select', values: ['email', 'whatsapp'], maxSelect: 2 },
        {
          name: 'status_envio',
          type: 'select',
          values: ['pendente', 'enviado_simulado', 'respondida', 'expirado'],
          maxSelect: 1,
        },
        { name: 'enviado_em', type: 'date' },
        { name: 'nps', type: 'number', min: 0, max: 10, onlyInt: true },
        { name: 'satisfacao', type: 'number', min: 1, max: 5, onlyInt: true },
        { name: 'feedback', type: 'text' },
        { name: 'respondida_em', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_surveys_fluxo ON satisfaction_surveys (fluxo_id)',
        'CREATE INDEX idx_surveys_status ON satisfaction_surveys (status_envio)',
      ],
    })
    app.save(satisfactionSurveys)

    // 8. evaluations (simulated delivery log)
    const evaluations = new Collection({
      name: 'evaluations',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'destinatario', type: 'text', required: true },
        { name: 'tipo', type: 'select', values: ['email', 'whatsapp'], maxSelect: 1 },
        { name: 'conteudo', type: 'text' },
        {
          name: 'status',
          type: 'select',
          values: ['simulado_enviado', 'falha_simulada'],
          maxSelect: 1,
        },
        { name: 'enviado_em', type: 'date' },
        { name: 'criado_por', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_evaluations_tipo ON evaluations (tipo)',
        'CREATE INDEX idx_evaluations_enviado ON evaluations (enviado_em)',
      ],
    })
    app.save(evaluations)
  },
  (app) => {
    const toDelete = [
      'evaluations',
      'satisfaction_surveys',
      'followup_plans',
      'medical_reports',
      'exams',
      'health_assessments',
      'flow_steps',
      'monitoring_flows',
    ]
    for (const name of toDelete) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
