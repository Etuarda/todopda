const { Sequelize } = require('sequelize')
const path = require('path')

// Define o caminho padrão do arquivo do banco, caso não venha do .env
const DB_STORAGE =
  process.env.DB_STORAGE ||
  path.join(__dirname, '..', '..', 'database.sqlite')

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_STORAGE,
  logging: false
})

module.exports = sequelize
