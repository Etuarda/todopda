const express = require('express')
const cors = require('cors')
const tarefaRoutes = require('./routes/tarefaRoutes')
const authRoutes = require('./routes/authRoutes')

const app = express()

app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  next()
})

app.use('/api', authRoutes)
app.use('/api', tarefaRoutes)

app.get('/', (req, res) => {
  res.status(200).json({ mensagem: 'API To-Do List está online.' })
})

app.use((req, res) => {
  return res.status(404).json({ erro: 'Endpoint não encontrado.' })
})

app.use((err, req, res, next) => {
  console.error('Erro interno:', err)
  return res
    .status(500)
    .json({ erro: 'Erro interno do servidor. Tente novamente mais tarde.' })
})

module.exports = app
