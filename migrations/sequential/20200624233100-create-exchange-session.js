'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create reference data table
        await queryInterface.createTable('UserExchangeSession', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            appUserId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'AppUser',
                    key: 'id'
                }
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })
    },
    down: async queryInterface => {
        await queryInterface.dropTable('UserExchangeSession')
    }
}
