'use strict'

const TABLE_NAME = 'LegacyAppUsers'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable(TABLE_NAME, {
            appId: {
                type: Sequelize.STRING,
                primaryKey: true,
                references: {
                    model: 'LegacyApps',
                    key: 'id',
                },
            },
            userId: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                references: {
                    model: 'LegacyUsers',
                    key: 'id',
                },
            },
            deviceId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            notifId: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            hash: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },
    down: async queryInterface => {
        await queryInterface.dropTable(TABLE_NAME);
    }
};