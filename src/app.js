const express = require('express')
const cors = require('cors')
const tarefaRoutes = require('./routes/tarefaRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

const corsOptions = {
  origin: '*', // se quiser restringir, troque pelo seu domínio do front
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-user-id'],
  optionsSuccessStatus: 204
}

app.use(cors(corsOptions))
// Garante que o preflight (OPTIONS) responda corretamente
app.options('*', cors(corsOptions))

app.use(express.json())

app.use('/api', authRoutes)
app.use('/api', tarefaRoutes)

app.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'API To-Do List está online.' })
})

app.use((req, res) => {
  return res.status(404).json({ erro: 'Endpoint não encontrado.' })
})

app.use((err, req, res, next) => {
  const status = Number(err.statusCode) || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.publicMessage || 'Erro interno do servidor.'

  console.error('Erro interno:', {
    method: req.method,
    path: req.originalUrl,
    status,
    code,
    name: err.name,
    message: err.message
  })

  return res.status(status).json({ erro: message, code })
})

module.exports = app
