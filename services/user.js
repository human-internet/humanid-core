'use strict'

const
    APIError = require('../server/api_error'),
    Constants = require("../constants")

const
    BaseService = require('./base')


class UserService extends BaseService {
    constructor(services, args) {
        super('User', services, args)
    }

    async login(payload) {
        // Get common component
        const {common} = this.components

        // Verify code
        await this.verifyOtpCode(payload.countryCode, payload.phone, payload.verificationCode)

        // Get user, if user not found create a new one
        let hash = common.hmac(common.combinePhone(payload.countryCode, payload.phone))
        let user = await this.models.LegacyUser.findOrCreate({
            where: {hash: hash},
            defaults: {hash: hash}
        })
        user = user[0]

        // register user to the app
        // app user hash = app secret + user id
        // Do not use user.hash so we can update the phone number
        let appUserHash = common.hmac(this.config.APP_SECRET + user.id)
        let appUser = await this.models.LegacyAppUser.findOrCreate({
            where: {appId: payload.legacyAppsId, userId: user.id},
            defaults: {
                appId: payload.legacyAppsId,
                userId: user.id,
                hash: appUserHash,
                deviceId: payload.deviceId,
            }
        })
        appUser = appUser[0]

        // If user device id is different with request, throw error
        if (appUser.deviceId !== payload.deviceId) {
            throw new APIError("ERR_3", `Existing login found on deviceId: ${appUser.deviceId}`)
        }

        // Create exchange token
        const exchangeToken = this.services.Auth.createExchangeToken(payload.legacyAppsId, appUser.hash, new Date())

        return {
            data: {
                exchangeToken
            }
        }
    }

    async revokeAccess(opt) {
        // Get apps access status
        const accessStatus = await this.getAppsAccessStatus(opt.legacyAppsId, opt.legacyUserHash)
        if (accessStatus !== "GRANTED") {
            throw new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED)
        }

        // Delete row
        const {LegacyAppUser: AppUser} = this.models
        const count = await AppUser.destroy({
            where: {
                appId: opt.legacyAppsId,
                hash: opt.legacyUserHash
            }
        })

        this.logger.debug(`DeletedRowCount=${count}`)
    }

    async verifyOtpCode(countryCode, phone, verificationCode) {
        // Verify code
        try {
            await this.components.nexmo.checkVerificationSMS(countryCode, phone, verificationCode)
        } catch (e) {
            // If a ValidationError, throw a handled error
            if (e.name && e.name === 'ValidationError') {
                throw new APIError("ERR_5")
            }
            // Else, re-throw unhandled error
            throw e
        }
    }

    async getAppsAccessStatus(appId, userHash) {
        // Count user by id and hash
        const {LegacyAppUser: AppUser} = this.models
        const count = await AppUser.count({
            where: {appId: appId, hash: userHash}
        })

        if (count === 1) {
            return "GRANTED"
        }

        return "DENIED"
    }
}

module.exports = UserService