'use strict'

const
    TABLE_NAME = 'LegacyAppUsers',
    MODEL_NAME = 'LegacyAppUser'

module.exports = (sequelize, DataTypes) => {
    const AppUser = sequelize.define(MODEL_NAME, {
        deviceId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        notifId: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    }, {
        tableName: TABLE_NAME
    })

    AppUser.associate = function (models) {
        AppUser.belongsTo(models.LegacyApp, {
            foreignKey: 'appId',
            as: 'app',
        })
        AppUser.belongsTo(models.LegacyUser, {
            foreignKey: 'userId',
            as: 'user',
        })
    }

    AppUser.prototype.toJSON = function () {
        let values = Object.assign({}, this.get())
        // exclude internal user ID
        delete values.userId
        // exclude relations
        if (values.app) delete values.app
        if (values.user) delete values.user
        return values
    }

    return AppUser
}