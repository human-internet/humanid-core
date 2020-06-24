'use strict'

const
    LibPhoneNo = require('libphonenumber-js'),
    crypto = require('crypto'),
    nanoId = require('nanoid'),
    argon2 = require('argon2')

const
    APIError = require('../server/api_error'),
    Constants = require("../constants")

const
    BaseService = require('./base')

const
    HASH_ID_FORMAT_VERSION = 1,
    OTP_RULE = {
        otpSessionLifetime: 300,
        otpCountLimit: 3,
        failAttemptLimit: 5,
        nextResendDelay: 60,
        otpCodeLength: 4
    }

class UserService extends BaseService {
    constructor(services, args) {
        super('User', services, args)

        // Init nano id generator for
        this.generateOTPCode = nanoId.customAlphabet("0123456789", OTP_RULE.otpCodeLength)
        this.generateOTPReqId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 24)
    }

    // parsePhoneNo parse phone number to E.164 format
    parsePhoneNo(countryCode, phoneNo) {
        // Clean input
        const input = "+" + countryCode + (phoneNo[0] === '0' ? phoneNo.substring(1) : phoneNo)

        // Clean phoneNo number with libphonenumber
        const result = LibPhoneNo.parsePhoneNumberFromString(input)

        // If failed to parse phoneNo number, then throw error
        if (!result) {
            throw new APIError("ERR_10")
        }

        return result
    }

    // getHashId generate user hash id
    getHashId(phoneNo) {
        // Get config
        const salt1 = this.config.HASH_ID_SALT_1
        const salt2 = this.config.HASH_ID_SALT_2
        const secret = this.config.HASH_ID_SECRET
        const repeat = this.config.HASH_ID_REPEAT

        // Create a hashed sha-512 phone number
        const raw = salt1 + phoneNo + salt2
        let hash = crypto.createHmac('sha512', secret).update(raw).digest('hex')

        // Repeat hashing
        for (let i = 0; i < repeat; i++) {
            // If even, use salt2, otherwise use salt1
            let raw
            if (i % 2 === 0) {
                raw = hash + salt2
            } else {
                raw = salt1 + hash
            }

            // update hash
            hash = crypto.createHmac('sha512', secret).update(raw).digest('hex')
        }

        return hash
    }

    async getOTPSession(hashId, timestamp) {
        // Get model reference
        const {UserOTPSession, UserOTP} = this.models
        const {dateUtil} = this.components

        // Calculate expired at epoch
        const expiredAt = dateUtil.addSecond(timestamp, OTP_RULE.otpSessionLifetime)

        // Generate request id
        const requestId = this.generateOTPReqId()

        // Create default object
        const defaultSession = {
            userHashId: hashId,
            requestId: requestId,
            rule: OTP_RULE,
            otpCount: 0,
            failAttemptCount: 0,
            expiredAt: expiredAt,
            createdAt: timestamp,
            updatedAt: timestamp,
        }

        // Find or create session
        let session = await UserOTPSession.findOrCreate({
            where: {userHashId: hashId},
            defaults: defaultSession
        })

        session = session[0]

        // Check session if expired or not
        if (dateUtil.compare(timestamp, session.expiredAt) === dateUtil.GREATER_THAN) {
            // Delete existing session
            await UserOTP.destroy({where: {sessionId: session.id}})
            await UserOTPSession.destroy({where: {id: session.id}})
            // Create a new session
            session = await UserOTPSession.create(defaultSession)
        }

        return session
    }

    validateNewOTP(session) {
        // Get references
        const {dateUtil} = this.components

        // Get rule
        const rule = session.rule

        // If rule not set, session is invalid
        if (!rule) {
            throw new APIError('ERR_11')
        }

        // If otp count reach limit, throw error
        if (session.otpCount >= rule.otpCountLimit) {
            throw new APIError('ERR_12')
        }

        // If fail attempt count reach limit, throw error
        if (session.failAttemptCount >= rule.failAttemptLimit) {
            throw new APIError('ERR_13')
        }

        // If not reach resend delay, throw error
        if (session.otpCount > 0 &&
            dateUtil.compare(new Date(), session.nextResendAt) === dateUtil.LESS_THAN) {
            throw new APIError('ERR_14')
        }
    }

    async createOTP(session, timestamp) {
        // Get references
        const {dateUtil} = this.components
        const {UserOTPSession, UserOTP} = this.models

        // Generate OTP Code
        const code = this.generateOTPCode()

        // Create signature
        const signature = await argon2.hash(code)

        // Set otp count
        const otpCount = session.otpCount + 1

        // Update session
        const nextResendAt = dateUtil.addSecond(timestamp, OTP_RULE.nextResendDelay)

        // Persist
        const tx = await UserOTP.sequelize.transaction()
        try {
            // Insert otp
            await UserOTP.create({
                sessionId: session.id,
                otpNo: otpCount,
                signature: signature,
                metadata: {},
                createdAt: timestamp
            }, {
                transaction: tx
            })

            // Update otp session
            const count = await UserOTPSession.update({
                otpCount: otpCount,
                nextResendAt: nextResendAt,
                updatedAt: timestamp,
                version: session.version + 1
            }, {
                where: {id: session.id},
                transaction: tx
            })

            if (count === 0) {
                throw new Error("failed to update otp session")
            }
            await tx.commit()
        } catch (error) {
            await tx.rollback()
            throw error
        }

        return {
            otpCount: otpCount,
            failAttemptCount: session.failAttemptCount,
            code: code,
            requestId: session.requestId,
            nextResendAt: dateUtil.toEpoch(nextResendAt)
        }
    }

    async requestLoginOTP(inputCountryCode, inputPhoneNo, option) {
        // Parse phone number input
        const phone = this.parsePhoneNo(inputCountryCode, inputPhoneNo)

        // Get hash id
        const hashId = this.getHashId(phone.number)

        // Get session
        const session = await this.getOTPSession(hashId, new Date())

        // Validate session against rules
        this.validateNewOTP(session)

        // Create otp
        const otp = await this.createOTP(session, new Date())

        // Send otp
        // TODO: Implement switching provider by country
        // Send data
        const smsResult = await this.components.smsAWS.sendSms({
            phoneNo: phone.number,
            message: `Your humanID verification code is ${otp.code}`,
            senderId: 'humanID'
        })
        this.logger.debug(`API Response = ${JSON.stringify(smsResult)}`)

        return {
            requestId: otp.requestId,
            nextResendAt: otp.nextResendAt,
            failAttemptCount: otp.failAttemptCount,
            otpCount: otp.otpCount,
            config: OTP_RULE
        }
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