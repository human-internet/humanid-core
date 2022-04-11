const Sequelize = require("sequelize");

const MODEL_NAME = "UserRecoveryOTP",
    TABLE_NAME = "UserRecoveryOTP";

module.exports = (sequelize) => {
    return sequelize.define(
        MODEL_NAME,
        {
            id: {
                autoIncrement: true,
                type: Sequelize.BIGINT,
                allowNull: false,
                primaryKey: true,
            },
            sessionId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "UserRecoverySession",
                    key: "id",
                },
            },
            otpNo: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            signature: {
                type: Sequelize.STRING(256),
                allowNull: false,
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: TABLE_NAME,
            timestamps: false,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [{ name: "id" }],
                },
                {
                    name: "sessionId",
                    using: "BTREE",
                    fields: [{ name: "sessionId" }],
                },
            ],
        }
    );
};
