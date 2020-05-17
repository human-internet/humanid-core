'use strict'

const TABLE_NAME = 'LegacyConfirmations'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(TABLE_NAME, {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            appId: {
                type: Sequelize.STRING,
                allowNull: false,
                references: {
                    model: 'LegacyApps',
                    key: 'id',
                },
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'LegacyUsers',
                    key: 'id',
                },
            },
            type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            confirmingAppId: {
                type: Sequelize.STRING
            },
            messageId: {
                type: Sequelize.STRING
            },
            sessionId: {
                type: Sequelize.STRING
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        })
    },
    down: async queryInterface => {
        await queryInterface.dropTable(TABLE_NAME)
    }
}