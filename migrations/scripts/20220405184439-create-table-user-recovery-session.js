"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("UserRecoverySession", {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            userId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "User",
                    key: "id",
                },
            },
            extId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: "2020-01-01 00:00:00",
            },
        });

        await queryInterface.addIndex("UserRecoverySession", ["extId"], { unique: true });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("UserRecoverySession");
    },
};
