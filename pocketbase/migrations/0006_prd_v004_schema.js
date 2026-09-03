migrate(
  (app) => {
    // 1. Atualizar campos da coleção users (_pb_users_auth_)
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Atualizar valores do campo perfil para os 4 novos perfis
    let perfilField = users.fields.getByName('perfil')
    if (perfilField) {
      perfilField.values = ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO']
      perfilField.maxSelect = 1
      perfilField.required = true
    } else {
      users.fields.add(
        new SelectField({
          name: 'perfil',
          values: ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO'],
          maxSelect: 1,
          required: true,
        }),
      )
    }

    // tema_preferido: LIGHT, DARK (default LIGHT)
    if (!users.fields.getByName('tema_preferido')) {
      users.fields.add(
        new SelectField({
          name: 'tema_preferido',
          values: ['LIGHT', 'DARK'],
          maxSelect: 1,
          required: true,
        }),
      )
    }

    // categoria_profissional: ENFERMEIRO, MEDICO, ADMINISTRATIVO
    if (!users.fields.getByName('categoria_profissional')) {
      users.fields.add(
        new SelectField({
          name: 'categoria_profissional',
          values: ['ENFERMEIRO', 'MEDICO', 'ADMINISTRATIVO'],
          maxSelect: 1,
        }),
      )
    }

    // registro_profissional, unidade_regiao, ativo
    if (!users.fields.getByName('registro_profissional')) {
      users.fields.add(new TextField({ name: 'registro_profissional' }))
    }
    if (!users.fields.getByName('unidade_regiao')) {
      users.fields.add(new TextField({ name: 'unidade_regiao' }))
    }
    if (!users.fields.getByName('ativo')) {
      users.fields.add(new BoolField({ name: 'ativo' }))
    }

    app.save(users)

    // 2. Criar coleção config_lgpd_campos
    let configLgpdCol
    try {
      configLgpdCol = app.findCollectionByNameOrId('config_lgpd_campos')
    } catch (_) {
      configLgpdCol = new Collection({
        name: 'config_lgpd_campos',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != ''",
        updateRule: "@request.auth.id != ''",
        deleteRule: "@request.auth.id != ''",
        fields: [
          {
            name: 'perfil',
            type: 'select',
            values: ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO'],
            maxSelect: 1,
            required: true,
          },
          {
            name: 'campo',
            type: 'select',
            values: ['nome', 'condicao_principal', 'risco', 'custo_12m'],
            maxSelect: 1,
            required: true,
          },
          { name: 'visivel', type: 'bool' },
          {
            name: 'atualizado_por',
            type: 'relation',
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
          },
          { name: 'atualizado_em', type: 'date' },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: [
          'CREATE INDEX idx_config_lgpd_perfil ON config_lgpd_campos (perfil)',
          'CREATE INDEX idx_config_lgpd_campo ON config_lgpd_campos (campo)',
        ],
      })
      app.save(configLgpdCol)
    }

    // 3. Atualizar coleção lotes_selecao
    const lotesCol = app.findCollectionByNameOrId('lotes_selecao')

    if (!lotesCol.fields.getByName('codigo_lote')) {
      lotesCol.fields.add(
        new TextField({
          name: 'codigo_lote',
          required: false,
        }),
      )
    }

    if (!lotesCol.fields.getByName('tipo_lote')) {
      lotesCol.fields.add(
        new SelectField({
          name: 'tipo_lote',
          values: ['NOVO_REGISTRO', 'ATUALIZACAO'],
          maxSelect: 1,
        }),
      )
    }

    if (!lotesCol.fields.getByName('data_importacao')) {
      lotesCol.fields.add(new DateField({ name: 'data_importacao' }))
    }

    if (!lotesCol.fields.getByName('usuario_importador_id')) {
      lotesCol.fields.add(
        new RelationField({
          name: 'usuario_importador_id',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
    }

    if (!lotesCol.fields.getByName('total_registros')) {
      lotesCol.fields.add(new NumberField({ name: 'total_registros' }))
    }

    if (!lotesCol.fields.getByName('status_processamento')) {
      lotesCol.fields.add(
        new SelectField({
          name: 'status_processamento',
          values: ['IMPORTADO', 'PROCESSADO', 'ERRO'],
          maxSelect: 1,
        }),
      )
    }

    app.save(lotesCol)

    // Adicionar índice único para codigo_lote
    try {
      lotesCol.addIndex('idx_lotes_codigo_lote', true, 'codigo_lote', '')
      app.save(lotesCol)
    } catch (_) {}

    // 4. Atualizar coleção beneficiarios
    const benefCol = app.findCollectionByNameOrId('beneficiarios')

    // Ajustar campos de nomes conforme PRD v0.0.4
    if (!benefCol.fields.getByName('nome')) {
      benefCol.fields.add(new TextField({ name: 'nome' }))
    }
    if (!benefCol.fields.getByName('vinculo')) {
      benefCol.fields.add(
        new SelectField({
          name: 'vinculo',
          values: ['TITULAR', 'DEPENDENTE'],
          maxSelect: 1,
        }),
      )
    }
    if (!benefCol.fields.getByName('unidade')) {
      benefCol.fields.add(new TextField({ name: 'unidade' }))
    }
    if (!benefCol.fields.getByName('faixa')) {
      benefCol.fields.add(new TextField({ name: 'faixa' }))
    }
    if (!benefCol.fields.getByName('custo_12m')) {
      benefCol.fields.add(new NumberField({ name: 'custo_12m' }))
    }
    if (!benefCol.fields.getByName('aprovado_por')) {
      benefCol.fields.add(
        new RelationField({
          name: 'aprovado_por',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        }),
      )
    }
    if (!benefCol.fields.getByName('data_aprovacao')) {
      benefCol.fields.add(new DateField({ name: 'data_aprovacao' }))
    }

    // Ajustar status para ELEGIVEL, SELECIONADO, APROVADO, ATENDIDO, INATIVO
    let statusField = benefCol.fields.getByName('status')
    if (statusField) {
      statusField.values = ['ELEGIVEL', 'SELECIONADO', 'APROVADO', 'ATENDIDO', 'INATIVO']
      statusField.maxSelect = 1
    }

    app.save(benefCol)

    // 5. Atualizar dashboard_cache para suportar novos perfis
    const dashCache = app.findCollectionByNameOrId('dashboard_cache')
    if (!dashCache.fields.getByName('perfil')) {
      dashCache.fields.add(
        new SelectField({
          name: 'perfil',
          values: ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO'],
          maxSelect: 1,
        }),
      )
      app.save(dashCache)
    } else {
      let dashPerfilField = dashCache.fields.getByName('perfil')
      dashPerfilField.values = ['GESTOR_VENART', 'GESTOR_PROGRAMA', 'GESTOR_RH', 'OPERACAO']
      dashPerfilField.maxSelect = 1
      app.save(dashCache)
    }
  },
  (app) => {
    // Reverter coleção config_lgpd_campos
    try {
      const col = app.findCollectionByNameOrId('config_lgpd_campos')
      app.delete(col)
    } catch (_) {}
  },
)
