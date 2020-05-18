'use strict'

const
    Sequelize = require('sequelize')

const
    MODEL_NAME = 'AppCredential',
    TABLE_NAME = 'AppCredential'

module.exports = (sequelize) => {
    return sequelize.define(MODEL_NAME, {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        appId: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        credentialTypeId: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING(128),
            allowNull: false
        },
        clientId: {
            type: Sequelize.STRING(64),
            allowNull: false,
        },
        clientSecret: {
            type: Sequelize.STRING(64),
            allowNull: false,
        },
        options: {
            type: Sequelize.JSON,
            allowNull: false
        },
        credentialStatusId: {
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