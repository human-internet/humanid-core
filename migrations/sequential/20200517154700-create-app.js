'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('AppStatus', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false,
                allowNull: false
            },
            name: {
                type: Sequelize.STRING(32),
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })
        await queryInterface.createTable('App', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
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
                allowNull: false,
                references: {
                    model: 'AppStatus',
                    key: 'id'
                }
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            version: {
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 1
            }
        })
        await queryInterface.bulkInsert('AppStatus', [
            {id: 1, name: 'Unverified', updatedAt: '2020-01-01 00:00:00'},
            {id: 2, name: 'Verified', updatedAt: '2020-01-01 00:00:00'},
            {id: 3, name: 'Suspended', updatedAt: '2020-01-01 00:00:00'}
        ])
    },
    down: async queryInterface => {
        await queryInterface.dropTable('App')
        await queryInterface.dropTable('AppStatus')
    }
}