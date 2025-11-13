const express = require('express')
const tarefaRoutes = require('./routes/tarefaRoutes')

const app = express()

// Middleware para interpretar JSON
app.use(express.json())

// Middleware de log simples
app.use((req, res, next) => {
  const now = new Date().toISOString()
  next()
})

// Prefixo para as rotas da API
app.use('/api', tarefaRoutes)

// Rota padrão para ver se o servidor está online
app.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'API To-Do List está online.' })
})

// Middleware para rota não encontrada
app.use((req, res, next) => {
  return res.status(404).json({ erro: 'Endpoint não encontrado.' })
})

// Middleware genérico de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro interno:', err)
  return res
    .status(500)
    .json({ erro: 'Erro interno do servidor. Tente novamente mais tarde.' })
})

module.exports = app
