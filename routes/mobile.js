const helpers = require('../helpers'),
    models = require('../models/index'),
    validate = helpers.validate,
    hmac = helpers.hmac,    
    app = require('express').Router()

// TODO: API to send push notification for web SDK login
// TODO: API to receive confirmation from mobile SDK for web login

/**
 * @api {post} /users/register User registration
 * @apiName RegisterUser
 * @apiGroup Mobile
 * @apiDescription New user registration
 *
 * @apiParam {String} phone User mobile phone number
 * @apiParam {String} deviceId User device ID
 * @apiParam {String} verificationCode User phone number verification code (OTP)
 * @apiParam {String} notifId Push notif ID
 * @apiParam {String} appId Partner app ID
 * @apiParam {String} appSecret Partner app secret
 *
 * @apiSuccess {String} appId Partner app ID
 * @apiSuccess {String} hash User hash (unique authentication code) for given app
 * @apiSuccess {String} deviceId User unique authentication code for given app
 */
app.post('/users/register', async (req, res, next) => {
    let body = req.body
    
    let error = validate({
        phone: 'required', 
        deviceId: 'required', 
        verificationCode: 'required', 
        appId: 'required', 
        appSecret: 'required',        
    }, body)

    if (error) {
        return res.status(400).send(error)
    }
    
    try {
        // check app
        let app = await models.App.findByPk(body.appId)
        if (!app) {
            return res.status(404).status(`App not found ${body.appId}`)
        }
        if (app.secret != body.appSecret) {
            return res.status(401).status(`Invalid secret`)
        }    
        // TODO: validate verification code with Twilio https://www.twilio.com/verify/api
        // register user if not yet exists
        let hash = hmac(body.phone)
        let user = await models.User.findOrCreate({
            where: {hash: hash},
            defaults: {hash: hash}
        })
        user = user[0]

        // register user to the app
        // app user hash = app secret + user hash 
        let appUserHash = hmac(app.secret + user.hash)
        let appUser = await models.AppUser.findOrCreate({
            where: {appId: app.id, userHash: user.hash},
            defaults: {
                appId: app.id, 
                userHash: user.hash, 
                hash: appUserHash, 
                deviceId: body.deviceId,
            }
        })
        appUser = appUser[0]
        if (appUser.deviceId !== body.deviceId) {
            return res.status(403).status(`Existing login found on deviceId: ${appUser.deviceId}`)
        }
        return res.send(appUser)
    } catch (e) {
        next(e)
    }
})

/**
 * @api {post} /users/login User login
 * @apiName LoginUser
 * @apiGroup Mobile
 * @apiDescription User login to new partner app using existing hash
 *
 * @apiParam {String} existingHash User existing app hash
 * @apiParam {String} notifId Push notif ID
 * @apiParam {String} appId Partner app ID
 * @apiParam {String} appSecret Partner app secret
 *
 * @apiSuccess {String} appId Partner app ID
 * @apiSuccess {String} hash User unique authentication code for given app
 * @apiSuccess {String} deviceId User unique authentication code for given app
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
        // check app
        let newApp = await models.App.findByPk(body.appId)
        if (!newApp) {
            return res.status(404).status(`App not found ${body.appId}`)
        }
        if (newApp.secret != body.appSecret) {
            return res.status(401).status(`Invalid secret`)
        }    
        
        // check user
        let existingAppUser = await models.AppUser.findOne({
            where: { hash: body.existingHash },
        })
        if (!existingAppUser) {
            return res.status(401).status(`User is not yet registered on app: ${body.existingAppId}`)
        }

        // register to new app
        let newAppUserHash = hmac(newApp.secret + existingAppUser.userHash)
        let newAppUser = await models.AppUser.findOrCreate({
            where: {appId: newApp.id, hash: newAppUserHash},
            defaults: {
                appId: newApp.id, 
                userHash: existingAppUser.userHash, 
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
 * @api {get} /users/login Login check
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
        // check app
        let app = await models.App.findByPk(body.appId)
        if (!app) {
            return res.status(404).status(`App not found ${body.appId}`)
        }
        if (app.secret != body.appSecret) {
            return res.status(401).status(`Invalid secret`)
        }   

        let appUser = await models.AppUser.findOne({
            where: { hash: body.hash },
        })
        if (!appUser) {
            return res.status(401).status(`User is not yet registered on app: ${body.appId}`)
        }
        return res.send({message: 'OK'})        
    } catch (e) {
        console.error(e)
        next(e)
    }
    
})

/**
 * @api {post} /users/verifyPhone Verify phone
 * @apiName VerifyPhone
 * @apiGroup Mobile
 * @apiDescription Trigger OTP SMS code
 *
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
        phone: 'required', 
    }, body)
    if (error) {
        return res.status(400).send(error)
    }

    try {
        // check app
        let app = await models.App.findByPk(body.appId)
        if (!app) {
            return res.status(404).status(`App not found ${body.appId}`)
        }
        if (app.secret != body.appSecret) {
            return res.status(401).status(`Invalid secret`)
        }   

        // TODO: call Twilio verify https://www.twilio.com/verify/api
        return res.send({message: 'OK'})        
    } catch (e) {
        console.error(e)
        next(e)
    }
    
})


module.exports = app