"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("UserExchangeSession", "appCredentialId", {
            type: Sequelize.BIGINT,
            allowNull: true,
            references: {
                model: "AppCredential",
                key: "id",
            },
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("UserExchangeSession", "appCredentialId", {});
    },
};
