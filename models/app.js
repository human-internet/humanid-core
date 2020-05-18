'use strict'

const
    Sequelize = require('sequelize')

const
    MODEL_NAME = 'App',
    TABLE_NAME = 'App'

module.exports = sequelize => {
    return sequelize.define(MODEL_NAME, {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        extId: {
            type: Sequelize.STRING(64),
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        logoFile: {
            type: Sequelize.STRING(64),
            allowNull: true,
        },
        appStatusId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        version: {
            type: Sequelize.BIGINT,
            allowNull: false
        }
    }, {
        tableName: TABLE_NAME,
        timestamps: true
    })
}