"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, _Sequelize) {
        await queryInterface.renameColumn("App", "ownerId", "dcProjectId");
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.renameColumn("App", "dcProjectId", "ownerId");
    },
};
