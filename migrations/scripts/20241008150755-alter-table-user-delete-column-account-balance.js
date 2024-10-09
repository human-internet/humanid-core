"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.removeColumn("User", "accountBalance", {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.addColumn("User", "accountBalance", {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0,
        });
    },
};
