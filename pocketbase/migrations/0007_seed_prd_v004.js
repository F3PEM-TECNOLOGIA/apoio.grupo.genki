migrate(
  (app) => {
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const configLgpdCol = app.findCollectionByNameOrId('config_lgpd_campos')
    const lotesCol = app.findCollectionByNameOrId('lotes_selecao')
    const planosCol = app.findCollectionByNameOrId('planos_acao')
    const benefCol = app.findCollectionByNameOrId('beneficiarios')
    const progCol = app.findCollectionByNameOrId('controle_programas')
    const fichasCol = app.findCollectionByNameOrId('fichas_atendimento')

    // -------------------------------------------------------------
    // 1. USUÁRIOS DEMO
    // -------------------------------------------------------------
    // Mateus Martins — mateus.martins@venart.com.br — GESTOR_VENART — tema LIGHT
    // Larissa Alquati — larissa.alquati@venart.com.br — GESTOR_VENART — tema DARK
    // Dr Toshio Oba — toshio.oba@venart.com.br — GESTOR_PROGRAMA — tema LIGHT
    // Raul Mazia — raul.mazia@venart.com.br — GESTOR_RH — tema LIGHT
    // Ketlin Nazário — ketlin.nazario@venart.com.br — OPERACAO — tema DARK
    const demoUsers = [
      {
        email: 'mateus.martins@venart.com.br',
        name: 'Mateus Martins',
        perfil: 'GESTOR_VENART',
        tema_preferido: 'LIGHT',
        categoria_profissional: 'ADMINISTRATIVO',
        registro_profissional: 'ADM-001',
        unidade_regiao: 'São Paulo',
      },
      {
        email: 'larissa.alquati@venart.com.br',
        name: 'Larissa Alquati',
        perfil: 'GESTOR_VENART',
        tema_preferido: 'DARK',
        categoria_profissional: 'ADMINISTRATIVO',
        registro_profissional: 'ADM-002',
        unidade_regiao: 'São Paulo',
      },
      {
        email: 'toshio.oba@venart.com.br',
        name: 'Dr Toshio Oba',
        perfil: 'GESTOR_PROGRAMA',
        tema_preferido: 'LIGHT',
        categoria_profissional: 'MEDICO',
        registro_profissional: 'CRM/SP 189201',
        unidade_regiao: 'São Paulo',
      },
      {
        email: 'raul.mazia@venart.com.br',
        name: 'Raul Mazia',
        perfil: 'GESTOR_RH',
        tema_preferido: 'LIGHT',
        categoria_profissional: 'ADMINISTRATIVO',
        registro_profissional: 'RH-4521',
        unidade_regiao: 'São Paulo',
      },
      {
        email: 'ketlin.nazario@venart.com.br',
        name: 'Ketlin Nazário',
        perfil: 'OPERACAO',
        tema_preferido: 'DARK',
        categoria_profissional: 'ENFERMEIRO',
        registro_profissional: 'COREN/SP 451920',
        unidade_regiao: 'São Paulo',
      },
      {
        // manter paulotmfranco@gmail.com como GESTOR_VENART
        email: 'paulotmfranco@gmail.com',
        name: 'Paulo Franco (Admin)',
        perfil: 'GESTOR_VENART',
        tema_preferido: 'LIGHT',
        categoria_profissional: 'ADMINISTRATIVO',
        registro_profissional: 'ADM-999',
        unidade_regiao: 'São Paulo',
      },
    ]

    const seededUsers = {}
    for (const u of demoUsers) {
      let rec
      try {
        rec = app.findAuthRecordByEmail('_pb_users_auth_', u.email)
      } catch (_) {
        rec = new Record(usersCol)
        rec.setEmail(u.email)
      }
      rec.setPassword('12345678')
      rec.setVerified(true)
      rec.set('name', u.name)
      rec.set('perfil', u.perfil)
      rec.set('tema_preferido', u.tema_preferido)
      rec.set('categoria_profissional', u.categoria_profissional)
      rec.set('registro_profissional', u.registro_profissional)
      rec.set('unidade_regiao', u.unidade_regiao)
      rec.set('ativo', true)
      app.save(rec)
      seededUsers[u.email] = rec
    }

    const adminUser = seededUsers['mateus.martins@venart.com.br']
    const operacaoUser = seededUsers['ketlin.nazario@venart.com.br']
    const gestorProgUser = seededUsers['toshio.oba@venart.com.br']

    // -------------------------------------------------------------
    // 2. CONFIG LGPD CAMPOS (LGPD dinâmica por perfil/campo)
    // -------------------------------------------------------------
    // GESTOR_PROGRAMA: nome=true, condicao_principal=true, risco=true, custo_12m=true
    // GESTOR_VENART: nome=false, condicao_principal=true, risco=true, custo_12m=true
    // GESTOR_RH: nome=false, condicao_principal=true, risco=true, custo_12m=true
    // OPERACAO: nome=false, condicao_principal=false, risco=false, custo_12m=false
    const lgpdSettings = [
      // GESTOR_PROGRAMA
      { perfil: 'GESTOR_PROGRAMA', campo: 'nome', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'custo_12m', visivel: true },
      // GESTOR_VENART
      { perfil: 'GESTOR_VENART', campo: 'nome', visivel: false },
      { perfil: 'GESTOR_VENART', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_VENART', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_VENART', campo: 'custo_12m', visivel: true },
      // GESTOR_RH
      { perfil: 'GESTOR_RH', campo: 'nome', visivel: false },
      { perfil: 'GESTOR_RH', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_RH', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_RH', campo: 'custo_12m', visivel: true },
      // OPERACAO
      { perfil: 'OPERACAO', campo: 'nome', visivel: false },
      { perfil: 'OPERACAO', campo: 'condicao_principal', visivel: false },
      { perfil: 'OPERACAO', campo: 'risco', visivel: false },
      { perfil: 'OPERACAO', campo: 'custo_12m', visivel: false },
    ]

    for (const item of lgpdSettings) {
      let rec
      try {
        const found = app.findRecordsByFilter(
          'config_lgpd_campos',
          `perfil = '${item.perfil}' && campo = '${item.campo}'`,
          '',
          1,
          0,
        )
        if (found && found.length > 0) {
          rec = found[0]
        } else {
          rec = new Record(configLgpdCol)
        }
      } catch (_) {
        rec = new Record(configLgpdCol)
      }
      rec.set('perfil', item.perfil)
      rec.set('campo', item.campo)
      rec.set('visivel', item.visivel)
      rec.set('atualizado_por', adminUser.id)
      rec.set('atualizado_em', '2026-03-01 10:00:00.000Z')
      app.save(rec)
    }

    // -------------------------------------------------------------
    // 3. LOTES DE SELEÇÃO (4 lotes)
    // -------------------------------------------------------------
    // LOTE-2026-0001 (NOVO_REGISTRO), LOTE-2026-0002 (NOVO_REGISTRO)
    // LOTE-2026-0003 (ATUALIZACAO), LOTE-2026-0004 (ATUALIZACAO)
    const lotesConfig = [
      {
        codigo: 'LOTE-2026-0001',
        tipo: 'NOVO_REGISTRO',
        status_proc: 'PROCESSADO',
        total: 300,
        data: '2026-01-15 08:30:00.000Z',
      },
      {
        codigo: 'LOTE-2026-0002',
        tipo: 'NOVO_REGISTRO',
        status_proc: 'PROCESSADO',
        total: 300,
        data: '2026-02-01 09:15:00.000Z',
      },
      {
        codigo: 'LOTE-2026-0003',
        tipo: 'ATUALIZACAO',
        status_proc: 'PROCESSADO',
        total: 300,
        data: '2026-02-15 14:00:00.000Z',
      },
      {
        codigo: 'LOTE-2026-0004',
        tipo: 'ATUALIZACAO',
        status_proc: 'PROCESSADO',
        total: 300,
        data: '2026-03-01 11:45:00.000Z',
      },
    ]

    const seededLotes = []
    for (const l of lotesConfig) {
      let rec
      try {
        rec = app.findFirstRecordByData('lotes_selecao', 'codigo_lote', l.codigo)
      } catch (_) {
        try {
          rec = app.findFirstRecordByData('lotes_selecao', 'lote_id', l.codigo)
        } catch (_) {
          rec = new Record(lotesCol)
        }
      }
      rec.set('codigo_lote', l.codigo)
      rec.set('lote_id', l.codigo)
      rec.set('tipo_lote', l.tipo)
      rec.set('data_importacao', l.data)
      rec.set('data_selecao', l.data)
      rec.set('usuario_importador_id', adminUser.id)
      rec.set('criado_por', adminUser.id)
      rec.set('total_registros', l.total)
      rec.set('total_beneficiarios', l.total)
      rec.set('status_processamento', l.status_proc)
      rec.set('status', l.status_proc)
      rec.set('custo_total', 450000)
      app.save(rec)
      seededLotes.push(rec)
    }

    // -------------------------------------------------------------
    // 4. PLANOS DE AÇÃO (5 planos padrão conforme script)
    // -------------------------------------------------------------
    const planosPadrao = [
      {
        necessidade_identificada: 'Hipertensão arterial descompensada',
        objetivo: 'Controle pressórico e adesão medicamentosa',
        acao_tomada: 'Acompanhamento mensal + orientação nutricional',
        prazo_acao_dias: 90,
        prioridade: 'ALTA',
        ativo: true,
      },
      {
        necessidade_identificada: 'Diabetes Mellitus tipo 2',
        objetivo: 'Glicemia controlada e prevenção de complicações',
        acao_tomada: 'Monitoramento de HbA1c e reeducação alimentar',
        prazo_acao_dias: 120,
        prioridade: 'ALTA',
        ativo: true,
      },
      {
        necessidade_identificada: 'Insuficiência cardíaca crônica',
        objetivo: 'Estabilização funcional e redução de reinternações',
        acao_tomada: 'Telemonitoramento semanal + equipe multiprofissional',
        prazo_acao_dias: 180,
        prioridade: 'URGENTE',
        ativo: true,
      },
      {
        necessidade_identificada: 'Lombalgia crônica incapacitante',
        objetivo: 'Reabilitação funcional e retorno às atividades',
        acao_tomada: 'Fisioterapia orientada e acompanhamento mensal',
        prazo_acao_dias: 60,
        prioridade: 'MEDIA',
        ativo: true,
      },
      {
        necessidade_identificada: 'Gestação de alto risco',
        objetivo: 'Acompanhamento pré-natal intensificado',
        acao_tomada: 'Consultas regulares e monitoramento de intercorrências',
        prazo_acao_dias: 270,
        prioridade: 'ALTA',
        ativo: true,
      },
    ]

    const seededPlanos = []
    for (const p of planosPadrao) {
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
      for (const k of Object.keys(p)) {
        rec.set(k, p[k])
      }
      app.save(rec)
      seededPlanos.push(rec)
    }

    // -------------------------------------------------------------
    // 5. BENEFICIÁRIOS (1.200 beneficiários distribuídos em 4 lotes)
    // -------------------------------------------------------------
    const unidades = ['São Paulo', 'Rio de Janeiro', 'Curitiba', 'Belo Horizonte', 'Porto Alegre']

    const condicoes = [
      'Diabetes Mellitus',
      'Hipertensão Arterial',
      'Lombalgia Crônica',
      'Insuficiência Cardíaca',
      'Asma Brônquica',
      'Obesidade Grau II',
      'Gestação de Alto Risco',
      'Dislipidemia',
      'Transtorno de Ansiedade',
      'DPOC',
    ]

    const riscos = ['BAIXO', 'MEDIO', 'ALTO', 'CRITICO']
    const faixas = ['18-29', '30-39', '40-49', '50-59', '60+']
    const statusCycle = ['ELEGIVEL', 'ELEGIVEL', 'SELECIONADO', 'APROVADO', 'ATENDIDO']

    const nomesBase = [
      'Silva',
      'Santos',
      'Oliveira',
      'Souza',
      'Rodrigues',
      'Ferreira',
      'Alves',
      'Pereira',
      'Lima',
      'Gomes',
      'Costa',
      'Ribeiro',
      'Martins',
      'Carvalho',
      'Almeida',
      'Lopes',
      'Soares',
      'Fernandes',
      'Vieira',
      'Barbosa',
    ]
    const prenomes = [
      'Ana',
      'Carlos',
      'Beatriz',
      'Eduardo',
      'Fernanda',
      'Gabriel',
      'Helena',
      'Igor',
      'Juliana',
      'Lucas',
      'Mariana',
      'Nelson',
      'Patricia',
      'Rafael',
      'Sofia',
      'Thiago',
      'Vanessa',
      'William',
      'Yasmin',
      'Rodrigo',
    ]

    // Pseudo-random com seed fixo para idempotência determinística
    let seedState = 123456789
    function seededRandom() {
      seedState = (seedState * 1664525 + 1013904223) % 4294967296
      return seedState / 4294967296
    }
    function rng(min, max) {
      return Math.floor(seededRandom() * (max - min + 1)) + min
    }

    // Verificar se já temos os 1200 beneficiários
    const countExistente = app.countRecords('beneficiarios')
    const TOTAL_BENEFICIARIOS = 1200

    const seededBeneficiarios = []

    if (countExistente < 1000) {
      // Deletar beneficiários antigos residuais para garantir dados limpos de v0.0.4
      try {
        app.db().newQuery('DELETE FROM fichas_atendimento').execute()
        app.db().newQuery('DELETE FROM controle_programas').execute()
        app.db().newQuery('DELETE FROM historico_fichas').execute()
        app.db().newQuery('DELETE FROM beneficiarios').execute()
      } catch (_) {}

      for (let i = 1; i <= TOTAL_BENEFICIARIOS; i++) {
        const loteIndex = (i - 1) % 4
        const lote = seededLotes[loteIndex]

        const prenome = prenomes[(i - 1) % prenomes.length]
        const sobrenome1 = nomesBase[rng(0, nomesBase.length - 1)]
        const sobrenome2 = nomesBase[rng(0, nomesBase.length - 1)]
        const nomeCompleto = `${prenome} ${sobrenome1} ${sobrenome2}`

        const matricula = `MAT-${String(i).padStart(5, '0')}`
        const idExterno = `BENEF-${String(i).padStart(5, '0')}`
        const vinculo = i % 5 === 0 ? 'DEPENDENTE' : 'TITULAR'
        const unidade = unidades[rng(0, unidades.length - 1)]
        const faixa = faixas[rng(0, faixas.length - 1)]
        const condicao = condicoes[rng(0, condicoes.length - 1)]
        const risco = riscos[rng(0, riscos.length - 1)]

        // custo_12m entre 3000 e 275000 (valores em centavos: rng(3000, 275000)/100)
        const custoValor = Math.round((rng(3000, 275000) / 100) * 100) / 100

        // Status distribuído conforme ciclo: ELEGIVEL, ELEGIVEL, SELECIONADO, APROVADO, ATENDIDO
        const status = statusCycle[(i - 1) % statusCycle.length]

        const rec = new Record(benefCol)
        rec.set('id_externo', idExterno)
        rec.set('nome', nomeCompleto)
        rec.set('nome_beneficiario', nomeCompleto)
        rec.set('matricula', matricula)
        rec.set('unidade', unidade)
        rec.set('unidade_regiao', unidade)
        rec.set('vinculo', vinculo)
        rec.set('tipo_vinculo', vinculo)
        rec.set('faixa', faixa)
        rec.set('faixa_etaria', faixa)
        rec.set('condicao_principal', condicao)
        rec.set('risco', risco)
        rec.set('custo_12m', custoValor)
        rec.set('custo_12_meses', custoValor)
        rec.set('status', status)
        rec.set('lote_id', lote.id)
        rec.set('ativo', true)
        rec.set('permite_contato_whatsapp_sms', true)
        rec.set('telefone', `(11) 3${rng(100, 999)}-${rng(1000, 9999)}`)
        rec.set('celular', `(11) 9${rng(8000, 9999)}-${rng(1000, 9999)}`)
        rec.set('email', `beneficiario.${i}@empresa.com.br`)

        if (status === 'SELECIONADO' || status === 'APROVADO' || status === 'ATENDIDO') {
          rec.set('selecionado_por', adminUser.id)
          rec.set('data_selecao', '2026-02-15 10:00:00.000Z')
          rec.set('data_selecao_gestao', '2026-02-15 10:00:00.000Z')
        }

        if (status === 'APROVADO' || status === 'ATENDIDO') {
          rec.set('aprovado_por', gestorProgUser.id)
          rec.set('data_aprovacao', '2026-02-20 14:00:00.000Z')
          rec.set('atendente_id', operacaoUser.id)
          rec.set('data_distribuicao', '2026-02-22 09:00:00.000Z')
        }

        app.save(rec)
        if (i <= 60) {
          seededBeneficiarios.push(rec)
        }
      }
    } else {
      // Buscar primeiros 50 beneficiários para as fichas
      const records = app.findRecordsByFilter('beneficiarios', 'ativo = true', 'matricula', 50, 0)
      for (const r of records) {
        seededBeneficiarios.push(r)
      }
    }

    // -------------------------------------------------------------
    // 6. FICHAS DE ATENDIMENTO (50 fichas para os primeiros beneficiários)
    // -------------------------------------------------------------
    const countFichas = app.countRecords('fichas_atendimento')
    if (countFichas < 30 && seededBeneficiarios.length > 0) {
      const meios = ['WHATSAPP', 'LIGACAO_TELEFONICA', 'EMAIL', 'SMS']
      const statusFichaList = [
        'EM_ACOMPANHAMENTO',
        'EM_ACOMPANHAMENTO',
        'PROXIMO_CONTATO',
        'AGUARDANDO_RETORNO',
        'ALTA',
      ]

      for (let j = 0; j < Math.min(50, seededBeneficiarios.length); j++) {
        const benef = seededBeneficiarios[j]
        const plano = seededPlanos[j % seededPlanos.length]
        const fichaCod = `FICHA-2026-${String(j + 1).padStart(4, '0')}`

        let rec
        try {
          rec = app.findFirstRecordByData('fichas_atendimento', 'ficha_id', fichaCod)
        } catch (_) {
          rec = new Record(fichasCol)
        }

        const meio = meios[j % meios.length]
        const stGeral = statusFichaList[j % statusFichaList.length]

        rec.set('ficha_id', fichaCod)
        rec.set('beneficiario_id', benef.id)
        rec.set('atendente_id', operacaoUser.id)
        rec.set('plano_acao_id', plano.id)
        rec.set('meio_contato', meio)
        rec.set('condicao_principal', benef.getString('condicao_principal'))
        rec.set('data_contato', '2026-02-25 10:00:00.000Z')
        rec.set('risco', benef.getString('risco') || 'MEDIO')
        rec.set('status_contato', 'ATENDIDO')
        rec.set(
          'descricao_atendimento',
          `Acompanhamento clínico periódico inicial para ${benef.getString('nome_beneficiario') || benef.getString('nome')}. Orientações de autocuidado reforçadas.`,
        )
        rec.set('data_proximo_contato', '2026-03-25 10:00:00.000Z')
        rec.set('responsavel', 'Ketlin Nazário (Operação)')
        rec.set('meta', plano.getString('objetivo'))
        rec.set('observacoes', 'Beneficiário receptivo às orientações clínicas.')
        rec.set('status_geral', stGeral)
        rec.set('versao', 1)
        rec.set('ativo', true)

        if (stGeral === 'ALTA') {
          rec.set('data_alta', '2026-03-01 16:00:00.000Z')
          rec.set('feedback', 5)
          rec.set('data_envio_pesquisa', '2026-03-01 16:30:00.000Z')
          rec.set('data_resposta_pesquisa', '2026-03-02 09:00:00.000Z')
        }

        app.save(rec)
      }
    }
  },
  (app) => {
    // down rollback
  },
)
