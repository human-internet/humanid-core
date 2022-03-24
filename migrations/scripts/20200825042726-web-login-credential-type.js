"use strict";

module.exports = {
    up: async (queryInterface, _Sequelize) => {
        await queryInterface.bulkInsert("CredentialType", [
            { id: 3, name: "Internal Web Log-in Credential", updatedAt: "2020-01-01 00:00:00" },
        ]);
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.bulkDelete("CredentialType", {
            id: 3,
        });
    },
};
