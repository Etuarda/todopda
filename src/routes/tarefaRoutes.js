const express = require('express')
const {
  criarTarefa,
  listarTarefas,
  buscarTarefaPorId,
  atualizarTarefa,
  atualizarStatusTarefa,
  deletarTarefa
} = require('../controllers/tarefaController')

const router = express.Router()

router.post('/tarefas', criarTarefa)
router.get('/tarefas', listarTarefas)
router.get('/tarefas/:id', buscarTarefaPorId)
router.put('/tarefas/:id', atualizarTarefa)
router.patch('/tarefas/:id/status', atualizarStatusTarefa)
router.delete('/tarefas/:id', deletarTarefa)

module.exports = router
