const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const ALLOWED_STATUS = ['a fazer', 'em andamento', 'concluída']

const Tarefa = sequelize.define(
  'Tarefa',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: { msg: 'Título não pode ser vazio.' } }
    },
    descricao: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'a fazer',
      validate: {
        isIn: {
          args: [ALLOWED_STATUS],
          msg: `Status inválido. Use um dos valores: ${ALLOWED_STATUS.join(', ')}.`
        }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: 'tarefas',
    timestamps: true
  }
)

module.exports = { Tarefa, ALLOWED_STATUS }
