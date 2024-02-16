"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("User", "accountBalance", {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0,
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("User", "accountBalance", {});
    },
};
