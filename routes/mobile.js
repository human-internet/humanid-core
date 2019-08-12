'use strict'

const helpers = require('../helpers/common'),
    nexmo = require('../helpers/nexmo'),
    models = require('../models/index'),
    validate = helpers.validate,
    hmac = helpers.hmac,    
    app = require('express').Router()

// TODO: API to update notifId

/**
 * Validate app credentials
 */
const validateAppCredentials = async (appId, appSecret, app) => {
    if (!app) {
        app = await models.App.findByPk(appId)
    }
    if (!app || app.id !== appId) {
        throw new Error(`Invalid app ID: ${appId}`)
    }
    if (app.secret !== appSecret) {
        throw new Error(`Invalid secret: ${appSecret}`)
    }
    return app
}

/**
 * Validate app user credentials and return user object
 */
const validateAppUserCredentials = async (hash, appId, appSecret) => {
    // validate login hash
    let appUser = await models.AppUser.findOne({
        where: { hash: hash },
        include: [{ all: true }],
    })
    if (!appUser) {
        throw new Error(`Invalid login hash`)
    }
    // validate app credentials
    validateAppCredentials(appId, appSecret, appUser.app)
    return appUser
}

/**
 * 
 * @apiDefine AppUser
 * @apiSuccess {String} appId Partner app ID
 * @apiSuccess {String} hash User hash (unique authentication code) for given app
 * @apiSuccess {String} deviceId User unique authentication code for given app
 * @apiSuccess {String} notifId Push notif ID
 * 
 */


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
app.post('/users/register', async (req, res, next) => {
    let body = req.body
    
    let error = validate({
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
        app = await validateAppCredentials(body.appId, body.appSecret)
    } catch (e) {
        return res.status(401).send(e.message)
    }

    try {
        // verify code
        await nexmo.checkVerificationSMS(body.countryCode, body.phone, body.verificationCode)

        // register user if not yet exists        
        let hash = hmac(`${body.countryCode}${body.phone}`)
        let user = await models.User.findOrCreate({
            where: {hash: hash},
            defaults: {hash: hash}
        })
        user = user[0]

        // register user to the app
        // app user hash = app secret + user id
        // Do not use user.hash so we can update the phone number        
        let appUserHash = hmac(app.secret + user.id)
        let appUser = await models.AppUser.findOrCreate({
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
app.post('/users/login', async (req, res, next) => {
    
    let body = req.body
    let error = validate({
        appId: 'required', 
        appSecret: 'required', 
        existingHash: 'required', 
    }, body)
    if (error) {
        return res.status(400).send(error)
    }

    try {
        // validate new app
        let newApp = await models.App.findByPk(body.appId)
        if (!newApp) {
            return res.status(404).send(`App not found ${body.appId}`)
        }
        if (newApp.secret != body.appSecret) {
            return res.status(401).send(`Invalid secret`)
        }    
        
        // validate existing app user
        let existingAppUser = await models.AppUser.findOne({
            where: { hash: body.existingHash },
        })
        if (!existingAppUser) {
            return res.status(401).send(`User is not yet registered on app: ${body.existingAppId}`)
        }

        // register to new app
        let newAppUserHash = hmac(newApp.secret + existingAppUser.userId)
        let newAppUser = await models.AppUser.findOrCreate({
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
app.get('/users/login', async (req, res, next) => {
    
    let body = req.query
    let error = validate({
        appId: 'required', 
        appSecret: 'required', 
        hash: 'required', 
    }, body)

    if (error) {
        return res.status(400).send(error)
    }

    try {
        // validate credentials
        await validateAppUserCredentials(body.hash, body.appId, body.appSecret)
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
app.post('/users/verifyPhone', async (req, res, next) => {
    
    let body = req.body
    let error = validate({
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
        await validateAppCredentials(body.appId, body.appSecret)
    } catch (e) {
        return res.status(401).send(e.message)
    }

    try {
        await nexmo.sendVerificationSMS(body.countryCode, body.phone)
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
app.post('/users/updatePhone', async (req, res, next) => {
    let body = req.body
    
    let error = validate({
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
        existingAppUser = await validateAppUserCredentials(body.existingHash, body.appId, body.appSecret)
    } catch (e) {
        return res.status(401).send(e.message)
    }

    try {
        // verify code
        await nexmo.checkVerificationSMS(body.countryCode, body.phone, body.verificationCode)

        // update user hash
        let newHash = hmac(`${body.countryCode}${body.phone}`)
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
app.put('/users', async (req, res, next) => {
    let body = req.body
    
    let error = validate({
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
        existingAppUser = await validateAppUserCredentials(body.hash, body.appId, body.appSecret)
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


module.exports = app