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

        // Mobile Log-in V2

        router.post(
            "/users/web-login",
            this.middlewares.authClientMobile,
            this.handleRESTAsync(async (req) => {
                // Get language parameter
                const lang = req.query.lang || "en";
                const priorityCountry = req.query["priority_country"] || "";
                const source = Constants.WebLogin.SourceMobile;

                // Validate requester credentials
                const { App } = this.services;
                const result = await App.getWebLoginURL({
                    appId: req.client.appId,
                    appCredential: req.client.appCredential,
                    languageCode: lang,
                    priorityCountry,
                    source,
                });

                return {
                    data: result,
                };
            })
        );

        // Set router
        this.router = router;
    };
}

module.exports = MobileController;
