'use strict'

/**
 * @typedef {Object} RESTHandlerResult
 * @property {*} data Result data
 * @property {string} code Message code
 * @property {string} message Message
 */

/**
 * Async REST Handler function
 * @async
 * @callback RESTHandlerAsyncFn
 * @param {*} req Express request
 * @returns {RESTHandlerResult}
 */

const express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    WebConsoleController = require('./controllers/webconsole'),
    MobileController = require('./controllers/mobile'),
    WebController = require('./controllers/web'),
    DemoAppController = require('./controllers/demo-app'),
    ResponseComponent = require('./components/response'),
    APIError = require('./server/api_error')

// Get Standard Codes
const {STD_CODES} = ResponseComponent

class Server {
    constructor(models, common, middlewares, nexmo, { logger }) {
        // Set logger
        this.logger = logger

        // Init config
        this.config = common.config

        // Init work dir
        this.workDir = path.resolve('./')

        // Init models
        this.models = models

        // Init components
        this.components = {
            common,
            nexmo,
            response: new ResponseComponent({filePath: this.workDir + '/response-codes.json'})
        }

        // Init router
        this.initRouter(middlewares)
    }

    initRouter(middlewares) {
        // Init router params
        const routerParams = {
            logger: this.logger,
            components: this.components,
            config: this.config,
            models: this.models,
            server: {
                handleAsync: this.handleAsync,
                handleRESTAsync: this.handleRESTAsync,
                sendResponse: this.sendResponse
            }
        }

        // Get params
        const models = this.models
        const {common, nexmo} = this.components

        // Init Main Routers
        this.app = express()

        // Configure middlewares
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended: true}))

        // Configure routing
        this.app.use('/', express.static('doc'))
        this.app.use('/lib', express.static('client/dist'))
        this.app.use('/examples', express.static('examples'))
        this.app.use('/console', new WebConsoleController(models, common, middlewares).router)
        this.app.use('/mobile', new MobileController(routerParams).router)
        this.app.use('/web', new WebController(models, common, nexmo).router)
        this.app.use('/demo-app/api', new DemoAppController(models, common).router)

        // Handle Errors
        this.app.use((req, res) => {
            this.sendErrorResponse(res, new APIError(STD_CODES.ERROR_NOT_FOUND))
        })

        // Handle Resource Not Found
        this.app.use((err, req, res) => {
            this.sendErrorResponse(res, err)
        })
    }

    /**
     * Send success response
     *
     * @param res {*} Express response object
     * @param opt {object} Options
     * @param opt.message {string} Message to override
     * @param opt.data {*} Data
     * @param opt.code {string} Response code
     */
    sendResponse = (res, opt = {}) => {
        // Get response component
        const {response: responseComponent} = this.components

        // Deconstruct options
        const {code, message, data} = opt

        /** @type {Response} */
        let resp

        if (code) {
            // If code is set, get response code
            resp = responseComponent.get(code, {success: true})
        } else {
            // Else, get a generic success
            resp = responseComponent.getSuccess()
        }

        // Compose response
        const body = resp.compose({message, data})

        // Send response
        res.json(body)
    }

    /**
     * Send error response
     *
     * @param res {*} Express response
     * @param err {APIError|Error} Error
     */
    sendErrorResponse = (res, err) => {
        // Get response component
        const {response: responseComponent} = this.components

        /** @type Response */
        let resp
        /** @type any */
        let data

        // If error is not APIError, convert to Internal Error
        if (err.constructor.name !== "APIError") {
            resp = responseComponent.getInternalError()

            // If debug mode, add source error stack
            if (this.config.APP_DEBUG) {
                data = {
                    _errorDebug: {
                        name: err.name,
                        message: err.message,
                        stack: err.stack
                    }
                }
            }

            // TODO: Log error cause
        } else {
            resp = responseComponent.get(err.code)
        }

        // Compose body
        const body = resp.compose({data, message: err.message})

        // Send response
        res
            .status(resp.status)
            .json(body)
    }

    /**
     * Wraps a Promised-based handler function and returns an express handler
     *
     * @param handlerFn
     * @returns {function(...[*]=)}
     */
    handleAsync = handlerFn => {
        // Create function
        return async (req, res, next) => {
            try {
                await handlerFn(req, res, next)
            } catch (err) {
                this.sendErrorResponse(res, err)
            }
        }
    }

    /**
     * Wraps a Async REST Handler function, receive result and send response
     *
     * @param {RESTHandlerAsyncFn} handlerFn
     * @returns {function(...[*]=)} Express handler function
     */
    handleRESTAsync = handlerFn => {
        // Create function
        return async (req, res) => {
            try {
                const result = await handlerFn(req)
                this.sendResponse(res, result)
            } catch (err) {
                this.sendErrorResponse(res, err)
            }
        }
    }
}

module.exports = Server