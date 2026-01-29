require('dotenv').config()
const app = require('./app')
const sequelize = require('./config/database')
const { ensureDefaultUser } = require('./config/defaultUser')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Conexão com o banco estabelecida com sucesso.')

    await sequelize.sync()
    console.log('Models sincronizados com o banco de dados.')

    const user = await ensureDefaultUser()
    console.log(`Usuário padrão OK: id=${user.id}, email=${user.email}`)

    app.listen(PORT, () => {
      console.log(`API To-Do rodando em http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Falha ao iniciar a aplicação:', error)
    process.exit(1)
  }
}

start()
