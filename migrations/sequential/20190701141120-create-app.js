'use strict'

const TABLE_NAME = 'LegacyApps'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(TABLE_NAME, {
            id: {
                allowNull: false,
                autoIncrement: false,
                primaryKey: true,
                type: Sequelize.STRING,
            },
            secret: {
                type: Sequelize.STRING,
            },
            urls: {
                type: Sequelize.STRING,
            },
            platform: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            serverKey: {
                type: Sequelize.STRING,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            }
        })
    },
    down: async queryInterface => {
        await queryInterface.dropTable(TABLE_NAME);
    }
};