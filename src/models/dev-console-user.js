"use strict";

const Sequelize = require("sequelize");

const TABLE_NAME = "DevConsoleUser",
    MODEL_NAME = "DevConsoleUser";

module.exports = (sequelize) => {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            dcUserId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: true,
            },
            balance: {
                type: Sequelize.FLOAT,
                allowNull: false,
                defaultValue: 5,
            },
        },
        {
            tableName: TABLE_NAME,
            timestamps: true,
            paranoid: true,
        }
    );

    return Model;
};
