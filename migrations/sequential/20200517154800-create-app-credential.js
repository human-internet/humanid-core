'use strict'

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('CredentialStatus', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false,
            },
            name: {
                type: Sequelize.STRING(32),
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })
        await queryInterface.createTable('CredentialType', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: false,
            },
            name: {
                type: Sequelize.STRING(32),
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: '2020-01-01 00:00:00'
            }
        })
        await queryInterface.createTable('AppCredential', {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true
            },
            appId: {
                type: Sequelize.BIGINT,
                allowNull: false,
                references: {
                    model: 'App',
                    key: 'id'
                }
            },
            credentialTypeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'CredentialType',
                    key: 'id'
                }
            },
            name: {
                type: Sequelize.STRING(128),
                allowNull: false
            },
            clientId: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            clientSecret: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            options: {
                type: Sequelize.JSON,
                allowNull: false,
                defaultValue: '{}'
            },
            credentialStatusId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'CredentialStatus',
                    key: 'id'
                }
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
                type: Sequelize.BIGINT,
                allowNull: false,
                defaultValue: 1
            }
        })
        await queryInterface.addIndex('AppCredential', ['clientId'])
        await queryInterface.bulkInsert('CredentialStatus', [
            {id: 1, name: 'Active', updatedAt: '2020-01-01 00:00:00'},
            {id: 2, name: 'Inactive', updatedAt: '2020-01-01 00:00:00'}
        ])
        await queryInterface.bulkInsert('CredentialType', [
            {id: 1, name: 'Server Credential', updatedAt: '2020-01-01 00:00:00'},
            {id: 2, name: 'Mobile SDK Credential', updatedAt: '2020-01-01 00:00:00'}
        ])
    },
    down: async queryInterface => {
        await queryInterface.removeIndex('AppCredential', ['clientId'])
        await queryInterface.dropTable('AppCredential')
        await queryInterface.dropTable('CredentialType')
        await queryInterface.dropTable('CredentialStatus')
    }
}
