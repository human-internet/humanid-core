'use strict'

class BaseController {
    constructor(models) {
        this.models = models
    }

    /**
     * Validate body against rules
     * @param {*} rules
     * @param {*} body
     */
    validate(rules, body) {
        for (let field in rules) {
            for (let rule in rules[field].split('|')) {
                let val = body[field]
                rule = rule.toLowerCase()
                if (rule === 'required') {
                    if (!val || val.length <= 0) {
                        return {error: `${field} is required`}
                    }
                } else if (rule.startsWith('in:')) {
                    // ignore if empty
                    if (val && val.length > 0) {
                        let values = rule.split(':')[1].split(',')
                        if (values.indexOf(val.toLowerCase()) < 0) {
                            return {error: `${field} must be in: ${values}`}
                        }
                    }
                }
            }
        }
        return null
    }

    /**
     * Validate app credentials
     * @param {*} appId
     * @param {*} appSecret
     * @param {*} app
     */
    async validateAppCredentials(appId, appSecret, app) {
        if (!app) {
            app = await this.models.App.findByPk(appId)
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
     * @param {*} hash
     * @param {*} appId
     * @param {*} appSecret
     */
    async validateAppUserCredentials(hash, appId, appSecret) {
        // validate login hash
        let appUser = await this.models.AppUser.findOne({
            where: {hash: hash},
            include: [{all: true}],
        })
        if (!appUser) {
            throw new Error(`Invalid login hash`)
        }
        // validate app credentials
        this.validateAppCredentials(appId, appSecret, appUser.app)
        return appUser
    }

}

module.exports = BaseController