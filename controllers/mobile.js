'use strict'

const BaseController = require('./base'),
    router = require('express').Router(),
    crypto = require('crypto')

/**
 *
 * @apiDefine AppUser
 * @apiSuccess {String} appId Partner app ID
 * @apiSuccess {String} hash User hash (unique authentication code) for given app
 * @apiSuccess {String} deviceId User unique authentication code for given app
 * @apiSuccess {String} notifId Push notif ID
 *
 */

class MobileController extends BaseController {
    constructor(models, common, middlewares, nexmo) {
        super(models)
        this.router = router
        this.nexmo = nexmo
        this.middlewares = middlewares
        this.hmac = common.hmac
        this.common = common
        this.exchangeToken = {
            aesKey: common.config.EXCHANGE_TOKEN_AES_KEY,
            aesIv: common.config.EXCHANGE_TOKEN_AES_IV,
            lifetime: common.config.EXCHANGE_TOKEN_LIFETIME
        }

        /**
         * @api {post} /mobile/users/register User registration
         * @apiName RegisterUser
         * @apiGroup Mobile
         * @apiDescription New user registration
         *
         * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
         * @apiParam {String} phone User mobile phone number
         * @apiParam {String} deviceId User device ID
         * @apiParam {String} verificationCode User phone number verification code (OTP)
         * @apiParam {String} notifId Push notif ID
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiUse AppUser
         */
        this.router.post('/users/register', async (req, res, next) => {
            let body = req.body

            let error = this.validate({
                countryCode: 'required',
                phone: 'required',
                deviceId: 'required',
                verificationCode: 'required',
                appId: 'required',
                appSecret: 'required',
            }, body)

            if (error) {
                return res.status(400).send(error)
            }

            // validate app
            let app = null
            try {
                app = await this.validateAppCredentials(body.appId, body.appSecret, null)
            } catch (e) {
                return res.status(401).send(e.message)
            }

            try {
                // verify code
                await this.nexmo.checkVerificationSMS(body.countryCode, body.phone, body.verificationCode)

                // register user if not yet exists
                let hash = this.hmac(common.combinePhone(body.countryCode, body.phone))
                let user = await this.models.User.findOrCreate({
                    where: {hash: hash},
                    defaults: {hash: hash}
                })
                user = user[0]

                // register user to the app
                // app user hash = app secret + user id
                // Do not use user.hash so we can update the phone number
                let appUserHash = this.hmac(app.secret + user.id)
                let appUser = await this.models.AppUser.findOrCreate({
                    where: {appId: app.id, userId: user.id},
                    defaults: {
                        appId: app.id,
                        userId: user.id,
                        hash: appUserHash,
                        deviceId: body.deviceId,
                    }
                })
                appUser = appUser[0]
                if (appUser.deviceId !== body.deviceId) {
                    return res.status(403).send(`Existing login found on deviceId: ${appUser.deviceId}`)
                }
                return res.send(appUser)
            } catch (e) {
                next(e)
            }
        })

        /**
         * @api {post} /mobile/users/login User login
         * @apiName LoginUser
         * @apiGroup Mobile
         * @apiDescription User login to new partner app using existing hash
         *
         * @apiParam {String} existingHash User existing app hash
         * @apiParam {String} notifId Push notif ID
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiUse AppUser
         *
         */
        this.router.post('/users/login', async (req, res, next) => {

            let body = req.body
            let error = this.validate({
                appId: 'required',
                appSecret: 'required',
                existingHash: 'required',
            }, body)
            if (error) {
                return res.status(400).send(error)
            }

            try {
                // validate new app
                let newApp = await this.models.App.findByPk(body.appId)
                if (!newApp) {
                    return res.status(404).send(`App not found ${body.appId}`)
                }
                if (newApp.secret !== body.appSecret) {
                    return res.status(401).send(`Invalid secret`)
                }

                // validate existing app user
                let existingAppUser = await this.models.AppUser.findOne({
                    where: {hash: body.existingHash},
                })
                if (!existingAppUser) {
                    return res.status(401).send(`User is not yet registered on app: ${body.existingAppId}`)
                }

                // register to new app
                let newAppUserHash = this.hmac(newApp.secret + existingAppUser.userId)
                let newAppUser = await this.models.AppUser.findOrCreate({
                    where: {appId: newApp.id, hash: newAppUserHash},
                    defaults: {
                        appId: newApp.id,
                        userId: existingAppUser.userId,
                        hash: newAppUserHash,
                        deviceId: existingAppUser.deviceId,
                    }
                })
                newAppUser = newAppUser[0]
                return res.send(newAppUser)
            } catch (e) {
                console.error(e)
                next(e)
            }
        })

        /**
         * @api {get} /mobile/users/login Login check
         * @apiName LoginUserCheck
         * @apiGroup Mobile
         * @apiDescription Check if user still logged-in (hash is still valid)
         *
         * @apiParam {String} hash User app hash
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiSuccess {String} message OK
         */
        this.router.get('/users/login', async (req, res) => {

            let body = req.query
            let error = this.validate({
                appId: 'required',
                appSecret: 'required',
                hash: 'required',
            }, body)

            if (error) {
                return res.status(400).send(error)
            }

            try {
                // validate credentials
                await this.validateAppUserCredentials(body.hash, body.appId, body.appSecret)
                // TODO: Create access token
                return res.send({message: 'OK'})
            } catch (e) {
                return res.status(401).send(e.message)
            }

        })

        /**
         * @api {post} /mobile/users/verifyPhone Verify phone
         * @apiName VerifyPhone
         * @apiGroup Mobile
         * @apiDescription Trigger OTP SMS code
         *
         * @apiParam {String} countryCode User mobile phone country code (eg. 62 for Indonesia)
         * @apiParam {String} phone User mobile phone number
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiSuccess {String} message OK
         */
        this.router.post('/users/verifyPhone', async (req, res, next) => {

            let body = req.body
            let error = this.validate({
                appId: 'required',
                appSecret: 'required',
                countryCode: 'required',
                phone: 'required',
            }, body)

            if (error) {
                return res.status(400).send(error)
            }

            // validate credentials
            try {
                await this.validateAppCredentials(body.appId, body.appSecret, null)
            } catch (e) {
                return res.status(401).send(e.message)
            }

            try {
                await this.nexmo.sendVerificationSMS(body.countryCode, body.phone)
                return res.send({message: 'OK'})
            } catch (e) {
                console.error(e)
                next(e)
            }

        })

        /**
         * @api {post} /mobile/users/updatePhone Update phone
         * @apiName UpdatePhone
         * @apiGroup Mobile
         * @apiDescription Update phone number of logged-in account and, consequently, invalidate login from old phone number
         *
         * @apiParam {String} countryCode User new mobile phone country code (eg. 62 for Indonesia)
         * @apiParam {String} phone User new mobile phone number
         * @apiParam {String} verificationCode User new phone number verification code (OTP)
         * @apiParam {String} existingHash User existing app hash
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiSuccess {String} message OK
         */
        this.router.post('/users/updatePhone', async (req, res, next) => {
            let body = req.body

            let error = this.validate({
                countryCode: 'required',
                phone: 'required',
                verificationCode: 'required',
                existingHash: 'required',
                appId: 'required',
                appSecret: 'required',
            }, body)

            if (error) {
                return res.status(400).send(error)
            }

            // validate credentials
            let existingAppUser = null
            try {
                existingAppUser = await this.validateAppUserCredentials(body.existingHash, body.appId, body.appSecret)
            } catch (e) {
                return res.status(401).send(e.message)
            }

            try {
                // verify code
                await this.nexmo.checkVerificationSMS(body.countryCode, body.phone, body.verificationCode)

                // update user hash
                let newHash = this.hmac(common.combinePhone(body.countryCode, body.phone))
                await existingAppUser.user.update({hash: newHash})

                return res.send({message: 'OK'})
            } catch (e) {
                next(e)
            }
        })


        /**
         * @api {put} /mobile/users Update
         * @apiName Update
         * @apiGroup Mobile
         * @apiDescription Update notif ID
         *
         * @apiParam {String} notifId Push notif ID
         * @apiParam {String} hash User app hash
         * @apiParam {String} appId Partner app ID
         * @apiParam {String} appSecret Partner app secret
         *
         * @apiUse AppUser
         */
        this.router.put('/users', async (req, res, next) => {
            let body = req.body

            let error = this.validate({
                notifId: 'required',
                hash: 'required',
                appId: 'required',
                appSecret: 'required',
            }, body)

            if (error) {
                return res.status(400).send(error)
            }

            // validate credentials
            let existingAppUser = null
            try {
                existingAppUser = await this.validateAppUserCredentials(body.hash, body.appId, body.appSecret)
            } catch (e) {
                return res.status(401).send(e.message)
            }

            try {
                // update notifId
                existingAppUser.notifId = body.notifId
                await existingAppUser.save()
                return res.send(existingAppUser)
            } catch (e) {
                next(e)
            }
        })

        this.router.put('/users/revokeAccess', this.handleAsync(handleRevokeAccess.bind(this)))

        this.router.post('/users/verifyExchangeToken', this.handleAsync(handleVerifyExchangeToken.bind(this)))
    }

    async validateAppSecret(appId, appSecret) {
        // Count app by app id and secret
        const {App} = this.models
        const count = await App.count({
            where: {id: appId, secret: appSecret}
        })

        return count === 1;
    }

    async getAppsAccessStatus(appId, userHash) {
        // Count user by id and hash
        const {AppUser} = this.models
        const count = await AppUser.count({
            where: {appId: appId, hash: userHash}
        })

        if (count === 1) {
            return "GRANTED"
        }

        return "DENIED"
    }

    createExchangeToken(appId, userHash, timestamp) {
        // Create expired at
        const epoch = this.common.getEpoch(timestamp)
        const expiredAt = epoch + this.exchangeToken.lifetime

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
            console.error(`ERROR: unable to decrypt exchange token. Error=${e}`)
            return {
                success: false,
                code: 'ERR_1',
                message: 'Invalid exchange token'
            }
        }

        // Validate expired at
        const now = this.common.getEpoch(new Date())
        if (now > payload.expiredAt) {
            return {
                success: false,
                code: 'ERR_2',
                message: 'Exchange token has been expired'
            }
        }

        // Validate user hash
        const accessStatus = await this.getAppsAccessStatus(payload.appId, payload.userHash)

        if (accessStatus !== "GRANTED") {
            return {
                success: false,
                code: '401',
                message: 'Unauthorized'
            }
        }

        return {
            success: true,
            code: 'OK',
            message: 'Success',
            data: {
                userHash: payload.userHash
            }
        }
    }

    encrypt(payload) {
        const key = Buffer.from(this.exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this.exchangeToken.aesIv, 'hex')
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
        const payloadStr = JSON.stringify(payload)
        let encrypted = cipher.update(payloadStr)
        encrypted = Buffer.concat([encrypted, cipher.final()])
        return encrypted.toString('base64')
    }

    decrypt(encrypted) {
        const key = Buffer.from(this.exchangeToken.aesKey, 'hex')
        const iv = Buffer.from(this.exchangeToken.aesIv, 'hex')
        let encryptedBuf = Buffer.from(encrypted, 'base64')
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
        let decrypted = decipher.update(encryptedBuf)
        decrypted = Buffer.concat([decrypted, decipher.final()])
        const jsonStr = decrypted.toString()
        return JSON.parse(jsonStr)
    }
}

async function handleRevokeAccess(req, res) {
    let body = req.body

    let error = this.validate({
        userHash: 'required',
        appId: 'required',
        appSecret: 'required'
    }, body)
    if (error) {
        res.status(400).json({
            success: false,
            code: '400',
            message: error
        })
        return
    }

    // Delete row
    const {AppUser} = this.models
    const count = await AppUser.destroy({
        where: {
            appId: body.appId,
            hash: body.userHash
        }
    })

    console.log(`DEBUG: DeletedRowCount=${count}`)

    res.json({
        success: true,
        code: 'OK',
        message: 'app access to user data has been revoked'
    })
}

async function handleVerifyExchangeToken(req, res) {
    // Validate request
    const body = req.body
    let error = this.validate({
        exchangeToken: 'required',
        appId: 'required',
        appSecret: 'required'
    }, body)
    if (error) {
        res.status(400).json({
            success: false,
            code: '400',
            message: error
        })
        return
    }

    // Validate app secret
    if (!await this.validateAppSecret(body.appId, body.appSecret)) {
        res.status(401).json({
            success: false,
            code: '401',
            message: 'Unauthorized'
        })
        return
    }

    // Validate exchange token
    const result = await this.validateExchangeToken(body.exchangeToken)
    if (!result.success) {
        res.status(401).json(result)
        return
    }

    res.json(result)
}

module.exports = MobileController