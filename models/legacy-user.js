'use strict'

const
    TABLE_NAME = 'LegacyUsers',
    MODEL_NAME = 'LegacyUser'

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(MODEL_NAME, {
        hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        tableName: TABLE_NAME
    })
    User.associate = function (models) {
        User.hasMany(models.LegacyAppUser, {
            foreignKey: 'userId'
        })
        User.belongsToMany(models.LegacyApp, {
            through: models.LegacyAppUser,
            as: 'apps',
            foreignKey: 'userId',
            otherKey: 'appId',
        })
    }
    return User
}