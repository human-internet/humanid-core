"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn("User", "lastVerifiedAt", {
            type: Sequelize.DATE,
            allowNull: true,
            defaultValue: null,
        });
    },

    async down(_queryInterface, _Sequelize) {
        // Do nothing
    },
};
