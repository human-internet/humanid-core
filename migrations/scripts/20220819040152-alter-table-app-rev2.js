"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("User", "recoveryEmail", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("User", "recoveryEmail", {});
    },
};
