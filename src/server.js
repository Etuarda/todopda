require('dotenv').config()
const app = require('./app')
const sequelize = require('./config/database')

const PORT = process.env.PORT || 3000

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Conexão com o banco estabelecida com sucesso.')

    // Cria/sincroniza as tabelas com base nos models
    await sequelize.sync()
    console.log('Models sincronizados com o banco de dados.')

    app.listen(PORT, () => {
      console.log(`API To-Do rodando em http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Falha ao iniciar a aplicação:', error)
    process.exit(1)
  }
}

start()
