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
            requestId: {
                type: Sequelize.STRING(255),
                allowNull: false,
            },
            userId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "User",
                    key: "id",
                },
            },
            targetAppUserId: {
                type: Sequelize.BIGINT,
                allowNull: true,
                references: {
                    model: "AppUser",
                    key: "id",
                },
            },
            rule: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            otpCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            failAttemptCount: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            nextResendAt: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            appId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "App",
                    key: "id",
                },
            },
            appCredentialId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: "AppCredential",
                    key: "id",
                },
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

        Model.belongsTo(models.AppUser, {
            foreignKey: "targetAppUserId",
            as: "targetAppUser",
        });

        Model.belongsTo(models.AppCredential, {
            foreignKey: "appCredentialId",
            as: "appCredential",
        });
    };

    return Model;
};
