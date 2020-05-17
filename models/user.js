'use strict'

const
    TABLE_NAME = 'LegacyUsers',
    MODEL_NAME = 'User'

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
        User.hasMany(models.AppUser)
        User.belongsToMany(models.App, {
            through: models.AppUser,
            as: 'apps',
            foreignKey: 'userId',
            otherKey: 'appId',
        })
    }
    return User
}