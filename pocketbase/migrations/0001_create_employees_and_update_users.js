migrate(
  (app) => {
    // 1. Create employees collection first
    const employees = new Collection({
      name: 'employees',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || @request.auth.funcionario_id.id = id)",
      viewRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || @request.auth.funcionario_id.id = id)",
      createRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude')",
      updateRule:
        "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.role = 'gestor' || @request.auth.role = 'profissional_saude' || @request.auth.funcionario_id.id = id)",
      deleteRule: "@request.auth.id != '' && @request.auth.role = 'admin'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        { name: 'email', type: 'text' },
        { name: 'cpf', type: 'text' },
        { name: 'matricula', type: 'text' },
        { name: 'cargo', type: 'text' },
        { name: 'departamento', type: 'text' },
        { name: 'unidade', type: 'text' },
        { name: 'data_admissao', type: 'date' },
        { name: 'data_nascimento', type: 'date' },
        {
          name: 'genero',
          type: 'select',
          values: ['masculino', 'feminino', 'outro', 'nao_informado'],
          maxSelect: 1,
        },
        { name: 'telefone', type: 'text' },
        {
          name: 'risco_ocupacional',
          type: 'select',
          values: ['baixo', 'medio', 'alto'],
          maxSelect: 1,
        },
        { name: 'gerente_id', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'consentimento_lgpd', type: 'bool' },
        { name: 'data_consentimento', type: 'date' },
        { name: 'status', type: 'select', values: ['ativo', 'inativo'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_employees_cpf ON employees (cpf) WHERE cpf != ''",
        "CREATE UNIQUE INDEX idx_employees_matricula ON employees (matricula) WHERE matricula != ''",
        'CREATE INDEX idx_employees_dept ON employees (departamento)',
        'CREATE INDEX idx_employees_status ON employees (status)',
        'CREATE INDEX idx_employees_gerente ON employees (gerente_id)',
      ],
    })
    app.save(employees)

    // 2. Add role and funcionario_id to users collection
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    if (!users.fields.getByName('role')) {
      users.fields.add(
        new SelectField({
          name: 'role',
          values: ['admin', 'gestor', 'profissional_saude', 'colaborador'],
          maxSelect: 1,
        }),
      )
    }
    if (!users.fields.getByName('funcionario_id')) {
      users.fields.add(
        new RelationField({
          name: 'funcionario_id',
          collectionId: employees.id,
          maxSelect: 1,
        }),
      )
    }
    users.listRule = "@request.auth.id != ''"
    users.viewRule = "@request.auth.id != ''"
    users.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || id = @request.auth.id)"
    users.deleteRule = "@request.auth.id != '' && @request.auth.role = 'admin'"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const roleField = users.fields.getByName('role')
    if (roleField) users.fields.removeByName('role')
    const funcField = users.fields.getByName('funcionario_id')
    if (funcField) users.fields.removeByName('funcionario_id')
    app.save(users)

    try {
      const employees = app.findCollectionByNameOrId('employees')
      app.delete(employees)
    } catch (_) {}
  },
)
