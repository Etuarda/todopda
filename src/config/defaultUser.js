// src/config/defaultUser.js
const bcrypt = require('bcryptjs')
const { User } = require('../models/User')

const DEFAULT_USER_EMAIL = process.env.DEFAULT_USER_EMAIL || 'default@todopda.local'
const DEFAULT_USER_NAME = process.env.DEFAULT_USER_NAME || 'Usuário Padrão'
const DEFAULT_USER_PASSWORD = process.env.DEFAULT_USER_PASSWORD || '123456'

async function ensureDefaultUser() {
  const existing = await User.findOne({ where: { email: DEFAULT_USER_EMAIL } })
  if (existing) return existing

  const passwordHash = await bcrypt.hash(DEFAULT_USER_PASSWORD, 10)

  const user = await User.create({
    nome: DEFAULT_USER_NAME,
    email: DEFAULT_USER_EMAIL,
    passwordHash
  })

  return user
}

module.exports = { ensureDefaultUser }
