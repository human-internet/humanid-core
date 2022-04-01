const BaseController = require("./base");
const express = require("express");
const Joi = require("joi");
const APIError = require("../server/api_error");
const Constants = require("../constants");

class AccountController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.Account" });

        // Init validation schemas
        this.validationSchemas = {
            setRecoveryEmail: Joi.object().keys({
                exchangeToken: Joi.string().required(),
                recoveryEmail: Joi.string().email().required(),
                source: Joi.string().equal(Constants.WebLogin.SourceWeb, Constants.WebLogin.SourceMobile).required(),
            }),
        };

        // Initiate routing
        this.router = express.Router();
        this.route();
    }

    route() {
        this.router.post(
            "/recovery",
            this.middlewares.authWebLoginClient,
            this.handleRESTAsync(async (req) => {
                // Get and validate body
                const payload = req.body;
                const validationResult = this.validationSchemas.setRecoveryEmail.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }

                // Call service
                const data = await this.services.Account.setRecoveryEmail(payload);

                return { data };
            })
        );
    }
}

module.exports = AccountController;
