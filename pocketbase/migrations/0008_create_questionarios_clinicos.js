migrate(
  (app) => {
    // Obter referências das coleções existentes
    const fichasCol = app.findCollectionByNameOrId('fichas_atendimento')

    // 1. Criar coleção questionarios_templates
    let templatesCol
    try {
      templatesCol = app.findCollectionByNameOrId('questionarios_templates')
    } catch (_) {
      templatesCol = new Collection({
        name: 'questionarios_templates',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'condicao_principal',
            type: 'text',
            required: true,
          },
          {
            name: 'titulo',
            type: 'text',
            required: true,
          },
          {
            name: 'descricao',
            type: 'text',
          },
          {
            name: 'ativo',
            type: 'bool',
          },
          {
            name: 'questoes',
            type: 'json',
            required: true,
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_templates_condicao ON questionarios_templates (condicao_principal)',
          'CREATE INDEX idx_templates_ativo ON questionarios_templates (ativo)',
        ],
      })
      app.save(templatesCol)
    }

    // 2. Criar coleção respostas_questionarios
    let respostasCol
    try {
      respostasCol = app.findCollectionByNameOrId('respostas_questionarios')
    } catch (_) {
      respostasCol = new Collection({
        name: 'respostas_questionarios',
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
            collectionId: fichasCol.id,
            required: true,
            maxSelect: 1,
            cascadeDelete: true,
          },
          {
            name: 'template_id',
            type: 'relation',
            collectionId: templatesCol.id,
            required: true,
            maxSelect: 1,
          },
          {
            name: 'respostas',
            type: 'json',
            required: true,
          },
          {
            name: 'preenchido_por',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          {
            name: 'data_preenchimento',
            type: 'date',
          },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_respostas_ficha ON respostas_questionarios (ficha_id)',
          'CREATE INDEX idx_respostas_template ON respostas_questionarios (template_id)',
        ],
      })
      app.save(respostasCol)
    }

    // 3. SEED DOS TEMPLATES CLÍNICOS PRÉ-CONFIGURADOS
    const templatesSeed = [
      {
        condicao_principal: 'Diabetes Mellitus',
        titulo: 'Protocolo de Acompanhamento Clínico — Diabetes Mellitus',
        descricao:
          'Avaliação clínica de controle glicêmico, adesão terapêutica, rastreamento de neuropatia e prevenção de complicações agudas.',
        questoes: [
          {
            id: 'dm_1',
            enunciado:
              'Qual o valor da Hemoglobina Glicada (HbA1c) mais recente realizada nos últimos 90 dias?',
            tipo: 'texto_livre',
            obrigatoria: true,
            placeholder: 'Ex: 7.2% (realizado em 15/01/2026)',
          },
          {
            id: 'dm_2',
            enunciado:
              'Apresentou episódios de hipoglicemia (tremores, suor frio, tontura) no último mês?',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Nenhum episódio',
              '1 a 2 vezes no mês',
              'Semanalmente',
              'Diariamente / Sintomas graves',
            ],
          },
          {
            id: 'dm_3',
            enunciado:
              'Adesão medicamentosa: toma os antidiabéticos orais ou insulina exatamente nos horários prescritos?',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Não adere / Interrompeu',
            legendaMax: '5 = Adesão perfeita 100%',
          },
          {
            id: 'dm_4',
            enunciado:
              'Realiza automonitorização da glicemia capilar conforme recomendação médica?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dm_5',
            enunciado:
              'Exame dos pés: apresenta feridas, calosidades, dormência, formigamento ou perda de sensibilidade nas extremidades?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dm_6',
            enunciado:
              'Hábitos e estilo de vida: segue plano alimentar individualizado e prática regular de atividade física?',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Sedentário / Sem dieta',
            legendaMax: '5 = Dieta e exercícios regulares',
          },
          {
            id: 'dm_7',
            enunciado: 'Observações clínicas do Concierge e condutas pactuadas:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder:
              'Orientações reforçadas, encaminhamentos ou metas pactuadas com o paciente...',
          },
        ],
      },
      {
        condicao_principal: 'Hipertensão Arterial',
        titulo: 'Protocolo de Monitoramento Pressórico — Hipertensão Arterial Sistêmica',
        descricao:
          'Acompanhamento dos níveis tensionais, sintomas de alarme, adesão farmacológica e fatores de risco cardiovasculares.',
        questoes: [
          {
            id: 'ha_1',
            enunciado: 'Qual a média das aferições de Pressão Arterial (PA) nos últimos 7 dias?',
            tipo: 'texto_livre',
            obrigatoria: true,
            placeholder: 'Ex: 130x85 mmHg',
          },
          {
            id: 'ha_2',
            enunciado:
              'Apresentou sintomas de pico hipertensivo (cefaleia na nuca, visão turva, zumbido no ouvido, dor torácica)?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ha_3',
            enunciado:
              'Grau de regularidade no uso dos medicamentos anti-hipertensivos prescritos:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Esquece com frequência',
            legendaMax: '5 = Uso rigoroso sem falhas',
          },
          {
            id: 'ha_4',
            enunciado: 'Controle de ingestão de sal e alimentos ultraprocessados:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Alto consumo de sódio',
            legendaMax: '5 = Dieta hipossódica rigorosa',
          },
          {
            id: 'ha_5',
            enunciado: 'Possui aparelho digital de pressão arterial em domicílio calibrado?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ha_6',
            enunciado: 'Frequência de aferição domiciliar da pressão:',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Diária (2x ao dia)',
              '2 a 3 vezes por semana',
              'Apenas quando sente sintomas',
              'Raramente / Nunca',
            ],
          },
          {
            id: 'ha_7',
            enunciado: 'Condutas pactuadas e ajustes de rotina:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Orientações fornecidas sobre controle pressórico...',
          },
        ],
      },
      {
        condicao_principal: 'Lombalgia Crônica',
        titulo: 'Protocolo de Avaliação de Coluna e Reabilitação — Lombalgia Crônica',
        descricao:
          'Avaliação da intensidade de dor, incapacidade funcional, ergonomia e adesão ao programa fisioterapêutico.',
        questoes: [
          {
            id: 'lc_1',
            enunciado:
              'Intensidade média da dor lombar nos últimos 7 dias (Escala Visual Analógica - EVA):',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Sem dor',
            legendaMax: '5 = Dor incapacitante máxima',
          },
          {
            id: 'lc_2',
            enunciado: 'A dor irradia para glúteos, pernas ou pés (ciatalgia / parestesia)?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'lc_3',
            enunciado: 'Impacto da dor nas atividades profissionais e da vida diária:',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Sem limitação',
              'Limitação leve (consegue trabalhar)',
              'Limitação moderada (dificuldade em sentar/levantar)',
              'Limitação severa com afastamento do trabalho',
            ],
          },
          {
            id: 'lc_4',
            enunciado:
              'Está realizando sessões de fisioterapia, RPG ou exercícios de fortalecimento do core?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'lc_5',
            enunciado:
              'Frequência de pausas ativas e postura ergonômica durante a jornada laboral:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Postura inadequada sem pausas',
            legendaMax: '5 = Ergonomia adequada e pausas horárias',
          },
          {
            id: 'lc_6',
            enunciado:
              'Medicamentos analgésicos e anti-inflamatórios em uso contínuo ou sob demanda:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Ex: Paracetamol 750mg sob demanda, Ciclobenzaprina à noite...',
          },
        ],
      },
      {
        condicao_principal: 'Insuficiência Cardíaca',
        titulo: 'Protocolo de Descompensação Cardíaca — Insuficiência Cardíaca',
        descricao:
          'Rastreamento precoce de congestão venosa, sinais de descompensação e monitoramento hemodinâmico.',
        questoes: [
          {
            id: 'ic_1',
            enunciado:
              'Notou ganho de peso súbito (mais de 2 kg em 2 a 3 dias) ou inchaço (edema) nos tornozelos e pernas?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ic_2',
            enunciado:
              'Apresentou falta de ar (dispneia) ao deitar (ortopneia) necessitando de mais travesseiros para dormir?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ic_3',
            enunciado:
              'Tolerância ao esforço físico habitual (subir um lance de escadas, caminhar no plano):',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Sem sintomas (Classe funcional I NYHA)',
              'Sintomas em esforços moderados (Classe II)',
              'Sintomas em pequenos esforços (Classe III)',
              'Falta de ar mesmo em repouso (Classe IV)',
            ],
          },
          {
            id: 'ic_4',
            enunciado: 'Adesão ao uso de diuréticos e betabloqueadores prescritos:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Interrupção frequente',
            legendaMax: '5 = Uso pontual e diário',
          },
          {
            id: 'ic_5',
            enunciado: 'Adesão à restrição hídrica (limite diário de líquidos) e sal:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Sem controle',
            legendaMax: '5 = Restrição rigorosa cumprida',
          },
          {
            id: 'ic_6',
            enunciado:
              'Última dosagem de peptídeo natriurético (BNP ou NT-proBNP) ou fração de ejeção recente:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Ex: Fração de ejeção 42%, BNP 320 pg/mL...',
          },
        ],
      },
      {
        condicao_principal: 'Asma Brônquica',
        titulo: 'Protocolo de Controle de Asma — Asma Brônquica',
        descricao:
          'Avaliação do controle dos sintomas respiratórios (ACT), uso de medicação de resgate e prevenção de crises.',
        questoes: [
          {
            id: 'as_1',
            enunciado:
              'Com que frequência a asma o impediu de realizar tarefas normais no trabalho ou em casa nas últimas 4 semanas?',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Nunca',
              'Poucas vezes',
              'Algumas vezes',
              'Na maioria das vezes',
              'Todo o tempo',
            ],
          },
          {
            id: 'as_2',
            enunciado:
              'Apresentou falta de ar, chiado no peito ou tosse durante o sono acordando à noite?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'as_3',
            enunciado:
              'Quantas vezes precisou usar a bombinha / inalador de alívio rápido (broncodilatador de resgate) na última semana?',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Nenhuma vez',
              '1 a 2 vezes por semana',
              '3 a 6 vezes por semana',
              'Mais de uma vez por dia',
            ],
          },
          {
            id: 'as_4',
            enunciado:
              'Adesão ao corticoide inalatório de manutenção e uso da técnica inalatória correta:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Não usa manutenção',
            legendaMax: '5 = Uso diário com técnica perfeita',
          },
          {
            id: 'as_5',
            enunciado:
              'Exposição a gatilhos ambientais identificados (poeira, mofo, pelos de animais, fumaça de cigarro):',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'as_6',
            enunciado: 'Medida do Pico de Fluxo Expiratório (Peak Flow) se possuir em domicílio:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Ex: 380 L/min (zona verde)',
          },
        ],
      },
      {
        condicao_principal: 'Obesidade Grau II',
        titulo: 'Protocolo Multidisciplinar de Manejo Ponderal — Obesidade Grau II',
        descricao:
          'Acompanhamento do peso, hábitos alimentares, atividade física e rastreamento de comorbidades metabólicas.',
        questoes: [
          {
            id: 'ob_1',
            enunciado: 'Peso corporal atual e evolução nos últimos 30 dias:',
            tipo: 'texto_livre',
            obrigatoria: true,
            placeholder: 'Ex: 104 kg (reduziu 1,5 kg no último mês)',
          },
          {
            id: 'ob_2',
            enunciado: 'Frequência semanal de atividade física aeróbica moderada a vigorosa:',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Sedentário (0 dias)',
              '1 a 2 dias por semana',
              '3 a 4 dias por semana (150 min/sem)',
              '5 ou mais dias por semana',
            ],
          },
          {
            id: 'ob_3',
            enunciado: 'Adesão ao plano nutricional e controle de ingestão de calorias/açúcares:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Sem disciplina alimentar',
            legendaMax: '5 = Segue plano nutricional 100%',
          },
          {
            id: 'ob_4',
            enunciado:
              'Apresenta sintomas sugestivos de apneia obstrutiva do sono (ronco alto, sonolência diurna excessiva)?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ob_5',
            enunciado:
              'Episódios de compulsão alimentar ou alimentação emocional associada a estresse/ansiedade:',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Raramente ou nunca',
              '1 a 2 vezes por semana',
              'Frequentemente quase todos os dias',
            ],
          },
          {
            id: 'ob_6',
            enunciado:
              'Uso de terapia medicamentosa adjuvante (ex: análogos de GLP-1, sibutramina) sob orientação médica:',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
        ],
      },
      {
        condicao_principal: 'Gestação de Alto Risco',
        titulo: 'Protocolo de Pré-Natal e Vigilância Materno-Fetal — Gestação de Alto Risco',
        descricao:
          'Vigilância obstétrica intensiva, sinais de alerta de pré-eclâmpsia e rastreamento de trabalho de parto prematuro.',
        questoes: [
          {
            id: 'gar_1',
            enunciado: 'Idade Gestacional atual e data prevista do parto (DPP):',
            tipo: 'texto_livre',
            obrigatoria: true,
            placeholder: 'Ex: 28 semanas e 3 dias (DPP: 20/05/2026)',
          },
          {
            id: 'gar_2',
            enunciado:
              'Apresenta sinais de alerta obstétrico (sangramento vaginal, perda de líquido, dor abdominal intensa ou contrações)?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'gar_3',
            enunciado:
              'Sinais de pré-eclâmpsia: cefaleia persistente, escotomas cintilantes (pontos brilhantes na visão), dor epigástrica ou edema súbito de face/mãos?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'gar_4',
            enunciado: 'Movimentação fetal ativa percebida diariamente (mobilograma normal)?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'gar_5',
            enunciado:
              'Comparecimento regular a todas as consultas de pré-natal de alto risco e exames de ultrassonografia com Doppler:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Consultas atrasadas / Faltas',
            legendaMax: '5 = Pré-natal 100% em dia',
          },
          {
            id: 'gar_6',
            enunciado:
              'Uso regular de suplementos e medicamentos gestacionais (sulfato ferroso, ácido fólico, AAS, cálcio):',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Não adere',
            legendaMax: '5 = Uso diário rigoroso',
          },
          {
            id: 'gar_7',
            enunciado: 'Orientações emergenciais e maternidade de referência pactuada:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Maternidade pactuada, contatos de urgência e orientações reforçadas...',
          },
        ],
      },
      {
        condicao_principal: 'Transtorno de Ansiedade',
        titulo: 'Protocolo de Saúde Mental e Ansiedade — Transtorno de Ansiedade',
        descricao:
          'Avaliação de sintomas ansiosos, crises de pânico, qualidade do sono e suporte psicoterapêutico.',
        questoes: [
          {
            id: 'ta_1',
            enunciado:
              'Nível médio de ansiedade e tensão nas últimas duas semanas (Escala GAD-7 simplificada):',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Calmo e sem sintomas',
            legendaMax: '5 = Ansiedade severa e contínua',
          },
          {
            id: 'ta_2',
            enunciado:
              'Teve episódios de crise de pânico (taquicardia súbita, sensação de sufocamento, medo intenso) no último mês?',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Nenhuma crise',
              '1 crise isolada',
              '2 a 3 crises no mês',
              'Mais de uma crise por semana',
            ],
          },
          {
            id: 'ta_3',
            enunciado:
              'Qualidade do sono e insônia (dificuldade para adormecer ou despertares frequentes):',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Insônia grave diária',
            legendaMax: '5 = Sono reparador de 7-8h',
          },
          {
            id: 'ta_4',
            enunciado: 'Está em acompanhamento psicoterápico (psicólogo) regular?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'ta_5',
            enunciado:
              'Adesão ao tratamento psicofarmacológico prescrito (antidepressivos/ansiolíticos) sem interrupções abruptas:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Sem adesão / Descontinuou sozinho',
            legendaMax: '5 = Tomada diária conforme prescrição',
          },
          {
            id: 'ta_6',
            enunciado: 'Relato livre do beneficiário sobre gatilhos atuais e suporte familiar:',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Principais fontes de estresse e redes de apoio mencionadas...',
          },
        ],
      },
      {
        condicao_principal: 'Dislipidemia',
        titulo: 'Protocolo de Controle Lipídico e Risco Aterogênico — Dislipidemia',
        descricao:
          'Monitoramento do perfil lipídico (LDL, Triglicérides), estratificação de risco cardiovascular e adesão a estatinas.',
        questoes: [
          {
            id: 'dl_1',
            enunciado:
              'Valores do perfil lipídico mais recente (Colesterol Total, LDL, HDL, Triglicérides):',
            tipo: 'texto_livre',
            obrigatoria: true,
            placeholder: 'Ex: LDL: 135 mg/dL, Triglicérides: 210 mg/dL (exame em 10/02/2026)',
          },
          {
            id: 'dl_2',
            enunciado: 'Adesão ao uso de estatina ou ezetimiba prescritos:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Não toma a medicação',
            legendaMax: '5 = Uso diário contínuo',
          },
          {
            id: 'dl_3',
            enunciado:
              'Apresentou dores musculares (mialgia) ou fraqueza nos membros inferiores após início da medicação?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dl_4',
            enunciado:
              'Controle alimentar em relação a gorduras saturadas, frituras e açúcares refinados:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Ingestão frequente de gorduras ruins',
            legendaMax: '5 = Dieta cardioprotetora rigorosa',
          },
          {
            id: 'dl_5',
            enunciado:
              'Prática regular de exercícios aeróbicos visando elevação do HDL e queima de triglicérides:',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dl_6',
            enunciado:
              'Histórico familiar precoce de infarto agudo do miocárdio ou AVC (parentes de 1º grau homens < 55 anos ou mulheres < 65 anos):',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
        ],
      },
      {
        condicao_principal: 'DPOC',
        titulo: 'Protocolo Respiratório para Doença Pulmonar Obstrutiva Crônica — DPOC',
        descricao:
          'Avaliação de dispneia (escala mMRC), tosse produtiva, exacerbações recentes e cessação do tabagismo.',
        questoes: [
          {
            id: 'dpoc_1',
            enunciado: 'Grau de falta de ar nas atividades cotidianas (Escala de Dispneia mMRC):',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Grau 0: Falta de ar apenas em exercício intenso',
              'Grau 1: Falta de ar ao andar rápido no plano ou subir ladeira leve',
              'Grau 2: Anda mais devagar que pessoas da mesma idade ou para para respirar no plano',
              'Grau 3: Para para respirar após andar cerca de 100 metros ou alguns minutos',
              'Grau 4: Falta de ar para sair de casa ou ao se vestir/despir',
            ],
          },
          {
            id: 'dpoc_2',
            enunciado: 'Histórico de tabagismo atual:',
            tipo: 'multipla_escolha',
            obrigatoria: true,
            opcoes: [
              'Não fumante / Ex-fumante há mais de 1 ano',
              'Ex-fumante recente (< 1 ano)',
              'Fumante ativo em processo de cessação',
              'Fumante ativo',
            ],
          },
          {
            id: 'dpoc_3',
            enunciado:
              'Teve episódios de exacerbação (piora de secreção/tosse necessitando de antibiótico ou corticoide) nos últimos 6 meses?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dpoc_4',
            enunciado:
              'Uso regular de broncodilatadores de longa ação (LAMA/LABA) e técnica do dispositivo inalatório:',
            tipo: 'escala',
            obrigatoria: true,
            escalaMin: 0,
            escalaMax: 5,
            legendaMin: '0 = Não utiliza / Técnica errada',
            legendaMax: '5 = Adesão diária com técnica adequada',
          },
          {
            id: 'dpoc_5',
            enunciado: 'Possui vacinação em dia para Influenza e Pneumocócica?',
            tipo: 'sim_nao',
            obrigatoria: true,
          },
          {
            id: 'dpoc_6',
            enunciado: 'Oximetria de pulso recente em repouso (se aferida):',
            tipo: 'texto_livre',
            obrigatoria: false,
            placeholder: 'Ex: SpO2 93% em ar ambiente',
          },
        ],
      },
    ]

    for (const t of templatesSeed) {
      let rec
      try {
        const found = app.findRecordsByFilter(
          'questionarios_templates',
          `condicao_principal = '${t.condicao_principal}'`,
          '',
          1,
          0,
        )
        if (found && found.length > 0) {
          rec = found[0]
        } else {
          rec = new Record(templatesCol)
        }
      } catch (_) {
        rec = new Record(templatesCol)
      }
      rec.set('condicao_principal', t.condicao_principal)
      rec.set('titulo', t.titulo)
      rec.set('descricao', t.descricao)
      rec.set('ativo', true)
      rec.set('questoes', t.questoes)
      app.save(rec)
    }
  },
  (app) => {
    // Reverter coleções
    try {
      const colResp = app.findCollectionByNameOrId('respostas_questionarios')
      app.delete(colResp)
    } catch (_) {}

    try {
      const colTemp = app.findCollectionByNameOrId('questionarios_templates')
      app.delete(colTemp)
    } catch (_) {}
  },
)
