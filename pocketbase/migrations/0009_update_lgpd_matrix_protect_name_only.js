migrate(
  (app) => {
    const configLgpdCol = app.findCollectionByNameOrId('config_lgpd_campos')

    // Administrador para atualizar registro
    let adminUserId = ''
    try {
      const adminUser = app.findAuthRecordByEmail('_pb_users_auth_', 'mateus.martins@venart.com.br')
      adminUserId = adminUser.id
    } catch (_) {
      try {
        const fallback = app.findAuthRecordByEmail('_pb_users_auth_', 'paulotmfranco@gmail.com')
        adminUserId = fallback.id
      } catch (_) {}
    }

    // Regra do Usuário: "De acordo com o LGPD somente proteger o nome do paciente/beneficiário"
    // Portanto, para TODOS os 4 perfis:
    // - nome: false (protegido / oculto)
    // - condicao_principal: true (visível)
    // - risco: true (visível)
    // - custo_12m: true (visível)
    const perfis = ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO']
    const campos = [
      { campo: 'nome', visivel: false },
      { campo: 'condicao_principal', visivel: true },
      { campo: 'risco', visivel: true },
      { campo: 'custo_12m', visivel: true },
    ]

    const now = new Date().toISOString()

    for (const perfil of perfis) {
      for (const item of campos) {
        let rec
        try {
          const found = app.findRecordsByFilter(
            'config_lgpd_campos',
            `perfil = '${perfil}' && campo = '${item.campo}'`,
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

        rec.set('perfil', perfil)
        rec.set('campo', item.campo)
        rec.set('visivel', item.visivel)
        if (adminUserId) {
          rec.set('atualizado_por', adminUserId)
        }
        rec.set('atualizado_em', now)
        app.save(rec)
      }
    }
  },
  (app) => {
    // Rollback para valores anteriores (se necessário)
    // Anteriormente:
    // GESTOR_PROGRAMA: todos true
    // GESTOR_VENART: nome=false, demais true
    // GESTOR_RH: nome=false, demais true
    // OPERACAO: todos false
    const previous = [
      { perfil: 'GESTOR_PROGRAMA', campo: 'nome', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_PROGRAMA', campo: 'custo_12m', visivel: true },

      { perfil: 'GESTOR_VENART', campo: 'nome', visivel: false },
      { perfil: 'GESTOR_VENART', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_VENART', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_VENART', campo: 'custo_12m', visivel: true },

      { perfil: 'GESTOR_RH', campo: 'nome', visivel: false },
      { perfil: 'GESTOR_RH', campo: 'condicao_principal', visivel: true },
      { perfil: 'GESTOR_RH', campo: 'risco', visivel: true },
      { perfil: 'GESTOR_RH', campo: 'custo_12m', visivel: true },

      { perfil: 'OPERACAO', campo: 'nome', visivel: false },
      { perfil: 'OPERACAO', campo: 'condicao_principal', visivel: false },
      { perfil: 'OPERACAO', campo: 'risco', visivel: false },
      { perfil: 'OPERACAO', campo: 'custo_12m', visivel: false },
    ]

    for (const item of previous) {
      try {
        const found = app.findRecordsByFilter(
          'config_lgpd_campos',
          `perfil = '${item.perfil}' && campo = '${item.campo}'`,
          '',
          1,
          0,
        )
        if (found && found.length > 0) {
          const rec = found[0]
          rec.set('visivel', item.visivel)
          app.save(rec)
        }
      } catch (_) {}
    }
  },
)
