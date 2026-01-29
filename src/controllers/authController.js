// src/controllers/authController.js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models/User')

function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function createHttpError(statusCode, code, message) {
    const err = new Error(message)
    err.statusCode = statusCode
    err.code = code
    err.publicMessage = message
    return err
}

function signToken(user) {
    const secret = process.env.JWT_SECRET
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d'

    if (!secret || typeof secret !== 'string' || !secret.trim()) {
        throw createHttpError(500, 'JWT_SECRET_MISSING', 'JWT_SECRET não configurado.')
    }

    return jwt.sign(
        { email: user.email },
        secret,
        { subject: String(user.id), expiresIn }
    )
}

async function register(req, res, next) {
    try {
        const nome = typeof req.body?.nome === 'string' ? req.body.nome.trim() : ''
        const email = normalizeEmail(req.body?.email)
        const senha = typeof req.body?.senha === 'string' ? req.body.senha : ''

        if (!nome) {
            return res.status(400).json({ erro: 'Nome é obrigatório.', code: 'VALIDATION_ERROR' })
        }
        if (!email) {
            return res.status(400).json({ erro: 'E-mail é obrigatório.', code: 'VALIDATION_ERROR' })
        }
        if (!senha || senha.length < 6) {
            return res.status(400).json({
                erro: 'Senha deve ter no mínimo 6 caracteres.',
                code: 'VALIDATION_ERROR'
            })
        }

        const existing = await User.findOne({ where: { email } })
        if (existing) {
            return res.status(409).json({ erro: 'E-mail já cadastrado.', code: 'EMAIL_ALREADY_EXISTS' })
        }

        const passwordHash = await bcrypt.hash(senha, 10)

        const user = await User.create({
            nome,
            email,
            passwordHash
        })

        const token = signToken(user)

        return res.status(201).json({
            user: { id: user.id, nome: user.nome, email: user.email },
            token
        })
    } catch (error) {
        return next(error)
    }
}

async function login(req, res, next) {
    try {
        const email = normalizeEmail(req.body?.email)
        const senha = typeof req.body?.senha === 'string' ? req.body.senha : ''

        if (!email) {
            return res.status(400).json({ erro: 'E-mail é obrigatório.', code: 'VALIDATION_ERROR' })
        }
        if (!senha) {
            return res.status(400).json({ erro: 'Senha é obrigatória.', code: 'VALIDATION_ERROR' })
        }

        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(401).json({ erro: 'Credenciais inválidas.', code: 'INVALID_CREDENTIALS' })
        }

        const ok = await bcrypt.compare(senha, user.passwordHash)
        if (!ok) {
            return res.status(401).json({ erro: 'Credenciais inválidas.', code: 'INVALID_CREDENTIALS' })
        }

        const token = signToken(user)

        return res.status(200).json({
            user: { id: user.id, nome: user.nome, email: user.email },
            token
        })
    } catch (error) {
        return next(error)
    }
}

module.exports = { register, login }
