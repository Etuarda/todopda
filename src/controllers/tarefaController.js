// src/controllers/tarefaController.js
// Controlador com a lógica de negócio das tarefas.

const { Tarefa, ALLOWED_STATUS } = require('../models/Tarefa')

// Valida se o ID é um número inteiro positivo
function parseId(paramId) {
  const id = Number(paramId)
  if (!Number.isInteger(id) || id <= 0) {
    return null
  }
  return id
}

// Verifica se o status é permitido
function isValidStatus(status) {
  return ALLOWED_STATUS.includes(status)
}

// Normaliza e valida o corpo para criação/atualização completa
function validateTarefaBody(body) {
  const errors = []

  const titulo = typeof body.titulo === 'string' ? body.titulo.trim() : ''
  const descricao =
    typeof body.descricao === 'string' ? body.descricao.trim() : null
  const status =
    typeof body.status === 'string' ? body.status.trim() : 'a fazer'

  if (!titulo) {
    errors.push('O campo "titulo" é obrigatório e não pode ser vazio.')
  }

  if (!isValidStatus(status)) {
    errors.push(
      `O campo "status" deve ser um dos valores: ${ALLOWED_STATUS.join(', ')}.`
    )
  }

  return {
    errors,
    data: { titulo, descricao, status }
  }
}

// POST /tarefas
async function criarTarefa(req, res, next) {
  try {
    const { errors, data } = validateTarefaBody(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors })
    }

    const tarefa = await Tarefa.create(data)
    return res.status(201).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// GET /tarefas
async function listarTarefas(req, res, next) {
  try {
    const { status } = req.query
    const where = {}

    if (status) {
      if (!isValidStatus(status)) {
        return res.status(400).json({
          erro: `Status inválido. Use um dos valores: ${ALLOWED_STATUS.join(', ')}.`
        })
      }
      where.status = status
    }

    const tarefas = await Tarefa.findAll({
      where,
      order: [['id', 'ASC']]
    })

    return res.status(200).json(tarefas)
  } catch (error) {
    next(error)
  }
}

// GET /tarefas/:id
async function buscarTarefaPorId(req, res, next) {
  try {
    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findByPk(id)
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    return res.status(200).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// PUT /tarefas/:id
async function atualizarTarefa(req, res, next) {
  try {
    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findByPk(id)
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    const { errors, data } = validateTarefaBody(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors })
    }

    await tarefa.update(data)

    return res.status(200).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// PATCH /tarefas/:id/status
async function atualizarStatusTarefa(req, res, next) {
  try {
    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const { status } = req.body
    if (typeof status !== 'string' || !isValidStatus(status.trim())) {
      return res.status(400).json({
        erro: `O campo "status" é obrigatório e deve ser um dos valores: ${ALLOWED_STATUS.join(', ')}.`
      })
    }

    const tarefa = await Tarefa.findByPk(id)
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    await tarefa.update({ status: status.trim() })
    return res.status(200).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// DELETE /tarefas/:id
async function deletarTarefa(req, res, next) {
  try {
    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findByPk(id)
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    await tarefa.destroy()
    return res.status(204).send()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  criarTarefa,
  listarTarefas,
  buscarTarefaPorId,
  atualizarTarefa,
  atualizarStatusTarefa,
  deletarTarefa
}
