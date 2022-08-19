"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("UserRecoverySession", "appId", {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: "App",
                key: "id",
            },
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("UserRecoverySession", "appId", {});
    },
};
