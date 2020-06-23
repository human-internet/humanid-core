'use strict'

const
    Sequelize = require('sequelize')

const
    TABLE_NAME = 'AppUser',
    MODEL_NAME = 'AppUser'

module.exports = (sequelize) => {
    const Model = sequelize.define(MODEL_NAME, {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        appId: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        userId: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        extId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        accessStatusId: {
            type: Sequelize.INTEGER,
            allowNull: false
        }
    }, {
        tableName: TABLE_NAME
    })

    Model.associate = function (models) {
        Model.belongsTo(models.App, {
            foreignKey: 'appId',
            as: 'app',
        })
        Model.belongsTo(models.AppUser, {
            foreignKey: 'userId',
            as: 'user',
        })
    }

    return Model
}