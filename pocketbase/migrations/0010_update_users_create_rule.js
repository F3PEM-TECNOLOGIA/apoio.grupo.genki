migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    // Permitir criação por qualquer usuário autenticado (ou anônimo se necessário, mas na aplicação o gestor/atendente está logado)
    // Usamos "" para permitir requisição de criação através da API autenticada ou não
    users.createRule = "@request.auth.id != '' || @request.auth.id = ''"
    // Permitir atualização por admin ou pelo próprio usuário ou por gestores
    users.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || @request.auth.perfil = 'GESTOR_VENART' || @request.auth.perfil = 'GESTOR_PROGRAMA' || @request.auth.perfil = 'GESTOR_RH' || @request.auth.perfil = 'OPERACAO' || id = @request.auth.id)"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.createRule = ''
    users.updateRule =
      "@request.auth.id != '' && (@request.auth.role = 'admin' || id = @request.auth.id)"
    app.save(users)
  },
)
