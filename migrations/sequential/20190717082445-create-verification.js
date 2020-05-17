'use strict'

const TABLE_NAME = 'LegacyVerifications'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(TABLE_NAME, {
            number: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.STRING
            },
            requestId: {
                allowNull: false,
                type: Sequelize.STRING
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
        await queryInterface.addIndex(TABLE_NAME, ['requestId'])

    },
    down: async queryInterface => {
        await queryInterface.removeIndex(TABLE_NAME, ['requestId'])
        await queryInterface.dropTable(TABLE_NAME)
    }
};