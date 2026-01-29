require('dotenv').config()
const app = require('./app')
const sequelize = require('./config/database')
const { ensureDefaultUser } = require('./config/defaultUser')

const PORT = process.env.PORT || 3000

async function ensureUserIdColumn() {
  // SQLite: checa colunas via PRAGMA e cria se faltar
  const [cols] = await sequelize.query(`PRAGMA table_info('tarefas');`)
  const hasUserId = Array.isArray(cols) && cols.some(c => c.name === 'userId')
  if (!hasUserId) {
    await sequelize.query(`ALTER TABLE tarefas ADD COLUMN userId INTEGER;`)
    // Se quiser, define um default existente (ex: 1). Aqui vamos deixar null e preencher depois.
  }
}

async function start() {
  try {
    await sequelize.authenticate()
    console.log('Conexão com o banco estabelecida com sucesso.')

    await sequelize.sync()
    console.log('Models sincronizados com o banco de dados.')

    // patch para ambientes com SQLite antigo
    await ensureUserIdColumn()

    const user = await ensureDefaultUser()
    app.locals.defaultUserId = user.id

    // Preenche userId nas tarefas antigas (se existirem)
    await sequelize.query(`UPDATE tarefas SET userId = :uid WHERE userId IS NULL;`, {
      replacements: { uid: user.id }
    })

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
