"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("DevConsoleUser", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.BIGINT,
            },
            dcUserId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: true,
            },
            balance: {
                type: Sequelize.DECIMAL(20, 5),
                allowNull: false,
                defaultValue: 5,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            deletedAt: {
                allowNull: true,
                type: Sequelize.DATE,
            },
        });
        await queryInterface.addIndex("DevConsoleUser", ["dcUserId"], { unique: true });
    },
    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("DevConsoleUser");
    },
};
