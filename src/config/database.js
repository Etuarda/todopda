const { Sequelize } = require('sequelize')
const path = require('path')

function buildSequelize() {
  // Produção: plataformas geralmente fornecem DATABASE_URL
  if (process.env.DATABASE_URL) {
    return new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      protocol: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: process.env.DB_SSL === 'true'
          ? { require: true, rejectUnauthorized: false }
          : undefined
      }
    })
  }

  // Dev/local: SQLite
  const DB_STORAGE =
    process.env.DB_STORAGE || path.join(__dirname, '..', '..', 'database.sqlite')

  return new Sequelize({
    dialect: 'sqlite',
    storage: DB_STORAGE,
    logging: false
  })
}

module.exports = buildSequelize()
