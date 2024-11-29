const Sequelize = require("sequelize");

const TABLE_NAME = "TopupHistories",
    MODEL_NAME = "TopupHistories";

module.exports = (sequelize) => {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            dcUserClient: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            piId: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            amount: {
                type: Sequelize.DECIMAL(20, 5),
                allowNull: false,
                defaultValue: 0,
            },
        },
        {
            tableName: TABLE_NAME,
            timestamps: true,
        }
    );

    return Model;
};
