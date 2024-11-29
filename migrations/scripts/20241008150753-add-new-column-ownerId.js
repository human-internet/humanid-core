"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("App", "ownerId", {
            type: Sequelize.BIGINT,
            allowNull: false,
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("App", "ownerId", {});
    },
};
