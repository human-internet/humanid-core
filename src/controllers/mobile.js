"use strict";

const BaseController = require("./base"),
    express = require("express"),
    Constants = require("../constants");

class MobileController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.MobileAPI" });

        // Init routing
        this.route();
    }

    route = () => {
        // Init router
        const router = express.Router();

        // Mobile Log-in V1

        router.post(
            "/users/web-login",
            this.middlewares.authClientMobile,
            this.handleRESTAsync(async (req) => {
                // Get language parameter
                const lang = req.query.lang || "en";
                const priorityCountry = req.query["priority_country"] || "";
                const source = Constants.WebLogin.SourceMobile;
                const webLoginVersion = req.query["web_login_version"] || "v1";

                // Validate requester credentials
                const { App } = this.services;
                const result = await App.getWebLoginURL({
                    appId: req.client.appId,
                    appCredential: req.client.appCredential,
                    languageCode: lang,
                    priorityCountry,
                    source,
                    webLoginVersion,
                });

                return {
                    data: result,
                };
            })
        );

        router.post(
            "/users/events",
            this.middlewares.authClientMobile,
            this.handleRESTAsync(async (req) => {
                // Validate request body
                let { body } = req;
                this.validate(
                    {
                        userFingerprint: "required",
                        eventName: "required",
                    },
                    body
                );

                // Send Verification via SMS
                try {
                    await this.services.User.logEvent(req.client.appId, body);
                } catch (e) {
                    this.logger.error(`failed to log event. error = ${e}`);
                }

                return {};
            })
        );

        // Set router
        this.router = router;
    };
}

module.exports = MobileController;
