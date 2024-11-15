"use strict";

const BaseController = require("./base"),
    express = require("express");

const Constants = require("../constants");
const { parsePhone } = require("../components/common");
const APIError = require("../server/api_error");

class WebLoginController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.WebLoginAPI" });

        // Route
        this.route();
    }

    route() {
        this.router = express.Router();

        this.router.get(
            "/apps/:appExtId",
            this.middlewares.authClientWebLogin,
            this.handleRESTAsync(async (req) => {
                // Get app external id
                const appExtId = req.params.appExtId;
                const source = req.query.s || Constants.WebLogin.SourceWeb;

                // Get app info
                const { App } = this.services;
                const result = await App.getAppWebLoginInfo(appExtId, source);

                return {
                    data: result,
                };
            })
        );

        this.router.post(
            "/sessions",
            this.middlewares.authClientWebLogin,
            this.handleRESTAsync(async (req) => {
                // Validate request
                const { body } = req;
                this.validate(
                    {
                        partnerClientId: "required",
                        partnerClientSecret: "required",
                    },
                    body
                );

                // Validate requester credentials
                const { App } = this.services;
                const result = await App.requestWebLoginSession(body);

                return {
                    data: result,
                };
            })
        );

        this.router.post(
            "/users/request-otp",
            this.middlewares.authClientWebLogin,
            this.handleRESTAsync(async (req) => {
                // Validate request
                const { body } = req;
                this.validate(
                    {
                        countryCode: "required",
                        phone: "required",
                        token: "required",
                    },
                    body
                );

                // Validate web login token
                const source = req.query.s || Constants.WebLogin.SourceWeb;
                const { App } = this.services;
                const client = await App.validateWebLoginToken({
                    token: body.token,
                    purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_REQUEST_LOGIN_OTP,
                    source,
                });

                // Get localization parameters from query, language code must be in ISO 639-1
                const language = req.query["lang"] || "en";

                // Init config if set
                let { config } = client.app;
                if (!config) {
                    config = client.app.config = App.initConfig();
                    await client.app.save();
                    this.logger.debug(`Fix null config. AppId = ${client.appId}`);
                }

                // Check if phone is from limited country
                const phone = parsePhone(body.phone, {
                    countryCode: body.countryCode,
                    limitCountry: config.web.limitCountry,
                });

                // Check balance
                const dcUser = await this.models.DevConsoleClient.findOne({ where: { id: client.app.ownerId } });

                if (
                    dcUser &&
                    +dcUser.balance <= this.config.BALANCE_MIN_TO_STOP_SEND_SMS &&
                    this.config.BALANCE_MIN_STOP_SEND_SMS
                ) {
                    throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST, "Low balance");
                }

                // Request OTP via SMS
                const result = await this.services.User.requestLoginOTP(client.appId, phone, {
                    environmentId: client.environmentId,
                    language: language,
                    requestId: body.requestId,
                });

                // Generate web login session token for login purpose
                result.session = App.createWebLoginSessionToken({
                    clientId: client.clientId,
                    clientSecret: client.clientSecret,
                    purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_LOGIN,
                    sessionId: result.requestId,
                });

                return {
                    data: result,
                };
            })
        );

        this.router.post(
            "/users/login",
            this.middlewares.authClientWebLogin,
            this.handleRESTAsync(async (req) => {
                // Validate request
                const { body } = req;
                this.validate(
                    {
                        countryCode: "required",
                        phone: "required",
                        deviceId: "required",
                        verificationCode: "required",
                        token: "required",
                    },
                    body
                );

                // Validate web login token
                const source = req.query.s || Constants.WebLogin.SourceWeb;
                const { App } = this.services;
                const client = await App.validateWebLoginToken({
                    token: body.token,
                    purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_LOGIN,
                    source,
                });

                // Set appId
                body.appId = client.appId;
                body.appCredentialId = client.appCredentialId;

                // Get exchange token
                const { expiredAt, exchangeToken, user } = await this.services.User.login(body);

                // Compose redirect url
                const redirectUrl = App.composeRedirectUrl(client.redirectUrl, exchangeToken);

                return {
                    data: {
                        exchangeToken,
                        redirectUrl: redirectUrl,
                        expiredAt,
                        user,
                        app: {
                            config: {
                                accountRecovery: client.app.config.web.accountRecovery || false,
                            },
                        },
                    },
                };
            })
        );
    }
}

module.exports = WebLoginController;
