migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const employeesCol = app.findCollectionByNameOrId('employees')
    const flowsCol = app.findCollectionByNameOrId('monitoring_flows')
    const flowStepsCol = app.findCollectionByNameOrId('flow_steps')
    const healthCol = app.findCollectionByNameOrId('health_assessments')
    const examsCol = app.findCollectionByNameOrId('exams')
    const reportsCol = app.findCollectionByNameOrId('medical_reports')
    const followupCol = app.findCollectionByNameOrId('followup_plans')
    const surveysCol = app.findCollectionByNameOrId('satisfaction_surveys')
    const evaluationsCol = app.findCollectionByNameOrId('evaluations')

    // Helper to upsert user
    function upsertUser(email, pass, name, role, funcionarioId = null) {
      let user
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        user = new Record(users)
        user.setEmail(email)
        user.setPassword(pass)
      }
      user.setVerified(true)
      user.set('name', name)
      user.set('role', role)
      if (funcionarioId) {
        user.set('funcionario_id', funcionarioId)
      }
      app.save(user)
      return user
    }

    // Helper to upsert employee
    function upsertEmployee(data) {
      let emp
      try {
        emp = app.findFirstRecordByData('employees', 'matricula', data.matricula)
      } catch (_) {
        emp = new Record(employeesCol)
      }
      for (const key of Object.keys(data)) {
        emp.set(key, data[key])
      }
      app.save(emp)
      return emp
    }

    // 1. Seed Admin
    const adminUser = upsertUser(
      'paulotmfranco@gmail.com',
      'Skip@Pass',
      'Paulo Franco (Admin)',
      'admin',
    )

    // 2. Seed Gestor
    const gestorUser = upsertUser(
      'carla.souza@empresa.com.br',
      'Skip@Pass',
      'Carla Souza (Gestora RH)',
      'gestor',
    )

    // 3. Seed Profissional
    const docUser = upsertUser(
      'dr.roberto@empresa.com.br',
      'Skip@Pass',
      'Dr. Roberto Martins',
      'profissional_saude',
    )

    // 4. Seed Employees
    const empAna = upsertEmployee({
      nome: 'Ana Oliveira',
      email: 'ana.oliveira@empresa.com.br',
      cpf: '111.222.333-44',
      matricula: '1001',
      cargo: 'Assistente Administrativa',
      departamento: 'Recursos Humanos',
      unidade: 'Matriz - São Paulo',
      data_admissao: '2022-03-15',
      data_nascimento: '1994-08-20',
      genero: 'feminino',
      telefone: '(11) 98765-4321',
      risco_ocupacional: 'baixo',
      gerente_id: gestorUser.id,
      consentimento_lgpd: true,
      data_consentimento: '2025-01-10',
      status: 'ativo',
    })

    const empBruno = upsertEmployee({
      nome: 'Bruno Santos',
      email: 'bruno.santos@empresa.com.br',
      cpf: '222.333.444-55',
      matricula: '1002',
      cargo: 'Analista de Sistemas Pleno',
      departamento: 'Tecnologia da Informação',
      unidade: 'Matriz - São Paulo',
      data_admissao: '2021-06-01',
      data_nascimento: '1990-12-05',
      genero: 'masculino',
      telefone: '(11) 97654-3210',
      risco_ocupacional: 'medio',
      gerente_id: gestorUser.id,
      consentimento_lgpd: true,
      data_consentimento: '2025-01-12',
      status: 'ativo',
    })

    const empCarla = upsertEmployee({
      nome: 'Carla Mendes',
      email: 'carla.mendes@empresa.com.br',
      cpf: '333.444.555-66',
      matricula: '1003',
      cargo: 'Supervisora de Produção',
      departamento: 'Operações',
      unidade: 'Planta Industrial - Campinas',
      data_admissao: '2019-11-20',
      data_nascimento: '1988-04-14',
      genero: 'feminino',
      telefone: '(19) 98123-4567',
      risco_ocupacional: 'medio',
      gerente_id: gestorUser.id,
      consentimento_lgpd: true,
      data_consentimento: '2025-01-15',
      status: 'ativo',
    })

    const empDiego = upsertEmployee({
      nome: 'Diego Pereira',
      email: 'diego.pereira@empresa.com.br',
      cpf: '444.555.666-77',
      matricula: '1004',
      cargo: 'Operador de Máquina CNC',
      departamento: 'Produção',
      unidade: 'Planta Industrial - Campinas',
      data_admissao: '2023-01-10',
      data_nascimento: '1996-09-30',
      genero: 'masculino',
      telefone: '(19) 97234-5678',
      risco_ocupacional: 'alto',
      gerente_id: gestorUser.id,
      consentimento_lgpd: true,
      data_consentimento: '2025-01-20',
      status: 'ativo',
    })

    const empElisa = upsertEmployee({
      nome: 'Elisa Cardoso',
      email: 'elisa.cardoso@empresa.com.br',
      cpf: '555.666.777-88',
      matricula: '1005',
      cargo: 'Desenvolvedora Frontend',
      departamento: 'Tecnologia da Informação',
      unidade: 'Remoto - Belo Horizonte',
      data_admissao: '2023-08-01',
      data_nascimento: '1997-02-18',
      genero: 'feminino',
      telefone: '(31) 98345-6789',
      risco_ocupacional: 'baixo',
      gerente_id: gestorUser.id,
      consentimento_lgpd: true,
      data_consentimento: '2025-02-01',
      status: 'ativo',
    })

    const empFelipe = upsertEmployee({
      nome: 'Felipe Almeida',
      email: 'felipe.almeida@empresa.com.br',
      cpf: '666.777.888-99',
      matricula: '1006',
      cargo: 'Técnico de Logística',
      departamento: 'Operações',
      unidade: 'Centro de Distribuição - Santos',
      data_admissao: '2024-02-15',
      data_nascimento: '1999-10-10',
      genero: 'masculino',
      telefone: '(13) 99456-7890',
      risco_ocupacional: 'medio',
      gerente_id: gestorUser.id,
      consentimento_lgpd: false,
      data_consentimento: null,
      status: 'ativo',
    })

    // Seed Colaborador user linked to Ana
    upsertUser('ana.oliveira@empresa.com.br', 'Skip@Pass', 'Ana Oliveira', 'colaborador', empAna.id)

    // Helper to create flow with steps
    function seedFlowWithSteps(employee, maxCompletedStep, flowStatus = 'em_andamento') {
      let flow
      try {
        const records = app.findRecordsByFilter(
          'monitoring_flows',
          `colaborador_id = '${employee.id}' && ciclo = '2025-1'`,
          '-created',
          1,
          0,
        )
        if (records && records.length > 0) {
          flow = records[0]
        }
      } catch (_) {}

      if (!flow) {
        flow = new Record(flowsCol)
        flow.set('colaborador_id', employee.id)
        flow.set('ciclo', '2025-1')
        flow.set('status_global', flowStatus)
        flow.set('data_inicio', '2025-01-10')
        app.save(flow)
      } else {
        flow.set('status_global', flowStatus)
        app.save(flow)
      }

      const stepNames = [
        'Cadastro do Colaborador',
        'Consentimento LGPD',
        'Avaliação de Saúde (Triagem)',
        'Agendamento de Exames',
        'Realização de Exames',
        'Emissão de Laudo Médico',
        'Classificação de Risco',
        'Plano de Acompanhamento',
        'Pesquisa de Satisfação',
      ]

      for (let stepNum = 1; stepNum <= 9; stepNum++) {
        let step
        try {
          const found = app.findRecordsByFilter(
            'flow_steps',
            `fluxo_id = '${flow.id}' && etapa = ${stepNum}`,
            '-created',
            1,
            0,
          )
          if (found && found.length > 0) step = found[0]
        } catch (_) {}

        if (!step) {
          step = new Record(flowStepsCol)
          step.set('fluxo_id', flow.id)
          step.set('etapa', stepNum)
        }

        if (stepNum <= maxCompletedStep) {
          step.set('status', 'concluido')
          step.set('data_conclusao', '2025-02-10')
          step.set('observacoes', `${stepNames[stepNum - 1]} concluída com sucesso.`)
        } else if (stepNum === maxCompletedStep + 1) {
          step.set('status', 'em_andamento')
          step.set('data_conclusao', null)
          step.set('observacoes', `Aguardando andamento de ${stepNames[stepNum - 1]}.`)
        } else {
          step.set('status', 'pendente')
          step.set('data_conclusao', null)
          step.set('observacoes', 'Etapa aguardando conclusão das anteriores.')
        }
        app.save(step)
      }

      return flow
    }

    // Ana: Completed all 9 steps
    const flowAna = seedFlowWithSteps(empAna, 9, 'concluido')
    // Bruno: Through step 8 completed, step 9 in progress (survey pending)
    const flowBruno = seedFlowWithSteps(empBruno, 8, 'em_andamento')
    // Carla: Through step 7, risk medio
    const flowCarla = seedFlowWithSteps(empCarla, 7, 'em_andamento')
    // Diego: Through step 4, exams scheduled
    const flowDiego = seedFlowWithSteps(empDiego, 4, 'em_andamento')
    // Elisa: Through step 3, triage completed
    const flowElisa = seedFlowWithSteps(empElisa, 3, 'em_andamento')
    // Felipe: Step 1 completed, LGPD consent pending
    const flowFelipe = seedFlowWithSteps(empFelipe, 1, 'em_andamento')

    // Health assessments
    function upsertAssessment(flowId, data) {
      let rec
      try {
        rec = app.findFirstRecordByData('health_assessments', 'fluxo_id', flowId)
      } catch (_) {
        rec = new Record(healthCol)
        rec.set('fluxo_id', flowId)
      }
      for (const k of Object.keys(data)) {
        rec.set(k, data[k])
      }
      app.save(rec)
    }

    upsertAssessment(flowAna.id, {
      peso: 62.5,
      altura: 1.68,
      fumante: false,
      hipertensao: false,
      diabetes: false,
      colesterol_alto: false,
      doenca_cronica: 'Nenhuma',
      medicamentos: 'Polivitamínico diário',
      observacoes: 'Pratica corrida 3x por semana. Alimentação balanceada.',
    })

    upsertAssessment(flowBruno.id, {
      peso: 86.0,
      altura: 1.78,
      fumante: false,
      hipertensao: true,
      diabetes: false,
      colesterol_alto: true,
      doenca_cronica: 'Hipertensão arterial estágio 1',
      medicamentos: 'Losartana 50mg',
      observacoes: 'Sedentarismo relatado devido a longas horas de trabalho no computador.',
    })

    upsertAssessment(flowCarla.id, {
      peso: 71.0,
      altura: 1.65,
      fumante: true,
      hipertensao: false,
      diabetes: false,
      colesterol_alto: false,
      doenca_cronica: 'Asma leve intermitente',
      medicamentos: 'Salbutamol spray quando necessário',
      observacoes: 'Fumante há 8 anos (cerca de 5 cigarros/dia). Deseja suporte para cessação.',
    })

    upsertAssessment(flowDiego.id, {
      peso: 94.0,
      altura: 1.74,
      fumante: false,
      hipertensao: true,
      diabetes: true,
      colesterol_alto: true,
      doenca_cronica: 'Diabetes Tipo 2 e Hipertensão',
      medicamentos: 'Metformina 850mg, Enalapril 20mg',
      observacoes: 'Trabalho em turnos na fábrica. Histórico familiar de cardiopatia.',
    })

    upsertAssessment(flowElisa.id, {
      peso: 58.0,
      altura: 1.62,
      fumante: false,
      hipertensao: false,
      diabetes: false,
      colesterol_alto: false,
      doenca_cronica: 'Enxaqueca crônica',
      medicamentos: 'Sumatriptano SOS',
      observacoes: 'Ergonomia no home office avaliada recentemente.',
    })

    // Exams
    function upsertExam(flowId, tipo, dataAgend, dataRealiz, status, res, obs) {
      let rec
      try {
        const found = app.findRecordsByFilter(
          'exams',
          `fluxo_id = '${flowId}' && tipo_exame = '${tipo}'`,
          '-created',
          1,
          0,
        )
        if (found && found.length > 0) rec = found[0]
      } catch (_) {}

      if (!rec) {
        rec = new Record(examsCol)
        rec.set('fluxo_id', flowId)
        rec.set('tipo_exame', tipo)
      }
      rec.set('data_agendamento', dataAgend)
      rec.set('data_realizacao', dataRealiz)
      rec.set('status', status)
      rec.set('resultado', res)
      rec.set('observacoes', obs)
      app.save(rec)
    }

    upsertExam(
      flowAna.id,
      'sangue',
      '2025-01-20',
      '2025-01-22',
      'laudo_emitido',
      'Hemograma normal, glicemia 88 mg/dL, colesterol total 172 mg/dL.',
      'Valores dentro dos limites de referência.',
    )
    upsertExam(
      flowAna.id,
      'eletrocardiograma',
      '2025-01-20',
      '2025-01-22',
      'laudo_emitido',
      'Ritmo sinusal normal, FC 68 bpm. Sem alterações de repolarização.',
      'Eletrocardiograma de repouso normal.',
    )

    upsertExam(
      flowBruno.id,
      'sangue',
      '2025-01-25',
      '2025-01-27',
      'laudo_emitido',
      'Glicemia 98 mg/dL, Colesterol Total 235 mg/dL (Alto), Triglicerídeos 190 mg/dL.',
      'Dislipidemia moderada.',
    )
    upsertExam(
      flowBruno.id,
      'eletrocardiograma',
      '2025-01-25',
      '2025-01-27',
      'laudo_emitido',
      'Ritmo sinusal, FC 74 bpm. Sobrecarga ventricular esquerda discreta.',
      'Acompanhar com cardiologista.',
    )

    upsertExam(
      flowCarla.id,
      'espirometria',
      '2025-02-01',
      '2025-02-03',
      'laudo_emitido',
      'Distúrbio ventilatório obstrutivo leve com resposta positiva ao broncodilatador.',
      'Compatível com quadro asmático.',
    )
    upsertExam(
      flowCarla.id,
      'audiometria',
      '2025-02-01',
      '2025-02-03',
      'realizado',
      'Exame concluído, aguardando parecer final.',
      'Audiometria ocupacional para área de produção.',
    )

    upsertExam(
      flowDiego.id,
      'audiometria',
      '2025-02-15',
      null,
      'agendado',
      '',
      'Agendado na clínica conveniada Campinas.',
    )
    upsertExam(
      flowDiego.id,
      'oftalmologico',
      '2025-02-18',
      null,
      'agendado',
      '',
      'Avaliação de acuidade visual para operador.',
    )

    // Medical reports
    function upsertReport(flowId, diag, risco, apt, rec, profId, data) {
      let report
      try {
        const found = app.findRecordsByFilter(
          'medical_reports',
          `fluxo_id = '${flowId}'`,
          '-created',
          1,
          0,
        )
        if (found && found.length > 0) report = found[0]
      } catch (_) {}

      if (!report) {
        report = new Record(reportsCol)
        report.set('fluxo_id', flowId)
      }
      report.set('diagnostico', diag)
      report.set('classificacao_risco', risco)
      report.set('aptidao', apt)
      report.set('recomendacoes', rec)
      report.set('profissional_id', profId)
      report.set('data_emissao', data)
      app.save(report)
    }

    upsertReport(
      flowAna.id,
      'Colaboradora hígida, sem restrições clínicas ou ocupacionais identificadas.',
      'baixo',
      'apto',
      'Manter rotina de atividades físicas e alimentação equilibrada. Repetir acompanhamento em 12 meses.',
      docUser.id,
      '2025-01-25',
    )
    upsertReport(
      flowBruno.id,
      'Hipertensão arterial sistêmica controlada e dislipidemia mista.',
      'medio',
      'apto_com_restricao',
      'Revisão com cardiologista, reavaliação nutricional e inclusão no programa de pausas ativas / ginástica laboral.',
      docUser.id,
      '2025-01-30',
    )
    upsertReport(
      flowCarla.id,
      'Asma brônquica leve sob controle e tabagismo ativo.',
      'medio',
      'apto_com_restricao',
      'Encaminhamento ao programa antitabágico corporativo e uso obrigatório de EPI auditivo e respiratório na planta.',
      docUser.id,
      '2025-02-05',
    )

    // Followup plans
    function upsertFollowup(flowId, acao, resp, prazo, status) {
      let plan
      try {
        const found = app.findRecordsByFilter(
          'followup_plans',
          `fluxo_id = '${flowId}' && acao = '${acao}'`,
          '-created',
          1,
          0,
        )
        if (found && found.length > 0) plan = found[0]
      } catch (_) {}

      if (!plan) {
        plan = new Record(followupCol)
        plan.set('fluxo_id', flowId)
        plan.set('acao', acao)
      }
      plan.set('responsavel', resp)
      plan.set('prazo', prazo)
      plan.set('status', status)
      app.save(plan)
    }

    upsertFollowup(
      flowAna.id,
      'Realizar check-up preventivo anual e manter registro de atividade física',
      'colaborador',
      '2025-12-15',
      'concluida',
    )
    upsertFollowup(
      flowBruno.id,
      'Consulta de retorno com cardiologista com laudos laboratoriais',
      'colaborador',
      '2025-03-30',
      'pendente',
    )
    upsertFollowup(
      flowBruno.id,
      'Ajuste de posto de trabalho ergonômico na estação de TI',
      'gestor',
      '2025-02-28',
      'concluida',
    )
    upsertFollowup(
      flowCarla.id,
      'Participação na oficina de cessação do tabagismo',
      'colaborador',
      '2025-03-15',
      'pendente',
    )
    upsertFollowup(
      flowCarla.id,
      'Fiscalização periódica do uso de protetor auricular na linha 2',
      'gestor',
      '2025-02-28',
      'pendente',
    )

    // Satisfaction Surveys
    function upsertSurvey(flowId, canais, status, envEm, nps, sat, feedback, respEm) {
      let survey
      try {
        survey = app.findFirstRecordByData('satisfaction_surveys', 'fluxo_id', flowId)
      } catch (_) {
        survey = new Record(surveysCol)
        survey.set('fluxo_id', flowId)
      }
      survey.set('canais', canais)
      survey.set('status_envio', status)
      survey.set('enviado_em', envEm)
      survey.set('nps', nps)
      survey.set('satisfacao', sat)
      survey.set('feedback', feedback)
      survey.set('respondida_em', respEm)
      app.save(survey)
    }

    upsertSurvey(
      flowAna.id,
      ['email', 'whatsapp'],
      'respondida',
      '2025-01-26',
      9,
      5,
      'Atendimento excelente do Dr. Roberto! Muito claro nas orientações e a clínica foi super rápida.',
      '2025-01-27',
    )
    upsertSurvey(flowBruno.id, ['email'], 'enviado_simulado', '2025-02-01', null, null, '', null)
    upsertSurvey(flowCarla.id, ['whatsapp'], 'pendente', null, null, null, '', null)

    // Evaluations (Simulated send logs)
    function upsertEval(dest, tipo, cont, st, envEm, criadoPor) {
      let evalRec
      try {
        const found = app.findRecordsByFilter(
          'evaluations',
          `destinatario = '${dest}' && tipo = '${tipo}'`,
          '-created',
          1,
          0,
        )
        if (found && found.length > 0) evalRec = found[0]
      } catch (_) {}

      if (!evalRec) {
        evalRec = new Record(evaluationsCol)
        evalRec.set('destinatario', dest)
        evalRec.set('tipo', tipo)
      }
      evalRec.set('conteudo', cont)
      evalRec.set('status', st)
      evalRec.set('enviado_em', envEm)
      evalRec.set('criado_por', criadoPor)
      app.save(evalRec)
    }

    upsertEval(
      'ana.oliveira@empresa.com.br',
      'email',
      'Olá Ana, seu ciclo de saúde 2025-1 foi concluído. Por favor, responda nossa pesquisa de satisfação.',
      'simulado_enviado',
      '2025-01-26',
      adminUser.id,
    )

    upsertEval(
      '+55 (11) 98765-4321',
      'whatsapp',
      'Olá Ana! Acompanhamento de Saúde: avalie o atendimento da sua triagem e exames no link seguro.',
      'simulado_enviado',
      '2025-01-26',
      adminUser.id,
    )

    upsertEval(
      'bruno.santos@empresa.com.br',
      'email',
      'Olá Bruno, seu laudo médico está disponível. Conte-nos como foi sua experiência no programa.',
      'simulado_enviado',
      '2025-02-01',
      adminUser.id,
    )
  },
  (app) => {
    // rollback seed if needed
  },
)
