"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("AppUser", "markReset", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("AppUser", "markReset", {});
    },
};
