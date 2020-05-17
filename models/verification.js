'use strict'

const
    TABLE_NAME = 'LegacyVerifications',
    MODEL_NAME = 'LegacyVerification'

module.exports = (sequelize, DataTypes) => {
    const Verification = sequelize.define(MODEL_NAME, {
        number: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        requestId: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: TABLE_NAME
    })

    Verification.associate = function (models) {
        // associations can be defined here
    }

    return Verification
}