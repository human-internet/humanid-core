const Sequelize = require("sequelize");

const MODEL_NAME = "UserRecoverySession",
    TABLE_NAME = "UserRecoverySession";

module.exports = (sequelize) => {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                autoIncrement: true,
                type: Sequelize.BIGINT,
                allowNull: false,
                primaryKey: true,
            },
            userId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "User",
                    key: "id",
                },
            },
            extId: {
                type: Sequelize.STRING(255),
                allowNull: false,
                unique: "user_recovery_session_ext_id",
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        },
        {
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
                    name: "user_recovery_session_ext_id",
                    unique: true,
                    using: "BTREE",
                    fields: [{ name: "extId" }],
                },
                {
                    name: "userId",
                    using: "BTREE",
                    fields: [{ name: "userId" }],
                },
            ],
        }
    );

    Model.associate = function (models) {
        Model.belongsTo(models.User, {
            foreignKey: "userId",
            as: "user",
        });
    };

    return Model;
};
