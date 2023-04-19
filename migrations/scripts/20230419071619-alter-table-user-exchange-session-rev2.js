"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn("UserExchangeSession", "requestId", {
            type: Sequelize.STRING,
            allowNull: true,
        });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.removeColumn("UserExchangeSession", "requestId", {});
    },
};
