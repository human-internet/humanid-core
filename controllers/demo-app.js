'use strict'

const BaseController = require('./base'),
    express = require('express'),
    jwt = require('jsonwebtoken'),
    fetch = require('node-fetch')

class DemoAppController extends BaseController {
    constructor(models, common) {
        super(models)
        this.router = express.Router()
        this.common = common
        this.humanIdApiBaseUrl = common.config.HUMANID_API_BASE_URL
        // TODO: Make secrets configurable
        this.appId = "DEMO_APP"
        this.appSecret = "2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0"
        this.appJwtSecret = "6OI%ht9qSRJjq5x5BB3y"
        this.appClientSecret = "S7ZJkSm4Jt@hlTWnYS28"

        const clientAuthMiddleware = async (req, res, next) => {
            // Validate client secret
            let clientSecret = req.header("clientSecret")
            if (clientSecret !== this.appClientSecret) {
                res.status(401).send({
                    error: {
                        code: "401",
                        message: "Unauthorized"
                    }
                })
                return
            }

            next()
        }

        // Create router that have user session middleware
        const userAuthMiddleware = async (req, res, next) => {
            // Validate session
            const userAccessToken = req.header("userAccessToken")
            const result = await this.validateUserSession(userAccessToken)
            if (result.error) {
                return res.status(result.error.httpStatus || 500).send({
                    error: result.error
                })
            }

            if (!result.valid) {
                return res.status(401).send({
                    error: {
                        code: "DEMOAPP_ERR_3",
                        message: "Invalid user session",
                    }
                })
            }

            // Set result in request
            req.userAccess = result

            next()
        }

        /**
         * @api {post} /demo-app/api/users/log-in Log In
         * @apiName LogIn
         * @apiGroup DemoApp
         * @apiDescription LogIn to 3rd party app using humanId Exchange Token
         *
         * @apiHeader {String} clientSecret Client credentials to access Api
         *
         * @apiParam {String} exchangeToken An exchange token that states user has been verified by humanId
         *
         * @apiSuccess {String} token Access Token to App
         */
        this.router.post('/users/log-in', [clientAuthMiddleware], async (req, res) => {
            // Validate request body
            let body = req.body
            let err = this.validate({exchangeToken: 'required'}, body)
            if (err) {
                return res.status(400).send({
                    error: {
                        code: "400",
                        message: "Invalid request body",
                        _debug: err
                    }
                })
            }

            // Validate exchange token to humanId API
            const result = await this.verifyExchangeToken({
                appId: this.appId,
                appSecret: this.appSecret,
                exchangeToken: body.exchangeToken
            })

            if (!result.success) {
                res.status(401).send({
                    error: {
                        code: "DEMOAPP_ERR_1",
                        message: "Unauthorized",
                        _debug: "Failed to verify exchange token"
                    }
                })
            }

            // Get user, create if not exists
            const {userHash} = result.data
            let users = await this.models.DemoAppUser.findOrCreate({
                where: {userHash: userHash},
                defaults: {
                    extId: generateExtId(),
                    userHash: userHash
                }
            })

            const user = users[0]
            const token = await this.newUserSession(user.id, user.extId, getUnixTime(new Date()))

            // Return response
            return res.json({
                message: "OK",
                data: {
                    token: token
                }
            })
        })

        /**
         * @api {put} /demo-app/api/users/log-out Log Out
         * @apiName LogOut
         * @apiGroup DemoApp
         * @apiDescription LogOut to 3rd party app using humanId Exchange Token
         *
         * @apiHeader {String} userAccessToken User Access Token
         *
         * @apiSuccess {String} message Result status
         */
        this.router.put('/users/log-out', [clientAuthMiddleware], async (req, res) => {
            // Validate session
            const userAccessToken = req.header("userAccessToken")
            const result = await this.validateUserSession(userAccessToken)
            if (result.error) {
                console.log(`ERROR: failed to validate user session. Error=${result.error}`)
                return res.json({
                    message: "OK"
                })
            }

            if (!result.valid) {
                console.log("WARN: invalid session id")
            }

            // Invalidate session
            await this.models.DemoAppUser.update({
                lastLogIn: null,
                updatedAt: new Date()
            }, {
                where: {id: result.user.id}
            })

            return res.json({
                message: "OK"
            })
        })

        /**
         * @api {put} /demo-app/api/users/refresh-session Refresh Session
         * @apiName RefreshSession
         * @apiGroup DemoApp
         * @apiDescription Refresh user session
         *
         * @apiHeader {String} userAccessToken User Access Token
         *
         * @apiSuccess {String} token Refreshed Access Token to App
         */
        this.router.put('/users/refresh-session', [userAuthMiddleware], async (req, res, next) => {
            // Get user info
            const {user} = req.userAccess
            // Create new session
            const newToken = await this.newUserSession(user.id, user.extId, getUnixTime(new Date()))

            return res.json({
                message: "OK",
                data: {
                    token: newToken
                }
            })
        })

        /**
         * @api {get} /demo-app/api/users/profile Get Profile
         * @apiName GetUserProfile
         * @apiGroup DemoApp
         * @apiDescription Get user profile by user access token
         *
         * @apiHeader {String} userAccessToken User Access Token
         *
         * @apiSuccess {Object} data User Profile
         */
        this.router.get('/users/profile', [userAuthMiddleware], async (req, res) => {
            // Get user info
            const {user} = req.userAccess

            const u = await this.models.DemoAppUser.findOne({
                where: {id: user.id},
            })

            return res.json({
                message: "OK",
                data: {
                    id: u.extId,
                    fullName: u.fullName,
                    updatedAt: getUnixTime(u.updatedAt)
                }
            })
        })

        /**
         * @api {put} /demo-app/api/users/profile Update Profile
         * @apiName UpdateUserProfile
         * @apiGroup DemoApp
         * @apiDescription Update user profile by user access token
         *
         * @apiHeader {String} userAccessToken User Access Token
         *
         * @apiParam {String} fullName Update full name
         *
         * @apiSuccess {String} message Update result status
         */
        this.router.put('/users/profile', [userAuthMiddleware], async (req, res) => {
            // Get user info
            const {user: userAccess} = req.userAccess

            // Get request body
            const body = req.body

            // Get user
            try {
                await this.models.DemoAppUser.update({
                    fullName: body.fullName
                }, {
                    where: {id: userAccess.id}
                })
            } catch (e) {
                return res.status(500).send({
                    error: {
                        code: "500",
                        message: "Internal Error",
                        _debug: e
                    }
                })
            }

            return res.json({
                message: "OK"
            })
        })

        /**
         * Generate session identifier
         *
         * @param {string} userExtId User external id
         * @param {number} lastLogInMillis User last login timestamp
         * @param {string} secret JWT Secret
         * @return {string} User Session Id
         */
        this.newUserSessionId = (userExtId, lastLogInMillis, secret) => {
            const raw = `${userExtId}-${lastLogInMillis}`
            return this.common.hmac(raw, secret)
        }

        /**
         *  Validate user session
         *
         * @param {string} userAccessToken User instance
         * @return {boolean} Session is valid or not
         */
        this.validateUserSession = async (userAccessToken) => {
            // Verify and extract payload from jwt
            let payload;
            try {
                payload = await verifyJWT(userAccessToken, this.appJwtSecret)
            } catch (e) {
                return {
                    error: {
                        httpStatus: 400,
                        code: "DEMOAPP_ERR_2",
                        message: "Invalid user access token",
                        _debug: e
                    }
                }
            }

            // Get user
            let user;
            try {
                user = await this.models.DemoAppUser.findOne({
                    where: {extId: payload.userId},
                })
            } catch (e) {
                return {
                    error: {
                        code: "500",
                        message: "Internal Error",
                        _debug: e
                    }
                }
            }

            // If user not found, return error
            if (!user) {
                return {
                    error: {
                        httpStatus: 401,
                        code: "401",
                        message: "Unauthorized",
                    }
                }
            }

            // Get last log in millis in UTC
            let lastLogIn;
            if (!user.lastLogIn) {
                lastLogIn = -1
            } else {
                lastLogIn = getUnixTime(user.lastLogIn)
            }

            // Generate session
            const currentSessionId = this.newUserSessionId(user.extId, lastLogIn, this.appJwtSecret)

            // Check against input
            return {
                valid: currentSessionId === payload.sessionId,
                user: {
                    id: user.id,
                    extId: user.extId
                }
            }
        }

        /**
         *
         * @param {string} userId User PK
         * @param {string} userExtId User External ID
         * @param {number} timestamp Last Log in timestamp
         * @return {Promise<string>} User access token
         */
        this.newUserSession = async (userId, userExtId, timestamp) => {
            await this.models.DemoAppUser.update({
                lastLogIn: timestamp * 1000,
                updatedAt: timestamp * 1000
            }, {
                where: {id: userId}
            })

            // Create session id
            let sessionId = this.newUserSessionId(userExtId, timestamp, this.appJwtSecret)

            // Create session
            return jwt.sign({
                    userId: userExtId,
                    sessionId: sessionId
                },
                this.appJwtSecret,
                {
                    expiresIn: this.common.config.DEMO_APP_JWT_LIFETIME
                })
        }

        this.verifyExchangeToken = async ({appId, appSecret, exchangeToken}) => {
            // TODO: Retrieve from config
            const url = this.humanIdApiBaseUrl + '/mobile/users/verifyExchangeToken'
            const resp = await fetch(url, {
                method: 'post',
                body: JSON.stringify({
                    appId, appSecret, exchangeToken
                }),
                headers: {'Content-Type': 'application/json'},
            })

            // Parse resp body
            return await resp.json()
        }
    }
}

function generateExtId() {
    let id = getUnixTime(new Date())
    return `${id}`
}

function verifyJWT(token, secret) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, (err, decodedToken) => {
            if (err || !decodedToken) {
                return reject(err)
            }
            resolve(decodedToken)
        })
    })
}

function getUnixTime(t) {
    return Math.round(t.getTime() / 1000)
}

module.exports = DemoAppController