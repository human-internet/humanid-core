'use strict'

const Sequelize = require('sequelize')

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('DemoAppUser', {
        id: {
            type: Sequelize.BIGINT,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        extId: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        userHash: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        fullName: {
            type: Sequelize.STRING,
            allowNull: true,
        },
        lastLogIn: {
            type: Sequelize.DATE,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
        }
    }, {})

    return User
}