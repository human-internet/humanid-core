const helper = require('../helpers/helper'),
    models = require('../models/index'),
    validate = helper.validate,
    hmac = helper.hmac,    
    app = require('express').Router()

// TODO: API to register partner account
// TODO: API to log in partner
// TODO: API to log out partner
// TODO: API to list apps
// TODO: API to delete apps

/**
 * @api {post} /apps App registration
 * @apiName CreateApp
 * @apiGroup WebConsole
 * @apiDescription New (partner) app registration
 * 
 * @apiParam {String} appId Application ID
 *
 * @apiSuccess {String} id Application ID
 * @apiSuccess {String} secret Secret code to invoke secured API
 */
app.post('/apps', async (req, res) => {
    let body = req.body
    let error = validate({appId: 'required'}, body)
    if (error) {
        return res.status(400).send(error)
    }
    let hash = hmac(body.appId)
    let app = await models.App.findOrCreate({
        where: {id: body.appId},
        defaults: {id: body.appId, secret: hash}
    })
    return res.send(app[0])
})

module.exports = app