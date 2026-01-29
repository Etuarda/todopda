// src/controllers/tarefaController.js
// Controlador com a lógica de negócio das tarefas.
const { User } = require('../models/User')

const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL || 'default@todopda.local'

async function getDefaultUserId() {
  const user = await User.findOne({ where: { email: DEFAULT_USER_EMAIL } })
  return user?.id || null
}

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
  const descricao = typeof body.descricao === 'string' ? body.descricao.trim() : null
  const status = typeof body.status === 'string' ? body.status.trim() : 'a fazer'

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

function getAuthenticatedUserId(req) {
  const userId = req?.user?.id
  const normalized = Number(userId)

  if (!Number.isInteger(normalized) || normalized <= 0) {
    return null
  }

  return normalized
}

// POST /tarefas
async function criarTarefa(req, res, next) {
  try {
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })

    const { errors, data } = validateTarefaBody(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors })
    }

    // userId vem do authMiddleware (x-user-id), nunca do body
    const tarefa = await Tarefa.create({ ...data, userId })
    return res.status(201).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// GET /tarefas
async function listarTarefas(req, res, next) {
  try {
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })
    const where = { userId }

    const { status } = req.query

    if (typeof status === 'string' && status.trim()) {
      const normalizedStatus = status.trim()
      if (!isValidStatus(normalizedStatus)) {
        return res.status(400).json({
          erro: `Status inválido. Use um dos valores: ${ALLOWED_STATUS.join(', ')}.`
        })
      }
      where.status = normalizedStatus
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
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })
    const where = { userId }

    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findOne({ where: { id, userId } })
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
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })
    const where = { userId }

    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findOne({ where: { id, userId } })
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    const { errors, data } = validateTarefaBody(req.body)

    if (errors.length > 0) {
      return res.status(400).json({ erros: errors })
    }

    // Não permite trocar ownership (mesmo que alguém tente mandar userId no body)
    await tarefa.update({ ...data, userId })

    return res.status(200).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// PATCH /tarefas/:id/status
async function atualizarStatusTarefa(req, res, next) {
  try {
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })
    const where = { userId }

    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const { status } = req.body
    const normalizedStatus = typeof status === 'string' ? status.trim() : ''

    if (!normalizedStatus || !isValidStatus(normalizedStatus)) {
      return res.status(400).json({
        erro: `O campo "status" é obrigatório e deve ser um dos valores: ${ALLOWED_STATUS.join(', ')}.`
      })
    }

    const tarefa = await Tarefa.findOne({ where: { id, userId } })
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' })
    }

    await tarefa.update({ status: normalizedStatus })
    return res.status(200).json(tarefa)
  } catch (error) {
    next(error)
  }
}

// DELETE /tarefas/:id
async function deletarTarefa(req, res, next) {
  try {
    const userId = await getDefaultUserId()
    if (!userId) return res.status(500).json({ erro: 'Usuário padrão não encontrado.' })
    const where = { userId }

    const id = parseId(req.params.id)
    if (!id) {
      return res.status(400).json({ erro: 'ID inválido.' })
    }

    const tarefa = await Tarefa.findOne({ where: { id, userId } })
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
