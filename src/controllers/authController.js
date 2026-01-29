const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')

function signToken(user) {
    const secret = process.env.JWT_SECRET
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

    return jwt.sign(
        { email: user.email },
        secret,
        { subject: String(user.id), expiresIn }
    )
}

async function register(req, res, next) {
    try {
        const { nome, email, senha } = req.body

        if (typeof nome !== 'string' || !nome.trim()) {
            return res.status(400).json({ erro: 'Nome é obrigatório.' })
        }
        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ erro: 'E-mail é obrigatório.' })
        }
        if (typeof senha !== 'string' || senha.length < 6) {
            return res.status(400).json({ erro: 'Senha deve ter no mínimo 6 caracteres.' })
        }

        const existing = await User.findOne({ where: { email: email.trim().toLowerCase() } })
        if (existing) {
            return res.status(409).json({ erro: 'E-mail já cadastrado.' })
        }

        const passwordHash = await bcrypt.hash(senha, 10)

        const user = await User.create({
            nome: nome.trim(),
            email: email.trim().toLowerCase(),
            passwordHash
        })

        const token = signToken(user)

        return res.status(201).json({
            user: { id: user.id, nome: user.nome, email: user.email },
            token
        })
    } catch (error) {
        next(error)
    }
}

async function login(req, res, next) {
    try {
        const { email, senha } = req.body

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ erro: 'E-mail é obrigatório.' })
        }
        if (typeof senha !== 'string' || !senha) {
            return res.status(400).json({ erro: 'Senha é obrigatória.' })
        }

        const user = await User.findOne({ where: { email: email.trim().toLowerCase() } })
        if (!user) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' })
        }

        const ok = await bcrypt.compare(senha, user.passwordHash)
        if (!ok) {
            return res.status(401).json({ erro: 'Credenciais inválidas.' })
        }

        const token = signToken(user)

        return res.status(200).json({
            user: { id: user.id, nome: user.nome, email: user.email },
            token
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login }
