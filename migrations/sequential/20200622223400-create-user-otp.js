'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Create reference data table
        await queryInterface.createTable('UserOTPSession', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: false,
            },
            appUserId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'AppUser',
                    key: 'id'
                }
            },
            rule: {
                type: Sequelize.JSON,
                allowNull: false
            },
            otpCount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            failAttemptCount: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            version: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })

        // Create table
        await queryInterface.createTable('UserOTP', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            sessionId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'UserOTPSession',
                    key: 'id'
                }
            },
            otpNo: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            requestId: {
                type: Sequelize.STRING(64),
                allowNull: false
            },
            signature: {
                type: Sequelize.STRING(256),
                allowNull: false
            },
            metadata: {
                type: Sequelize.JSON,
                allowNull: false
            },
            expiredAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })

        // Create index
        await queryInterface.addIndex('UserOTP', ['requestId'], {indicesType: "UNIQUE"})
    },
    down: async queryInterface => {
        await queryInterface.dropTable('UserOTP')
        await queryInterface.dropTable('UserOTPSession')
    }
}
