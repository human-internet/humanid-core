'use strict'

const
    TABLE_NAME = 'LegacyAdmins',
    MODEL_NAME = 'LegacyAdmin'

module.exports = (sequelize, DataTypes) => {
    const Admin = sequelize.define(MODEL_NAME, {
        email: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        tableName: TABLE_NAME
    })

    Admin.prototype.toJSON = function () {
        let values = Object.assign({}, this.get())
        delete values.id
        delete values.password
        return values
    }

    Admin.associate = function (models) {
        // associations can be defined here
    }

    return Admin
}