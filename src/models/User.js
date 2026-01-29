const { DataTypes } = require('sequelize')
const sequelize = require('../config/database')

const User = sequelize.define(
    'User',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nome: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: { notEmpty: { msg: 'Nome não pode ser vazio.' } }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: { msg: 'E-mail inválido.' },
                notEmpty: { msg: 'E-mail não pode ser vazio.' }
            }
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        tableName: 'users',
        timestamps: true
    }
)

module.exports = { User }
