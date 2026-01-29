// src/middlewares/authMiddleware.js
const { User } = require('../models/User')

// Auth didático SEM JWT e SEM header obrigatório.
// A API sempre usa o usuário padrão criado no boot (server.js).
async function authMiddleware(req, res, next) {
  try {
    const defaultUserId = Number(req.app?.locals?.defaultUserId)

    if (!Number.isInteger(defaultUserId) || defaultUserId <= 0) {
      return res.status(500).json({
        erro:
          'Usuário padrão não foi configurado. Verifique se ensureDefaultUser() está rodando no server.js.',
        code: 'DEFAULT_USER_NOT_CONFIGURED'
      })
    }

    const user = await User.findByPk(defaultUserId)
    if (!user) {
      return res.status(500).json({
        erro: 'Usuário padrão não existe no banco. Recrie o usuário padrão.',
        code: 'DEFAULT_USER_NOT_FOUND'
      })
    }

    req.user = { id: user.id, email: user.email }
    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = { authMiddleware }
