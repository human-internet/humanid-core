'use strict'

const
    TABLE_NAME = 'LegacyConfirmations',
    MODEL_NAME = 'LegacyConfirmation'

module.exports = (sequelize, DataTypes) => {
    const Confirmation = sequelize.define(MODEL_NAME, {
        appId: DataTypes.STRING,
        userId: DataTypes.INTEGER,
        type: DataTypes.STRING,
        confirmingAppId: DataTypes.STRING,
        messageId: DataTypes.STRING,
        sessionId: DataTypes.STRING,
        status: DataTypes.STRING,
    }, {
        tableName: TABLE_NAME
    })

    Confirmation.associate = function (models) {
        // associations can be defined here
    }

    Confirmation.prototype.toJSON = function () {
        let values = Object.assign({}, this.get())
        // exclude internal user ID
        delete values.userId
        return values
    }

    // constants
    Confirmation.StatusCode = {
        PENDING: 'PENDING',
        CONFIRMED: 'CONFIRMED',
        REJECTED: 'REJECTED',
    }

    Confirmation.TypeCode = {
        WEB_LOGIN_REQUEST: 'WEB_LOGIN_REQUEST',
    }

    return Confirmation
}