const bcrypt = require('bcryptjs'),
    helpers = require('../helpers'),
    middlewares = require('../middlewares'),
    models = require('../models/index'),
    validate = helpers.validate,
    hmac = helpers.hmac,
    app = require('express').Router()

// TODO: API to register partner account
// TODO: API to log in partner
// TODO: API to list apps
// TODO: API to delete apps

/**
 * @api {post} /console/login Login
 * @apiName login
 * @apiGroup WebConsole
 * 
 * @apiParam {String} email
 * @apiParam {String} password
 *
 * @apiSuccess {String} email
 * @apiSuccess {String} accessToken
 */
app.post('/login', async (req, res, next) => {
    let body = req.body
    let error = validate({email: 'required', password: 'required'}, body)
    if (error) {
        return res.status(400).send(error)
    }
    const email = req.body.email
    const password = req.body.password
    try {
        let admin = await models.Admin.findOne({
            where: { email: email },
        })
        if (!admin) {
            return res.status(400).send('Invalid credential')
        }
        let valid = await bcrypt.compare(password, admin.password)
        if (!valid) {
            return res.status(400).send('Invalid credential')
        }
        let obj = admin.toJSON()
        obj.accessToken = helpers.createJWT(admin)
        return res.send(obj)
    } catch (e) {
        next(e)
    }
})

/**
 * @api {post} /console/apps App registration
 * @apiName CreateApp
 * @apiGroup WebConsole
 * @apiDescription New (partner) app registration
 * 
 * @apiHeader {String} Authorization <code>Bearer accessToken</code>
 * 
 * @apiParam {String} appId Application ID
 *
 * @apiSuccess {String} id Application ID (must be unique 5-20 characters alphanumeric)
 * @apiSuccess {String} secret Secret code to invoke secured API
 */
app.post('/apps', middlewares.verifyJWT, async (req, res, next) => {
    let body = req.body
    let error = validate({appId: 'required'}, body)
    if (error) {
        return res.status(400).send(error)
    }
    try {
        let hash = hmac(body.appId)
        let app = await models.App.findOrCreate({
            where: {id: body.appId},
            defaults: {id: body.appId, secret: hash}
        })
        return res.send(app[0])
    } catch (e) {
        next(e)
    }
})

/**
 * @api {get} /console/apps App list
 * @apiName ListApps
 * @apiGroup WebConsole
 * @apiDescription Get list of registered (partner) apps
 * 
 * @apiHeader {String} Authorization <code>Bearer accessToken</code>
 * 
 * @apiSuccess {Array} data
 * @apiSuccess {Integer} total
 * @apiSuccess {Integer} pages
 * 
 */
app.get('/apps', middlewares.verifyJWT, async (req, res, next) => {
    let limit = req.query.limit || 10
    let skip = req.skip || 0
    try {
        // TODO: standardized paginated result
        let results = await models.App.findAndCountAll({limit: limit, offset: skip})
        res.send({
            data: results.rows,
            total: results.count,
            pages: Math.ceil(results.count / limit),
        })
    } catch (e) {        
        next(e)
    }
})

/**
 * @api {get} /console/users User list
 * @apiName ListUser
 * @apiGroup WebConsole
 * @apiDescription Get list of registered users
 * 
 * @apiHeader {String} Authorization <code>Bearer accessToken</code>
 * 
 * @apiSuccess {Array} data
 * @apiSuccess {Integer} total
 * @apiSuccess {Integer} pages
 * 
 */
app.get('/users', middlewares.verifyJWT, async (req, res, next) => {
    let limit = req.query.limit || 10
    let skip = req.skip || 0
    try {
        // TODO: standardized paginated result
        let results = await models.User.findAndCountAll({limit: limit, offset: skip})
        res.send({
            data: results.rows,
            total: results.count,
            pages: Math.ceil(results.count / limit),
        })
    } catch (e) {        
        next(e)
    }
})

module.exports = app