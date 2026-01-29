// src/middlewares/authMiddleware.js
const { User } = require('../models/User')

// Auth simples SEM JWT (didático).
// O cliente envia: x-user-id: <id do usuário>
// Isso NÃO é seguro em produção, mas remove JWT mantendo o escopo por usuário.
async function authMiddleware(req, res, next) {
    try {
        const rawUserId = req.header('x-user-id')
        const userId = Number(rawUserId)

        if (!rawUserId || !Number.isInteger(userId) || userId <= 0) {
            return res.status(401).json({
                erro: 'Cabeçalho x-user-id ausente ou inválido. Faça login.',
                code: 'AUTH_USER_ID_MISSING'
            })
        }

        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(401).json({
                erro: 'Usuário inválido. Faça login novamente.',
                code: 'AUTH_USER_NOT_FOUND'
            })
        }

        req.user = { id: user.id, email: user.email }
        return next()
    } catch (err) {
        return next(err)
    }
}

module.exports = { authMiddleware }
