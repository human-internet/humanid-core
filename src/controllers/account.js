const BaseController = require("./base");
const express = require("express");
const Joi = require("joi");
const APIError = require("../server/api_error");
const Constants = require("../constants");

const sourceValidator = Joi.string().equal(Constants.WebLogin.SourceWeb, Constants.WebLogin.SourceMobile).required();

class AccountController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.Account" });

        // Init validation schemas
        this.schemas = {
            setRecoveryEmail: Joi.object().keys({
                exchangeToken: Joi.string().required(),
                recoveryEmail: Joi.string().email().required(),
                source: sourceValidator,
            }),
            requestVerifyNewPhoneOtp: Joi.object().keys({
                phone: Joi.string().required(),
                lang: Joi.string(),
                token: Joi.string().required(),
                source: sourceValidator,
            }),
            verifyNewPhone: Joi.object().keys({
                phone: Joi.string().required(),
                otpCode: Joi.string().required(),
                token: Joi.string().required(),
                source: sourceValidator,
            }),
            requestTransferAccountOtp: Joi.object().keys({
                oldPhone: Joi.string().required(),
                recoveryEmail: Joi.string().email().required(),
                token: Joi.string().required(),
                source: sourceValidator,
            }),
            transferAccount: Joi.object().keys({
                otpCode: Joi.string().required(),
                token: Joi.string().required(),
                source: sourceValidator,
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
                const validationResult = this.schemas.setRecoveryEmail.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }

                // Call service
                const data = await this.services.Account.setRecoveryEmail(payload);

                return { data };
            })
        );

        this.router.post(
            "/recovery/verify",
            this.middlewares.authWebLoginClient,
            this.handleRESTAsync(async (req) => {
                // Get and validate body
                const payload = req.body;
                const validationResult = this.schemas.verifyNewPhone.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }
                // Normalize payload
                if (!payload.lang) {
                    payload.lang = "en";
                }

                // Call service
                const data = await this.services.Account.verifyNewPhone(payload);
                return { data };
            })
        );

        this.router.post(
            "/recovery/verify/otp",
            this.middlewares.authWebLoginClient,
            this.handleRESTAsync(async (req) => {
                // Get and validate body
                const payload = req.body;
                const validationResult = this.schemas.requestVerifyNewPhoneOtp.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }

                // Normalize payload
                if (!payload.lang) {
                    payload.lang = "en";
                }

                // Call service
                const data = await this.services.Account.requestVerifyNewPhoneOtp(payload);

                return { data };
            })
        );

        this.router.post(
            "/recovery/transfer/otp",
            this.middlewares.authWebLoginClient,
            this.handleRESTAsync(async (req) => {
                // Get and validate body
                const payload = req.body;
                const validationResult = this.schemas.requestTransferAccountOtp.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }

                // Call service
                const data = await this.services.Account.requestTransferAccountOtp(payload);

                return { data };
            })
        );

        this.router.post(
            "/recovery/transfer",
            this.middlewares.authWebLoginClient,
            this.handleRESTAsync(async (req) => {
                // Get and validate body
                const payload = req.body;
                const validationResult = this.schemas.transferAccount.validate(payload);
                if (validationResult.error) {
                    this.logger.error(`ValidationError = ${validationResult.error}`);
                    throw new APIError("400").setData({ validationError: validationResult.error });
                }

                // Call service
                const data = await this.services.Account.transferAccount(payload);

                return { data };
            }),
        );
    }
}

module.exports = AccountController;
