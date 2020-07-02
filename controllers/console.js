'use strict'

const BaseController = require('./base'),
    express = require('express'),
    APIError = require('../server/api_error'),
    Constants = require('../constants')

class ConsoleController extends BaseController {
    constructor(args) {
        super(args.models, args)

        // Create child logger
        this.logger = args.logger.child({scope: 'Core.ConsoleAPI'})

        // Route
        this.route()
    }

    route() {
        this.router = express.Router()

        this.router.get('/apps', this.handleConsoleAuth, this.handleListApp)
        this.router.post('/apps', this.handleConsoleAuth, this.handleCreateApp)
        this.router.post('/apps/:appExtId/credentials', this.handleConsoleAuth, this.handleCreateAppCredential)
        this.router.get('/apps/:appExtId/credentials', this.handleConsoleAuth, this.handleListAppCredential)
        this.router.delete('/apps/:appExtId/credentials/:clientId', this.handleConsoleAuth, this.handleDeleteAppCredential)
        this.router.put('/apps/:appExtId/credentials/:clientId/status', this.handleConsoleAuth, this.handleToggleAppCredentialStatus)
    }

    handleCreateApp = this.handleRESTAsync(async req => {
        // Validate request
        const body = req.body
        this.validate({
            ownerEntityTypeId: 'required',
            ownerId: 'required',
            name: 'required'
        }, body)

        // Create app
        const result = await this.services.App.create(body)

        return {
            data: {
                id: result.extId
            }
        }
    })

    handleCreateAppCredential = this.handleRESTAsync(async req => {
        // Validate request
        const body = req.body
        this.validate({
            credentialTypeId: 'required'
        }, body)

        // Get app external id
        const appExtId = req.params['appExtId']

        // Create app
        const result = await this.services.App.createCredential(appExtId, body)

        return {
            data: {
                environmentId: result.environmentId,
                credentialTypeId: result.credentialTypeId,
                name: result.name,
                clientId: result.clientId,
                clientSecret: result.clientSecret,
                options: result.options,
                credentialStatusId: result.credentialStatusId,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt
            }
        }
    })

    handleListAppCredential = this.handleRESTAsync(async req => {
        // Get pagination from query
        const skip = parseInt(req.query['skip'], 10) || 0
        const limit = parseInt(req.query['limit'], 10) || 10
        const appExtId = req.params['appExtId']

        const result = await this.services.App.listCredential(appExtId, skip, limit)

        return {
            data: result
        }
    })

    handleListApp = this.handleRESTAsync(async req => {
        // Get pagination from query
        const skip = parseInt(req.query['skip'], 10) || 0
        const limit = parseInt(req.query['limit'], 10) || 10
        const filters = {
            ownerId: req.query['filterOwnerId']
        }

        const result = await this.services.App.list(skip, limit, filters)

        return {
            data: result
        }
    })

    handleDeleteAppCredential = this.handleRESTAsync(async req => {
        const appExtId = req.params['appExtId']
        const clientId = req.params['clientId']

        const result = await this.services.App.deleteCredential(appExtId, clientId)

        return {
            data: result
        }
    })


    handleToggleAppCredentialStatus = this.handleRESTAsync(async req => {
        const appExtId = req.params['appExtId']
        const clientId = req.params['clientId']

        const result = await this.services.App.toggleCredentialStatus(appExtId, clientId)

        return {
            data: result
        }
    })

    handleConsoleAuth = (req, res, next) => {
        // Get api key from header
        const apiKey = req.headers['x-api-key']

        // Validate
        if (apiKey !== this.config.CONSOLE_API_KEY) {
            this.sendErrorResponse(res, new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED))
            return
        }

        next()
    }
}

module.exports = ConsoleController