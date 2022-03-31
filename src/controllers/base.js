"use strict";

const APIError = require("../server/api_error"),
    Constants = require("../constants");

class BaseController {
    constructor(models, args) {
        this.models = models;

        // TODO: update child classes constructor calls and remove args unset check
        if (args) {
            this.config = args.config;
            this.components = args.components;
            this.services = args.services;
            this.middlewares = args.middlewares;

            // Set server functions
            this.handleRESTAsync = args.server.handleRESTAsync;
            this.handleAsync = args.server.handleAsync;
            this.sendResponse = args.server.sendResponse;
            this.sendErrorResponse = args.server.sendErrorResponse;
        }
    }

    /**
     * TODO: Replace with components.common.validateReq
     *
     * Validate body against rules
     * @param {Object.<string, string>} rules
     * @param {*} body Request Body
     */
    validate(rules, body) {
        for (let field in rules) {
            // If field is a custom or inherited property, continue
            if (!rules.hasOwnProperty(field)) {
                continue;
            }
            let fieldRules = rules[field].split("|");
            for (let i in fieldRules) {
                let val = body[field];
                let rule = fieldRules[i].toLowerCase();
                if (rule === "required") {
                    if (!val || val.length <= 0) {
                        throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST, `${field} is required`);
                    }
                } else if (rule.startsWith("in:")) {
                    // ignore if empty
                    if (val && val.length > 0) {
                        let values = rule.split(":")[1].split(",");
                        if (values.indexOf(val.toLowerCase()) < 0) {
                            throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST, `${field} must be in: ${values}`);
                        }
                    }
                }
            }
        }
        return null;
    }
}

module.exports = BaseController;
