const Sequelize = require("sequelize");

const TABLE_NAME = "DevConsoleClient",
    MODEL_NAME = "DevConsoleClient";

module.exports = (sequelize) => {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            dcClientId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                unique: true,
            },
            balance: {
                type: Sequelize.DECIMAL(20, 5),
                allowNull: false,
                defaultValue: 5,
            },
        },
        {
            tableName: TABLE_NAME,
            timestamps: true,
            paranoid: true,
            indexes: [
                {
                    fields: ["dcClientId"],
                },
            ],
        }
    );

    return Model;
};
