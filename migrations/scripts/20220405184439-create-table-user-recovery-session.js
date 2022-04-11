"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("UserRecoverySession", {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            requestId: {
                type: Sequelize.STRING,
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
        });

        await queryInterface.createTable("UserRecoveryOTP", {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
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
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: "2020-01-01 00:00:00",
            },
        });

        await queryInterface.addIndex("UserRecoverySession", ["requestId"], { unique: true });
    },

    async down(queryInterface, _Sequelize) {
        await queryInterface.dropTable("UserRecoveryOTP");
        await queryInterface.dropTable("UserRecoverySession");
    },
};
