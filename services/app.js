'use strict'

const
    APIError = require('../server/api_error'),
    Constants = require('../constants'),
    crypto = require('crypto'),
    nanoId = require('nanoid'),
    {Op} = require("sequelize");

const
    BaseService = require('./base')

const
    APP_UNVERIFIED = 1

const
    OWNER_ENTITY_ORGANIZATION = 1

const
    SERVER_CRED_TYPE = 1,
    MOBILE_SDK_CRED_TYPE = 2,
    CRED_TYPE_TEXT = {
        1: 'Server Credential',
        2: 'Mobile Credential'
    },
    CRED_TYPE_PREFIX = {
        1: 'SERVER_',
        2: 'MOBILE_'
    }

const
    ENV_PRODUCTION = 1,
    ENV_DEVELOPMENT = 2,
    ENV_TEXT = {
        1: 'Production',
        2: 'Development'
    }

const
    CREDENTIAL_ACTIVE = 1,
    CREDENTIAL_INACTIVE = 2

class AppService extends BaseService {
    constructor(services, args) {
        super('App', services, args)

        this.generateExtId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16)
        this.generateClientId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 22)
        this.generateClientSecret = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.~", 64)
    }

    async create({ownerEntityTypeId, ownerId, name}) {
        // Validate ownerEntityTypeId
        if (ownerEntityTypeId !== OWNER_ENTITY_ORGANIZATION) {
            throw new APIError("ERR_16")
        }

        // Get model reference
        const {App} = this.models

        // Init timestamp
        const timestamp = new Date()

        // Insert app
        const result = await App.create({
            ownerEntityTypeId: ownerEntityTypeId,
            ownerId: ownerId,
            extId: this.generateExtId(),
            name: name,
            appStatusId: APP_UNVERIFIED,
            createdAt: timestamp,
            updatedAt: timestamp
        })

        return {
            id: result.id,
            extId: result.extId
        }
    }

    async createCredential(appExtId, {environmentId, credentialTypeId, name}) {
        // Validate credentialTypeId
        if (![SERVER_CRED_TYPE, MOBILE_SDK_CRED_TYPE].includes(credentialTypeId)) {
            throw new APIError("ERR_18")
        }

        // Set development env if unset
        if (![ENV_PRODUCTION, ENV_DEVELOPMENT].includes(environmentId)) {
            environmentId = ENV_DEVELOPMENT
        }

        // Get model reference
        const {AppCredential} = this.models

        // Validate app existence
        const app = await this.getApp(appExtId)

        // Set default name if unset
        if (!name) {
            name = `${app.name} ${CRED_TYPE_TEXT[credentialTypeId]} for ${ENV_TEXT[environmentId]}`
        }

        // Init timestamp
        const timestamp = new Date()

        // Create client id and secret
        const clientId = CRED_TYPE_PREFIX[credentialTypeId] + this.generateClientId()
        const clientSecret = this.generateClientSecret()

        // Create app
        return await AppCredential.create({
            appId: app.id,
            environmentId: environmentId,
            credentialTypeId: credentialTypeId,
            name: name,
            clientId: clientId,
            clientSecret: clientSecret,
            options: {},
            credentialStatusId: CREDENTIAL_ACTIVE,
            createdAt: timestamp,
            updatedAt: timestamp
        })
    }

    async listCredential(appExtId, skip, limit) {
        // Get app
        const app = await this.getApp(appExtId)

        // Get rows
        const {AppCredential} = this.models
        const result = await AppCredential.findAndCountAll({where: {appId: app.id}, limit: limit, offset: skip})

        // Compose response
        const credentialList = result.rows.map(item => {
            return {
                environmentId: item.environmentId,
                credentialTypeId: item.credentialTypeId,
                name: item.name,
                clientId: item.clientId,
                clientSecret: item.clientSecret,
                options: item.options,
                credentialStatusId: item.credentialStatusId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }
        })

        return {
            credentials: credentialList,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count
            }
        }
    }

    async list(skip, limit, filters) {
        // Prepare where
        const whereFilter = {}
        if (filters.ownerId) {
            whereFilter.ownerId = filters.ownerId
        }

        // Get rows
        const {App} = this.models
        const result = await App.findAndCountAll({where: whereFilter, limit: limit, offset: skip})

        // Compose response
        const credentialList = result.rows.map(item => {
            return {
                extId: item.extId,
                ownerEntityTypeId: item.ownerEntityTypeId,
                ownerId: item.ownerId,
                name: item.name,
                logoFile: item.logoFile,
                appStatusId: item.appStatusId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }
        })

        return {
            credentials: credentialList,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count
            }
        }
    }

    async deleteCredential(appExtId, clientId) {
        // Get app
        const app = await this.getApp(appExtId)

        // Delete credential
        const count = await this.models.AppCredential.destroy({where: {appId: app.id, clientId: clientId}})

        return {
            deletedCount: count
        }
    }

    async toggleCredentialStatus(appExtId, clientId) {
        // Get app
        const app = await this.getApp(appExtId)

        // Get credential
        const credential = await this.models.AppCredential.findOne({where: {appId: app.id, clientId: clientId}})
        if (!credential) {
            throw new APIError('ERR_19')
        }

        // Determine status
        let updatedStatus
        if (credential.credentialStatusId === CREDENTIAL_INACTIVE) {
            updatedStatus = CREDENTIAL_ACTIVE
        } else {
            updatedStatus = CREDENTIAL_INACTIVE
        }

        // Update credential
        credential.credentialStatusId = updatedStatus
        credential.updatedAt = new Date()
        await credential.save()

        return {
            credentialStatusId: updatedStatus
        }
    }

    async getApp(appExtId) {
        // Validate app existence
        const app = await this.models.App.findOne({
            where: {extId: appExtId}
        })
        if (!app) {
            throw new APIError("ERR_17")
        }

        return app
    }
}

module.exports = AppService