'use strict'

const BaseController = require('./base'),
    express = require('express'),
    crypto = require('crypto'),
    APIError = require('../server/api_error')

/**
 * @apiDefine AppUser
 * @apiSuccess {String} appId Partner app ID
 * @apiSuccess {String} hash User hash (unique authentication code) for given app
 * @apiSuccess {String} deviceId User unique authentication code for given app
 * @apiSuccess {String} notifId Push notif ID
 */

/**
 * @apiDefine AppCredentialParam
 * @apiParam {String} appId Partner app ID
 * @apiParam {String} appSecret Partner app secret
 */

/**
 * @apiDefine UserCredentialParam
 * @apiParam {String} userHash User identifier for Partner app
 */

/**
 * @apiDefine SuccessResponse
 * @apiSuccess {Boolean} success Response status
 * @apiSuccess {String} code Result code
 * @apiSuccess {String} message Result message
 */

/**
 * @apiDefine OkResponseExample
 * @apiSuccessExample {json} SuccessResponse:
 *   {
 *     "success": true,
 *     "code": "OK",
 *     "message": "Success"
 *   }
 */

/**
 * @apiDefine ErrorResponse
 * @apiError {Boolean} success Response status
 * @apiError {String} code Error code
 * @apiError {String} message Error message
 *
 * @apiErrorExample {json} ErrorResponse:
 *   {
 *     "success": false,
 *     "code": "<ERROR_CODE>",
 *     "message": "<ERROR_MESSAGE>"
 *   }
 */

class MobileController extends BaseController {
    constructor(args) {
        super(args.models, args)

        // Create child logger
        this.logger = args.logger.child({scope: 'Core.MobileAPI'})

        this._exchangeToken = {
            aesKey: this.config.EXCHANGE_TOKEN_AES_KEY,
            aesIv: this.config.EXCHANGE_TOKEN_AES_IV,
            lifetime: this.config.EXCHANGE_TOKEN_LIFETIME
        }

        this.route()
    }

    route = () => {
        // Init router
        const router = express.Router()

        /**
         * @api {post} /mobile/users/verifyPhone Request OTP via SMS
         * @apiName RequestSmsOtp
         * @apiGroup Core.MobileAPI
         * @apiDescription Trigger send OTP code via SMS
         *
         * @apiUse AppCredentialParam
         * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
         * @apiParam {String} phone User mobile phone number
         *
         * @apiUse SuccessResponse
         * @apiUse OkResponseExample
         *
         * @apiUse ErrorResponse
         */
        router.post('/users/verifyPhone', this.handleValidateAppCred, this.handleRequestSmsOtp)

        /**
         * @api {post} /mobile/users/register Login by OTP
         * @apiName LoginByOtp
         * @apiGroup Core.MobileAPI
         * @apiDescription User Login by verify given OTP code.
         * If user has not yet granted access to app, a new AppUser will be created
         *
         * @apiUse AppCredentialParam
         * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
         * @apiParam {String} phone User mobile phone number
         * @apiParam {String} deviceId User device ID
         * @apiParam {String} verificationCode User phone number verification code (OTP)
         * @apiParam {String} notifId Push notif ID
         *
         * @apiUse SuccessResponse
         * @apiSuccess {Object} data Response data
         * @apiSuccess {String} data.exchangeToken Token that can be used by Partner app server to verify if a user has been authorized by humanId
         * @apiSuccess {String} data.userHash User identifier for Partner app
         * @apiSuccessExample {json} SuccessResponse:
         *   {
         *     "success": true,
         *     "code": "OK",
         *     "message": "Success",
         *     "data": {
         *       "exchangeToken": "<EXCHANGE_TOKEN>",
         *       "userHash": "<USER_HASH>"
         *     }
         *   }
         *
         * @apiUse ErrorResponse
         */
        router.post('/users/register', this.handleValidateAppCred, this.handleRegister)

        /**
         * @api {post} /mobile/users/revokeAccess Revoke App Access
         * @apiName RevokeAppAccess
         * @apiGroup Core.MobileAPI
         * @apiDescription Revoke Partner App access to User data
         *
         * @apiUse AppCredentialParam
         * @apiUse UserCredentialParam
         *
         * @apiUse SuccessResponse
         * @apiUse OkResponseExample
         *
         * @apiUse ErrorResponse
         */
        router.put('/users/revokeAccess',
            [this.handleValidateAppCred, this.handleValidateAppUserCred], this.handleRevokeAccess)

        /**
         * @api {post} /mobile/users/verifyExchangeToken Verify Exchange Token
         * @apiName VerifyExchangeToken
         * @apiGroup Core.ServerAPI
         * @apiDescription Host-to-host API for Partner App Server to retrieve user hash
         *
         * @apiUse AppCredentialParam
         * @apiParam {String} exchangeToken Token that can be used by Partner app server to verify if a user has been authorized by humanId
         *
         * @apiUse SuccessResponse
         * @apiSuccess {Object} data Response data
         * @apiSuccess {String} data.userHash User identifier for Partner app
         * @apiSuccessExample {json} SuccessResponse:
         *   {
         *     "success": true,
         *     "code": "OK",
         *     "message": "Success",
         *     "data": {
         *       "userHash": "<USER_HASH>"
         *     }
         *   }
         *
         * @apiUse ErrorResponse
         */
        router.post('/users/verifyExchangeToken', this.handleValidateAppCred, this.handleVerifyExchangeToken)

        /**
         * @api {get} /mobile/users/login Validate App User Access
         * @apiName ValidateAppUserAccess
         * @apiGroup Core.MobileAPI
         * @apiDescription Check if partner app is granted access to user data
         *
         * @apiUse AppCredentialParam
         * @apiUse UserCredentialParam
         *
         * @apiUse SuccessResponse
         * @apiUse OkResponseExample
         *
         * @apiUse ErrorResponse
         */
        router.get('/users/login',
            [this.handleValidateAppCred, this.handleValidateAppUserCred], this.handleCheckAppUserAccess)

        /**
         * @api {post} /mobile/users/login Login by Existing Access
         * @apiName LoginByExistingAccess
         * @apiGroup Core.MobileAPI
         * @apiDescription Login to new partner app using existing access
         *
         * @apiUse AppCredentialParam
         * @apiParam {String} existingAppId Partner app id that is used to authorized login
         * @apiParam {String} existingUserHash User identifier on existing Partner app
         * @apiParam {String} deviceId User device identifier
         *
         * @apiUse SuccessResponse
         * @apiSuccess {Object} data Response data
         * @apiSuccess {String} data.exchangeToken TODO: Token that can be used by Partner app server to verify if a user has been authorized by humanId
         * @apiSuccess {String} data.userHash User identifier for Partner app
         * @apiSuccessExample {json} SuccessResponse:
         *   {
         *     "success": true,
         *     "code": "OK",
         *     "message": "Success",
         *     "data": {
         *       "exchangeToken": "<EXCHANGE_TOKEN>",
         *       "userHash": "<USER_HASH>"
         *     }
         *   }
         *
         * @apiUse ErrorResponse
         */
        router.post('/users/login', this.handleValidateAppCred, this.handleLogin)

        /**
         * @api {put} /mobile/users Update FCM Notification Id
         * @apiName UpdateNotificationId
         * @apiGroup Core.MobileAPI
         * @apiDescription Update notif ID
         *
         * @apiUse AppCredentialParam
         * @apiUse UserCredentialParam
         * @apiParam {String} notifId Push notif ID
         *
         * @apiUse SuccessResponse
         * @apiUse OkResponseExample
         *
         * @apiUse ErrorResponse
         */
        router.put('/users',
            [this.handleValidateAppCred, this.handleValidateAppUserCred], this.handleUpdate)

        // Set router
        this.router = router
    }

    handleLogin = this.handleRESTAsync(async (req) => {
        // Validate body
        let body = req.body
        this.validate({
            existingUserHash: 'required',
            existingAppId: 'required',
            deviceId: 'required'
        }, body)

        // Get new appId and appSecret
        const {appId, appSecret, deviceId} = body

        // Get existing app user
        let existingAppUser = await this.models.LegacyAppUser.findOne({
            where: {hash: body.existingUserHash, appId: body.existingAppId},
        })

        // If not found, throw error
        if (!existingAppUser) {
            throw new APIError("ERR_7")
        }

        // Validate new appId with existing
        if (appId === existingAppUser.appId) {
            throw new APIError("ERR_8")
        }

        // Validate device id
        if (deviceId !== existingAppUser.deviceId) {
            throw new APIError("ERR_9")
        }

        // Register to new app
        let newAppUserHash = this.components.common.hmac(appSecret + existingAppUser.userId)
        let newAppUser = await this.models.LegacyAppUser.findOrCreate({
            where: {appId: appId, hash: newAppUserHash},
            defaults: {
                appId: appId,
                userId: existingAppUser.userId,
                hash: newAppUserHash,
                deviceId: existingAppUser.deviceId,
            }
        })
        newAppUser = newAppUser[0]

        // TODO: Returns exchangeToken
        return {
            data: {
                exchangeToken: '',
                userHash: newAppUser.hash
            }
        }
    })

    createExchangeToken(appId, userHash, timestamp) {
        // Create expired at
        const epoch = this.components.common.getEpoch(timestamp)
        const expiredAt = epoch + this._exchangeToken.lifetime

        // Create payload
        const payload = {
            appId,
            userHash,
            expiredAt
        }

        // Encrypt
        return this.encrypt(payload)
    }

    async validateExchangeToken(exchangeToken) {
        // Decrypt token
        let payload
        try {
            payload = this.decrypt(exchangeToken)
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
        const accessStatus = await this.getAppsAccessStatus(payload.appId, payload.userHash)

        // Validate access status
        if (accessStatus !== "GRANTED") {
            throw new APIError('ERR_7')
        }

        return {
            userHash: payload.userHash
        }
    }

    encrypt(payload) {
        const key = Buffer.from(this._exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this._exchangeToken.aesIv, 'hex')
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        const payloadStr = JSON.stringify(payload)
        let encrypted = cipher.update(payloadStr)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return encrypted.toString('base64')
    }

    decrypt(encrypted) {
        const key = Buffer.from(this._exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this._exchangeToken.aesIv, 'hex')
        let encryptedBuf = Buffer.from(encrypted, 'base64')
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(encryptedBuf)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        const jsonStr = decrypted.toString()
        return JSON.parse(jsonStr)
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

    handleCheckAppUserAccess = this.handleRESTAsync(async () => {
        return {}
    })

    handleRevokeAccess = this.handleRESTAsync(async (req) => {
        // Get body
        let body = req.body

        // Delete row
        const {LegacyAppUser: AppUser} = this.models
        const count = await AppUser.destroy({
            where: {
                appId: body.appId,
                hash: body.userHash
            }
        })

        this.logger.debug(`DeletedRowCount=${count}`)

        return {}
    })

    handleRequestSmsOtp = this.handleRESTAsync(async (req) => {
        // Validate request body
        let {body} = req
        this.validate({
            countryCode: 'required',
            phone: 'required',
        }, body)

        // Send Verification via SMS
        await this.components.nexmo.sendVerificationSMS(body.countryCode, body.phone)

        return {}
    })
    handleUpdate = this.handleRESTAsync(async (req) => {
        // Validate body
        let body = req.body
        this.validate({notifId: 'required'}, body)

        // Update user
        await this.models.LegacyAppUser.update({
            notifId: body.notifId
        }, {
            where: {hash: body.userHash}
        })

        return {}
    })
    handleValidateAppCred = this.handleAsync(async (req, res, next) => {
        // Get method
        const {method} = req

        // Get payload by method
        let payload
        if (method.toUpperCase() === "GET") {
            // If request method is GET, get payload from query
            payload = req.query
        } else {
            // Else, get payload from request body
            payload = req.body
        }

        // Validate payload
        this.validate({appId: 'required', appSecret: 'required'}, payload)

        // Count app by app id and secret
        const {appId, appSecret} = payload
        const {LegacyApp: App} = this.models
        const count = await App.count({
            where: {id: appId, secret: appSecret}
        })

        if (count !== 1) {
            throw new APIError('ERR_4')
        }

        next()
    })

    handleVerifyExchangeToken = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body
        this.validate({exchangeToken: 'required'}, body)

        // Validate exchange token
        const result = await this.validateExchangeToken(body.exchangeToken)

        return {
            data: result
        }
    })

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

    handleValidateAppUserCred = this.handleAsync(async (req, res, next) => {
        // Get method
        const {method} = req

        // Get payload by method
        let payload
        if (method.toUpperCase() === "GET") {
            // If request method is GET, get payload from query
            payload = req.query
        } else {
            // Else, get payload from request body
            payload = req.body
        }

        // Validate payload
        this.validate({appId: 'required', userHash: 'required'}, payload)

        // Get payload
        const {appId, userHash} = payload

        // Get access status
        const accessStatus = await this.getAppsAccessStatus(appId, userHash)

        // Validate access status
        if (accessStatus !== "GRANTED") {
            throw new APIError("ERR_7")
        }

        next()
    })
}

module.exports = MobileController