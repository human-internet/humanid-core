'use strict'

const
    APIError = require('../server/api_error'),
    Constants = require('../constants')

const
    BaseService = require('./base')

const
    SERVER_CRED_TYPE = 1,
    MOBILE_SDK_CRED_TYPE = 2


class AuthService extends BaseService {
    constructor(services, args) {
        super('Auth', services, args)
    }

    async authClient(credential, scope) {
        // Get client id and client secret
        const {clientId, clientSecret} = credential

        // Find by client id
        const {AppCredential} = this.models
        const appCred = await AppCredential.count({
            where: {clientId}
        })

        // If credential not found, throw unauthorized
        if (!appCred) {
            throw new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED)
        }

        // if client secret does not match, throw unauthorized
        if (appCred.clientSecret !== clientSecret) {
            throw new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED)
        }

        // If scope is invalid, throw forbidden
        let valid = this.validateCredType(scope, appCred.credentialTypeId)
        if (!valid) {
            throw new APIError(Constants.RESPONSE_ERROR_FORBIDDEN)
        }
    }

    validateCredType(scope, credentialTypeId) {
        if (scope === Constants.AUTH_SCOPE_SERVER && credentialTypeId === SERVER_CRED_TYPE) {
            return true
        } else if (scope === Constants.AUTH_SCOPE_MOBILE && credentialTypeId === MOBILE_SDK_CRED_TYPE) {
            return true
        }
        return false
    }
}

module.exports = AuthService