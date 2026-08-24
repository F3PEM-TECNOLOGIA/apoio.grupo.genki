migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const lotesCol = app.findCollectionByNameOrId('lotes_selecao')
    const planosCol = app.findCollectionByNameOrId('planos_acao')
    const benefCol = app.findCollectionByNameOrId('beneficiarios')
    const progCol = app.findCollectionByNameOrId('controle_programas')
    const fichasCol = app.findCollectionByNameOrId('fichas_atendimento')
    const pesquisasCol = app.findCollectionByNameOrId('pesquisas_satisfacao')

    // Helper para criar ou atualizar usuário
    function seedUser(
      email,
      pass,
      name,
      perfil,
      tipoProf = null,
      regProf = '',
      unidade = 'São Paulo',
    ) {
      let user
      try {
        user = app.findAuthRecordByEmail('_pb_users_auth_', email)
      } catch (_) {
        user = new Record(users)
        user.setEmail(email)
      }
      user.setPassword(pass)
      user.setVerified(true)
      user.set('name', name)
      user.set('perfil', perfil)
      if (tipoProf) user.set('tipo_profissional', tipoProf)
      if (regProf) user.set('registro_profissional', regProf)
      user.set('unidade_regiao', unidade)
      user.set('ativo', true)
      app.save(user)
      return user
    }

    // 1. Seed Usuários obrigatórios
    const gestor = seedUser(
      'gestor@saude.com',
      '12345678',
      'Dr. Carlos Gestor',
      'GESTOR',
      'MEDICO',
      'CRM/SP 123456',
      'São Paulo',
    )
    const rh = seedUser('rh@saude.com', '12345678', 'Ana RH', 'RH', null, '', 'São Paulo')
    const atendente1 = seedUser(
      'atendente@saude.com',
      '12345678',
      'Enf. Paulo',
      'ATENDENTE',
      'ENFERMEIRO',
      'COREN/SP 654321',
      'São Paulo',
    )
    const atendente2 = seedUser(
      'atendente2@saude.com',
      '12345678',
      'Dra. Marina',
      'ATENDENTE',
      'MEDICO',
      'CRM/RJ 987654',
      'Rio de Janeiro',
    )
    // Seed current user for convenience
    seedUser(
      'paulotmfranco@gmail.com',
      'Skip@Pass',
      'Paulo Franco (Admin)',
      'GESTOR',
      'MEDICO',
      'CRM/SP 999999',
      'São Paulo',
    )

    // 2. Seed Lotes de Seleção (2 lotes)
    let lote1
    try {
      lote1 = app.findFirstRecordByData('lotes_selecao', 'lote_id', 'LOTE-2025-01')
    } catch (_) {
      lote1 = new Record(lotesCol)
      lote1.set('lote_id', 'LOTE-2025-01')
      lote1.set('data_selecao', '2025-01-15 10:00:00.000Z')
      lote1.set('status', 'PROCESSADO')
      lote1.set('total_beneficiarios', 6)
      lote1.set('custo_total', 45600.5)
      lote1.set('criado_por', gestor.id)
      app.save(lote1)
    }

    let lote2
    try {
      lote2 = app.findFirstRecordByData('lotes_selecao', 'lote_id', 'LOTE-2025-02')
    } catch (_) {
      lote2 = new Record(lotesCol)
      lote2.set('lote_id', 'LOTE-2025-02')
      lote2.set('data_selecao', '2025-02-10 14:30:00.000Z')
      lote2.set('status', 'PROCESSADO')
      lote2.set('total_beneficiarios', 4)
      lote2.set('custo_total', 38200.0)
      lote2.set('criado_por', gestor.id)
      app.save(lote2)
    }

    // 3. Seed Planos de Ação (5 planos)
    const planosData = [
      {
        necessidade_identificada:
          'Hipertensão arterial não controlada com picos pressóricos frequentes',
        objetivo: 'Estabilizar PA < 130/80 mmHg com adesão medicamentosa e diário de aferição',
        acao_tomada:
          'Encaminhamento para cardiologista, ajuste de posologia e orientações sobre redução de sódio',
        prazo_acao_dias: 30,
        prioridade: 'ALTA',
        ativo: true,
      },
      {
        necessidade_identificada: 'Diabetes Mellitus Tipo 2 com hemoglobina glicada > 9.0%',
        objetivo: 'Reduzir HbA1c para < 7.0% e instituir automonitoramento capilar',
        acao_tomada: 'Agendamento de consulta com endocrinologista e nutricionista esportivo',
        prazo_acao_dias: 45,
        prioridade: 'URGENTE',
        ativo: true,
      },
      {
        necessidade_identificada: 'Acompanhamento Nutricional e Obesidade Grau II',
        objetivo: 'Perda ponderal progressiva de 5% a 10% do peso corporal em 6 meses',
        acao_tomada: 'Inserção no grupo de reeducação alimentar e prescrição de plano alimentar',
        prazo_acao_dias: 60,
        prioridade: 'MEDIA',
        ativo: true,
      },
      {
        necessidade_identificada: 'Reabilitação Cardíaca pós-evento coronariano agudo',
        objetivo: 'Restaurar capacidade funcional e tolerância a esforços sem sintomas anginosos',
        acao_tomada: 'Início de fisioterapia cardiovascular supervisionada 3x/semana',
        prazo_acao_dias: 90,
        prioridade: 'URGENTE',
        ativo: true,
      },
      {
        necessidade_identificada: 'Cessação do Tabagismo (Fumante pesado > 20 cigarros/dia)',
        objetivo: 'Abstinência tabágica completa em até 60 dias com suporte multiprofissional',
        acao_tomada: 'Terapia de reposição de nicotina e suporte psicológico semanal',
        prazo_acao_dias: 60,
        prioridade: 'MEDIA',
        ativo: true,
      },
    ]

    const createdPlanos = []
    for (const p of planosData) {
      let rec
      try {
        rec = app.findFirstRecordByData(
          'planos_acao',
          'necessidade_identificada',
          p.necessidade_identificada,
        )
      } catch (_) {
        rec = new Record(planosCol)
      }
      for (const key of Object.keys(p)) {
        rec.set(key, p[key])
      }
      app.save(rec)
      createdPlanos.push(rec)
    }

    // 4. Seed Beneficiários (10 beneficiários)
    const benefData = [
      {
        id_externo: 'BENEF-001',
        nome_beneficiario: 'Roberto Almeida Silveira',
        matricula: 'MAT-1001',
        unidade_regiao: 'São Paulo - Matriz',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '45-49',
        telefone: '(11) 3456-7890',
        celular: '(11) 98765-4321',
        email: 'roberto.silveira@empresa.com.br',
        custo_12_meses: 18450.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'EM_ATENDIMENTO',
        condicao_principal: 'Hipertensão Arterial Sistêmica Severa',
        risco: 'ALTO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-01-16 09:00:00.000Z',
        atendente_id: atendente1.id,
        data_distribuicao: '2025-01-17 11:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-002',
        nome_beneficiario: 'Mariana Costa Silveira',
        matricula: 'MAT-1001-D1',
        unidade_regiao: 'São Paulo - Matriz',
        tipo_vinculo: 'DEPENDENTE',
        faixa_etaria: '18-24',
        telefone: '(11) 3456-7890',
        celular: '(11) 98111-2233',
        email: 'mariana.costa@gmail.com',
        custo_12_meses: 3200.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'SELECIONADO',
        condicao_principal: 'Asma Brônquica Moderada',
        risco: 'MEDIO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-01-16 09:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-003',
        nome_beneficiario: 'Carlos Eduardo Mendes',
        matricula: 'MAT-1002',
        unidade_regiao: 'Rio de Janeiro - Filial',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '55-59',
        telefone: '(21) 2234-5678',
        celular: '(21) 99887-6655',
        email: 'carlos.mendes@empresa.com.br',
        custo_12_meses: 24800.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'ATENDIDO',
        condicao_principal: 'Diabetes Tipo 2 e Cardiopatia Isquêmica',
        risco: 'CRITICO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-01-16 09:00:00.000Z',
        atendente_id: atendente2.id,
        data_distribuicao: '2025-01-17 11:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-004',
        nome_beneficiario: 'Juliana Santos Pereira',
        matricula: 'MAT-1003',
        unidade_regiao: 'São Paulo - Fábrica',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '35-39',
        telefone: '(11) 2345-6789',
        celular: '(11) 97766-5544',
        email: 'juliana.pereira@empresa.com.br',
        custo_12_meses: 7500.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'EM_ATENDIMENTO',
        condicao_principal: 'Acompanhamento Pré-Natal de Alto Risco',
        risco: 'ALTO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-01-16 09:00:00.000Z',
        atendente_id: atendente1.id,
        data_distribuicao: '2025-01-17 11:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-005',
        nome_beneficiario: 'Fernando Henrique Lima',
        matricula: 'MAT-1004',
        unidade_regiao: 'Curitiba - Centro',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '50-54',
        telefone: '(41) 3322-1100',
        celular: '(41) 98844-3322',
        email: 'fernando.lima@empresa.com.br',
        custo_12_meses: 11200.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'ELEGIVEL',
        condicao_principal: 'Dislipidemia e Esteatose Hepática',
        risco: 'MEDIO',
        permite_contato_whatsapp_sms: true,
        ativo: true,
      },
      {
        id_externo: 'BENEF-006',
        nome_beneficiario: 'Beatriz Nogueira Lima',
        matricula: 'MAT-1004-D1',
        unidade_regiao: 'Curitiba - Centro',
        tipo_vinculo: 'DEPENDENTE',
        faixa_etaria: '14-17',
        telefone: '(41) 3322-1100',
        celular: '(41) 98844-3323',
        email: 'beatriz.lima@gmail.com',
        custo_12_meses: 1950.0,
        data_selecao: '2025-01-15 10:00:00.000Z',
        lote_id: lote1.id,
        status: 'ELEGIVEL',
        condicao_principal: 'Rinite Alérgica Severa',
        risco: 'BAIXO',
        permite_contato_whatsapp_sms: true,
        ativo: true,
      },
      {
        id_externo: 'BENEF-007',
        nome_beneficiario: 'Marcos Vinicius Rezende',
        matricula: 'MAT-2001',
        unidade_regiao: 'Belo Horizonte - Filial',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '60-64',
        telefone: '(31) 3211-9988',
        celular: '(31) 99122-3344',
        email: 'marcos.rezende@empresa.com.br',
        custo_12_meses: 29400.0,
        data_selecao: '2025-02-10 14:30:00.000Z',
        lote_id: lote2.id,
        status: 'SELECIONADO',
        condicao_principal: 'Doença Renal Crônica Estágio 3 e HAS',
        risco: 'CRITICO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-02-11 10:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-008',
        nome_beneficiario: 'Patricia Souza Ramos',
        matricula: 'MAT-2002',
        unidade_regiao: 'Porto Alegre - Unidade Sul',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '40-44',
        telefone: '(51) 3344-5566',
        celular: '(51) 99344-5566',
        email: 'patricia.ramos@empresa.com.br',
        custo_12_meses: 8900.0,
        data_selecao: '2025-02-10 14:30:00.000Z',
        lote_id: lote2.id,
        status: 'EM_ATENDIMENTO',
        condicao_principal: 'Ansiedade Generalizada e Síndrome de Burnout',
        risco: 'MEDIO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-02-11 10:00:00.000Z',
        atendente_id: atendente2.id,
        data_distribuicao: '2025-02-12 14:00:00.000Z',
        ativo: true,
      },
      {
        id_externo: 'BENEF-009',
        nome_beneficiario: 'Lucas Farias Toledo',
        matricula: 'MAT-2003',
        unidade_regiao: 'São Paulo - Matriz',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '30-34',
        telefone: '(11) 4567-8901',
        celular: '(11) 98222-3344',
        email: 'lucas.toledo@empresa.com.br',
        custo_12_meses: 4200.0,
        data_selecao: '2025-02-10 14:30:00.000Z',
        lote_id: lote2.id,
        status: 'ELEGIVEL',
        condicao_principal: 'Lombalgia Crônica e Sedentarismo',
        risco: 'BAIXO',
        permite_contato_whatsapp_sms: false,
        ativo: true,
      },
      {
        id_externo: 'BENEF-010',
        nome_beneficiario: 'Camila Duarte Albuquerque',
        matricula: 'MAT-2004',
        unidade_regiao: 'Rio de Janeiro - Filial',
        tipo_vinculo: 'TITULAR',
        faixa_etaria: '52-56',
        telefone: '(21) 3456-1122',
        celular: '(21) 99555-4433',
        email: 'camila.albuquerque@empresa.com.br',
        custo_12_meses: 15300.0,
        data_selecao: '2025-02-10 14:30:00.000Z',
        lote_id: lote2.id,
        status: 'ATENDIDO',
        condicao_principal: 'Câncer de Mama em Seguimento e Linfedema',
        risco: 'ALTO',
        permite_contato_whatsapp_sms: true,
        selecionado_por: gestor.id,
        data_selecao_gestao: '2025-02-11 10:00:00.000Z',
        atendente_id: atendente2.id,
        data_distribuicao: '2025-02-12 14:00:00.000Z',
        ativo: true,
      },
    ]

    const createdBeneficiarios = []
    for (const b of benefData) {
      let rec
      try {
        rec = app.findFirstRecordByData('beneficiarios', 'matricula', b.matricula)
      } catch (_) {
        rec = new Record(benefCol)
      }
      for (const key of Object.keys(b)) {
        rec.set(key, b[key])
      }
      app.save(rec)
      createdBeneficiarios.push(rec)
    }

    // Vincular titular_id para dependentes
    try {
      const dep1 = app.findFirstRecordByData('beneficiarios', 'matricula', 'MAT-1001-D1')
      const tit1 = app.findFirstRecordByData('beneficiarios', 'matricula', 'MAT-1001')
      dep1.set('titular_id', tit1.id)
      app.save(dep1)

      const dep2 = app.findFirstRecordByData('beneficiarios', 'matricula', 'MAT-1004-D1')
      const tit2 = app.findFirstRecordByData('beneficiarios', 'matricula', 'MAT-1004')
      dep2.set('titular_id', tit2.id)
      app.save(dep2)
    } catch (_) {}

    // 5. Seed Programas de Saúde (3 programas)
    const programasData = [
      {
        beneficiario_id: createdBeneficiarios[0].id,
        condicao_principal: 'Programa de Hipertensão Arterial e Saúde Cardiovascular',
        risco: 'ALTO',
        data_selecao: '2025-01-18 09:00:00.000Z',
        responsavel: 'Dr. Carlos Gestor',
        ativo: true,
      },
      {
        beneficiario_id: createdBeneficiarios[2].id,
        condicao_principal: 'Programa de Cuidado Contínuo ao Diabético',
        risco: 'CRITICO',
        data_selecao: '2025-01-18 09:00:00.000Z',
        responsavel: 'Dra. Marina',
        ativo: true,
      },
      {
        beneficiario_id: createdBeneficiarios[3].id,
        condicao_principal: 'Programa Gestante Segura & Acolhimento',
        risco: 'ALTO',
        data_selecao: '2025-01-18 09:00:00.000Z',
        responsavel: 'Enf. Paulo',
        ativo: true,
      },
    ]

    const createdProgramas = []
    for (const prog of programasData) {
      let rec
      try {
        rec = app.findFirstRecordByData(
          'controle_programas',
          'beneficiario_id',
          prog.beneficiario_id,
        )
      } catch (_) {
        rec = new Record(progCol)
      }
      for (const key of Object.keys(prog)) {
        rec.set(key, prog[key])
      }
      app.save(rec)
      createdProgramas.push(rec)
    }

    // 6. Seed Fichas de Atendimento (5 fichas)
    const fichasData = [
      {
        ficha_id: 'FICHA-2025-001',
        beneficiario_id: createdBeneficiarios[0].id,
        atendente_id: atendente1.id,
        plano_acao_id: createdPlanos[0].id,
        controle_programa_id: createdProgramas[0].id,
        meio_contato: 'WHATSAPP',
        condicao_principal: 'Hipertensão Arterial Sistêmica',
        data_contato: '2025-01-20 14:00:00.000Z',
        risco: 'ALTO',
        status_contato: 'ATENDIDO',
        descricao_atendimento:
          'Beneficiário relatou boa adesão às orientações e medicação tomada nos horários prescritos. Realizada checagem de aferições recentes (médias 135/85 mmHg).',
        data_proximo_contato: '2025-02-20 14:00:00.000Z',
        responsavel: 'Enf. Paulo',
        meta: 'Manter pressão arterial estável e realizar caminhadas 3 vezes por semana',
        observacoes: 'Paciente motivado com o aplicativo de monitoramento',
        pendencias: 'Aguardando envio do laudo do MAPA 24h',
        status_geral: 'EM_ACOMPANHAMENTO',
        versao: 1,
        ativo: true,
      },
      {
        ficha_id: 'FICHA-2025-002',
        beneficiario_id: createdBeneficiarios[2].id,
        atendente_id: atendente2.id,
        plano_acao_id: createdPlanos[1].id,
        controle_programa_id: createdProgramas[1].id,
        meio_contato: 'LIGACAO_TELEFONICA',
        condicao_principal: 'Diabetes Tipo 2 e Cardiopatia Isquêmica',
        data_contato: '2025-01-22 10:30:00.000Z',
        risco: 'CRITICO',
        status_contato: 'ATENDIDO',
        descricao_atendimento:
          'Atendimento de encerramento do ciclo de acompanhamento intensivo. Paciente apresentou metas atingidas (HbA1c caiu de 9.4% para 6.8%), sem episódios anginosos nos últimos 90 dias.',
        responsavel: 'Dra. Marina',
        meta: 'Alta por estabilização clínica e autonomia no autocuidado',
        observacoes: 'Paciente orientado sobre sinais de alarme e retorno anual',
        pendencias: 'Nenhuma pendência médica ativa',
        status_geral: 'ALTA',
        data_alta: '2025-02-05 16:00:00.000Z',
        feedback: 5,
        data_envio_pesquisa: '2025-02-05 16:30:00.000Z',
        data_resposta_pesquisa: '2025-02-06 09:15:00.000Z',
        versao: 2,
        ativo: true,
      },
      {
        ficha_id: 'FICHA-2025-003',
        beneficiario_id: createdBeneficiarios[3].id,
        atendente_id: atendente1.id,
        plano_acao_id: createdPlanos[2].id,
        controle_programa_id: createdProgramas[2].id,
        meio_contato: 'WHATSAPP',
        condicao_principal: 'Acompanhamento Pré-Natal de Alto Risco',
        data_contato: '2025-01-25 15:45:00.000Z',
        risco: 'ALTO',
        status_contato: 'ATENDIDO',
        descricao_atendimento:
          'Gestante no 2º trimestre (24 semanas). Ecografia morfológica sem alterações. Orientada sobre sintomas de pré-eclâmpsia e agendamento de curva glicêmica.',
        data_proximo_contato: '2025-02-25 15:00:00.000Z',
        responsavel: 'Enf. Paulo',
        meta: 'Realizar exames do 2º trimestre e manter ganho de peso saudável',
        observacoes: 'Suporte familiar presente e esclarecida sobre o canal 24h',
        pendencias: 'Realizar TOTG 75g até próxima semana',
        status_geral: 'EM_ACOMPANHAMENTO',
        versao: 1,
        ativo: true,
      },
      {
        ficha_id: 'FICHA-2025-004',
        beneficiario_id: createdBeneficiarios[7].id,
        atendente_id: atendente2.id,
        plano_acao_id: createdPlanos[4].id,
        meio_contato: 'EMAIL',
        condicao_principal: 'Ansiedade Generalizada e Síndrome de Burnout',
        data_contato: '2025-02-14 11:00:00.000Z',
        risco: 'MEDIO',
        status_contato: 'SEM_RESPOSTA',
        descricao_atendimento:
          'Tentativa de contato via e-mail corporativo com questionário de autoavaliação e agendamento de acolhimento psicológico.',
        data_proximo_contato: '2025-02-21 11:00:00.000Z',
        responsavel: 'Dra. Marina',
        meta: 'Estabelecer vínculo inicial e agendar teleconsulta',
        observacoes: 'Reforçar contato via WhatsApp na próxima tentativa',
        pendencias: 'Confirmar telefone pessoal atualizado',
        status_geral: 'AGUARDANDO_RETORNO',
        versao: 1,
        ativo: true,
      },
      {
        ficha_id: 'FICHA-2025-005',
        beneficiario_id: createdBeneficiarios[9].id,
        atendente_id: atendente2.id,
        plano_acao_id: createdPlanos[3].id,
        meio_contato: 'WHATSAPP',
        condicao_principal: 'Câncer de Mama em Seguimento e Linfedema',
        data_contato: '2025-02-15 16:20:00.000Z',
        risco: 'ALTO',
        status_contato: 'ATENDIDO',
        descricao_atendimento:
          'Paciente completou ciclo com drenagem linfática bem-sucedida e consultas oncológicas em dia. Encerramento programado do suporte emergencial.',
        responsavel: 'Dra. Marina',
        meta: 'Alta com encaminhamento para suporte ambulatorial preventivo',
        observacoes: 'Paciente muito satisfeita e sem limitações funcionais',
        pendencias: 'Nenhuma',
        status_geral: 'ALTA',
        data_alta: '2025-02-15 16:30:00.000Z',
        feedback: 5,
        data_envio_pesquisa: '2025-02-15 16:35:00.000Z',
        data_resposta_pesquisa: '2025-02-16 10:20:00.000Z',
        versao: 1,
        ativo: true,
      },
    ]

    const createdFichas = []
    for (const f of fichasData) {
      let rec
      try {
        rec = app.findFirstRecordByData('fichas_atendimento', 'ficha_id', f.ficha_id)
      } catch (_) {
        rec = new Record(fichasCol)
      }
      for (const key of Object.keys(f)) {
        rec.set(key, f[key])
      }
      app.save(rec)
      createdFichas.push(rec)
    }

    // 7. Seed Pesquisas de Satisfação (2 respondidas, 1 pendente com token público)
    const pesquisasData = [
      {
        ficha_id: createdFichas[1].id,
        token: 'pesquisa-token-carlos-1002',
        nota: 5,
        comentario:
          'Excelente atendimento da Dra. Marina! Me ajudou a controlar o diabetes com carinho e paciência.',
        data_envio: '2025-02-05 16:30:00.000Z',
        data_resposta: '2025-02-06 09:15:00.000Z',
        canal: 'WHATSAPP',
        status: 'RESPONDIDO',
      },
      {
        ficha_id: createdFichas[4].id,
        token: 'pesquisa-token-camila-2004',
        nota: 5,
        comentario:
          'Equipe de saúde muito atenciosa e prestativa. O acompanhamento fez toda a diferença na minha recuperação.',
        data_envio: '2025-02-15 16:35:00.000Z',
        data_resposta: '2025-02-16 10:20:00.000Z',
        canal: 'WHATSAPP',
        status: 'RESPONDIDO',
      },
      {
        ficha_id: createdFichas[0].id,
        token: 'demo-token-satisfacao-2025',
        nota: null,
        comentario: '',
        data_envio: '2025-02-20 09:00:00.000Z',
        canal: 'EMAIL',
        status: 'ENVIADO',
      },
    ]

    for (const p of pesquisasData) {
      let rec
      try {
        rec = app.findFirstRecordByData('pesquisas_satisfacao', 'token', p.token)
      } catch (_) {
        rec = new Record(pesquisasCol)
      }
      for (const key of Object.keys(p)) {
        rec.set(key, p[key])
      }
      app.save(rec)
    }
  },
  (app) => {
    // down cleanup
  },
)
