"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn("App", "config", {
            type: Sequelize.JSON,
        });
    },

    down: async (queryInterface, _Sequelize) => {
        await queryInterface.removeColumn("App", "config", {});
    },
};
