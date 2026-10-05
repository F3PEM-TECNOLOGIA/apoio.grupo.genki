migrate(
  (app) => {
    // -------------------------------------------------------------------------
    // 1. Limpeza de tabelas de movimentação e cadastro na ordem correta de FKs
    // -------------------------------------------------------------------------
    // Ordem de exclusão respeitando dependências de chave estrangeira:
    // - pesquisas_satisfacao (depende de fichas_atendimento)
    // - historico_fichas (depende de fichas_atendimento)
    // - respostas_questionarios (depende de fichas_atendimento e questionarios_templates)
    // - fichas_atendimento (depende de beneficiarios, controle_programas, planos_acao)
    // - controle_programas (depende de beneficiarios)
    // - apontamentos_rh (depende de lotes_selecao)
    // - dashboard_cache (tabela de cache de indicadores)
    // - beneficiarios (depende de lotes_selecao, auto-referência titular_id)
    // - lotes_selecao
    // - planos_acao
    // - tabelas legadas do protótipo v1 (satisfaction_surveys, followup_plans, medical_reports, exams, health_assessments, flow_steps, evaluations, monitoring_flows, employees)
    // - logs_auditoria (para não reter referências a usuários deletados)
    // -------------------------------------------------------------------------

    const tablesToClean = [
      'pesquisas_satisfacao',
      'historico_fichas',
      'respostas_questionarios',
      'fichas_atendimento',
      'controle_programas',
      'apontamentos_rh',
      'dashboard_cache',
      'beneficiarios',
      'lotes_selecao',
      'planos_acao',
      'logs_auditoria',
      // tabelas legadas
      'satisfaction_surveys',
      'followup_plans',
      'medical_reports',
      'exams',
      'health_assessments',
      'flow_steps',
      'evaluations',
      'monitoring_flows',
      'employees',
    ]

    for (const tableName of tablesToClean) {
      if (app.hasTable(tableName)) {
        try {
          app.db().newQuery(`DELETE FROM ${tableName}`).execute()
        } catch (err) {
          console.log(`Erro ao limpar tabela ${tableName}:`, err)
        }
      }
    }

    // -------------------------------------------------------------------------
    // 2. Limpeza de usuários: Manter APENAS os 5 usuários VenArt solicitados
    // -------------------------------------------------------------------------
    // Emails a manter intactos:
    // - mateus.martins@venart.com.br (GESTOR_VENART)
    // - larissa.alquati@venart.com.br (GESTOR_VENART)
    // - toshio.oba@venart.com.br (GESTOR_PROGRAMA)
    // - raul.mazia@venart.com.br (GESTOR_RH)
    // - ketlin.nazario@venart.com.br (OPERACAO)
    // -------------------------------------------------------------------------

    const allowedEmails = [
      'mateus.martins@venart.com.br',
      'larissa.alquati@venart.com.br',
      'toshio.oba@venart.com.br',
      'raul.mazia@venart.com.br',
      'ketlin.nazario@venart.com.br',
    ]

    // Limpar funcionario_id de todos os usuários para não travar foreign keys
    try {
      app
        .db()
        .newQuery('UPDATE users SET funcionario_id = NULL WHERE funcionario_id IS NOT NULL')
        .execute()
    } catch (_) {}

    // Excluir qualquer usuário cujo email não esteja na lista dos 5 autorizados
    try {
      const placeholders = allowedEmails.map((_, i) => `{:email${i}}`).join(', ')
      const query = app.db().newQuery(`DELETE FROM users WHERE email NOT IN (${placeholders})`)
      const bindParams = {}
      allowedEmails.forEach((email, i) => {
        bindParams[`email${i}`] = email
      })
      query.bind(bindParams).execute()
    } catch (err) {
      console.log('Erro ao limpar usuários não autorizados:', err)
    }

    // -------------------------------------------------------------------------
    // 3. Garantir que os 5 usuários mantidos estão ativos e com dados intactos
    // -------------------------------------------------------------------------
    try {
      app
        .db()
        .newQuery(
          `UPDATE users SET ativo = 1 WHERE email IN (${allowedEmails.map((e) => `'${e}'`).join(', ')})`,
        )
        .execute()
    } catch (_) {}
  },
  (app) => {
    // Migration de limpeza não possui rollback de dados apagados
  },
)
