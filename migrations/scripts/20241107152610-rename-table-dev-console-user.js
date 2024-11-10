"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.renameTable("DevConsoleUser", "DevConsoleClient");
        await queryInterface.renameColumn("DevConsoleClient", "dcUserId", "dcClientId");
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.renameColumn("DevConsoleClient", "dcClientId", "dcUserId");
        await queryInterface.renameTable("DevConsoleClient", "DevConsoleUser");
    },
};
