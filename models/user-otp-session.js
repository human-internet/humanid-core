'use strict'

const
    Sequelize = require('sequelize')
const
    TABLE_NAME = 'UserOTPSession',
    MODEL_NAME = 'UserOTPSession'

module.exports = (sequelize) => {
    const Model = sequelize.define(MODEL_NAME, {
        id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        appUserId: {
            type: Sequelize.BIGINT,
            allowNull: false
        },
        rule: {
            type: Sequelize.JSON,
            allowNull: false
        },
        otpCount: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        failAttemptCount: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        expiredAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false
        }
    }, {
        tableName: TABLE_NAME
    })

    Model.associate = function (models) {
        Model.belongsTo(models.AppUser, {
            foreignKey: 'appUserId',
            as: 'appUser',
        })
    }

    return Model
}