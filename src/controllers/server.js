"use strict";

const BaseController = require("./base"),
    express = require("express");

class ServerController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.ServerAPI" });

        // Route
        this.route();
    }

    route() {
        this.router = express.Router();

        this.router.post(
            "/users/web-login",
            this.middlewares.authClientServer,
            this.handleRESTAsync(async (req) => {
                // Get language parameter
                const lang = req.query["lang"] || "en";
                const priorityCountry = req.query["priority_country"] || "";
                const webLoginVersion = req.query["web_login_version"] || "v1";
                // Validate requester credentials
                const { App } = this.services;
                const result = await App.getWebLoginURL({
                    appId: req.client.appId,
                    appCredential: req.client.appCredential,
                    languageCode: lang,
                    priorityCountry: priorityCountry,
                    webLoginVersion: webLoginVersion,
                });

                return {
                    data: result,
                };
            }),
        );

        this.router.post(
            "/users/exchange",
            this.middlewares.authClientServer,
            this.handleRESTAsync(async (req) => {
                // Validate request
                const body = req.body;
                this.validate({ exchangeToken: "required" }, body);

                // Validate exchange token
                const { Auth: AuthService } = this.services;
                const { sessionId, appUserId, countryCode, requestId } = await AuthService.validateExchangeToken(
                    body.exchangeToken,
                );

                // Clear exchange token
                await AuthService.clearExchangeToken(sessionId, new Date());

                return {
                    data: {
                        appUserId,
                        countryCode,
                        requestId,
                    },
                };
            }),
        );
    }
}

module.exports = ServerController;
