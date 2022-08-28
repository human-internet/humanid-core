"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("UserRecoverySession", "appCredentialId", {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: "AppCredential",
                key: "id",
            },
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("UserRecoverySession", "appCredentialId", {});
    },
};
