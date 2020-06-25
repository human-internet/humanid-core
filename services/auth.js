'use strict'

const
    APIError = require('../server/api_error'),
    Constants = require('../constants'),
    crypto = require('crypto')

const
    BaseService = require('./base')

const
    SERVER_CRED_TYPE = 1,
    MOBILE_SDK_CRED_TYPE = 2


class AuthService extends BaseService {
    constructor(services, args) {
        super('Auth', services, args)

        this._exchangeToken = {
            aesKey: this.config.EXCHANGE_TOKEN_AES_KEY,
            aesIv: this.config.EXCHANGE_TOKEN_AES_IV,
            lifetime: this.config.EXCHANGE_TOKEN_LIFETIME
        }
    }

    async authClient(credential, scope) {
        // Get client id and client secret
        const {clientId, clientSecret} = credential

        // Find by client id
        const {AppCredential} = this.models
        const appCred = await AppCredential.findOne({
            where: {clientId}
        })

        // If credential not found, throw unauthorized
        if (!appCred) {
            throw new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED)
        }

        // if client secret does not match, throw unauthorized
        if (appCred.clientSecret !== clientSecret) {
            throw new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED)
        }

        // If scope is invalid, throw forbidden
        let valid = this.validateCredType(scope, appCred.credentialTypeId)
        if (!valid) {
            throw new APIError(Constants.RESPONSE_ERROR_FORBIDDEN)
        }

        return {
            appId: appCred.appId
        }
    }

    validateCredType(scope, credentialTypeId) {
        if (scope === Constants.AUTH_SCOPE_SERVER && credentialTypeId === SERVER_CRED_TYPE) {
            return true
        } else if (scope === Constants.AUTH_SCOPE_MOBILE && credentialTypeId === MOBILE_SDK_CRED_TYPE) {
            return true
        }
        return false
    }

    async validateExchangeToken(exchangeToken) {
        // Decrypt token
        let payload
        try {
            payload = this.decryptAES(exchangeToken)
        } catch (e) {
            this.logger.error(`ERROR: unable to decrypt exchange token. Error=${e}`)
            throw new APIError("ERR_1")
        }

        // Validate expired at
        const now = this.components.common.getEpoch(new Date())
        if (now > payload.expiredAt) {
            throw new APIError("ERR_2")
        }

        // Get access status
        const accessStatus = await this.services.User.getAppsAccessStatus(payload.appId, payload.userHash)

        // Validate access status
        if (accessStatus !== "GRANTED") {
            throw new APIError('ERR_7')
        }

        return {
            userAppId: payload.userHash
        }
    }

    async createExchangeToken(appUser) {
        // Get references
        const {dateUtil} = this.components
        const {UserExchangeSession} = this.models

        // Create expired at
        const timestamp = new Date()
        const expiredAt = dateUtil.addSecond(timestamp, this._exchangeToken.lifetime)

        // Persist exchange token
        const exchangeSession = await UserExchangeSession.create({
            appUserId: appUser.id,
            expiredAt: expiredAt,
            createdAt: timestamp
        })

        // Create payload
        const payload = {
            exchangeSessionId: exchangeSession.id,
            appId: appUser.appId,
            extId: appUser.extId,
            expiredAt: dateUtil.toEpoch(expiredAt)
        }

        // Encrypt
        return this.encryptAES(payload)
    }

    encryptAES(payload) {
        const key = Buffer.from(this._exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this._exchangeToken.aesIv, 'hex')
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        const payloadStr = JSON.stringify(payload)
        let encrypted = cipher.update(payloadStr)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return encrypted.toString('base64')
    }

    decryptAES(encrypted) {
        const key = Buffer.from(this._exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this._exchangeToken.aesIv, 'hex')
        let encryptedBuf = Buffer.from(encrypted, 'base64')
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(encryptedBuf)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        const jsonStr = decrypted.toString()
        return JSON.parse(jsonStr)
    }
}

module.exports = AuthService