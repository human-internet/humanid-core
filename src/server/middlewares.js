"use strict";

const Constants = require("../constants");
const APIError = require("./api_error");

class Middlewares {
    constructor({ components, services, server, logger }) {
        this.components = components;
        this.services = services;
        this.logger = logger;
        this.server = server;

        this.authClientWebLogin = this.server.handleAsync(async (req, res, next) => {
            // Get credential
            const cred = this.getClientCredential(req);

            // Call validation service
            req.client = await this.services.Auth.authClient(cred, Constants.AUTH_SCOPE_WEB_LOGIN);

            next();
        });

        this.authWebLoginClient = this.server.handleAsync(async (req, res, next) => {
            // Get credential
            const cred = this.parseBasicAuthorization(req);

            // Call validation service
            req.client = await this.services.Auth.authClient(
                {
                    clientId: cred.userName,
                    clientSecret: cred.password,
                },
                Constants.AUTH_SCOPE_WEB_LOGIN
            );

            next();
        });

        this.authClientServer = this.server.handleAsync(async (req, res, next) => {
            // Get credential
            const cred = this.getClientCredential(req);

            // Call validation service
            req.client = await this.services.Auth.authClient(cred, Constants.AUTH_SCOPE_SERVER);

            next();
        });

        this.authClientMobile = this.server.handleAsync(async (req, res, next) => {
            // Get credential
            const cred = this.getClientCredential(req);

            // Call validation service
            req.client = await this.services.Auth.authClient(cred, Constants.AUTH_SCOPE_MOBILE);

            next();
        });
    }

    getClientCredential(req) {
        // Get parameter
        const cred = {
            clientId: req.headers["client-id"],
            clientSecret: req.headers["client-secret"],
        };

        // Validate credential
        this.components.common.validateReq(
            {
                clientId: "required",
                clientSecret: "required",
            },
            cred
        );

        return cred;
    }

    parseBasicAuthorization(req) {
        const value = req.headers.authorization;
        if (!value) {
            throw new APIError("400");
        }

        // Split string into 2
        const tmp = value.split(" ", 2);
        if (tmp.length !== 2) {
            throw new APIError("400");
        }

        // If header not basic
        if (tmp[0] !== "Basic") {
            throw new APIError("401");
        }

        // Decode base64
        const buff = Buffer.from(tmp[1], "base64");
        const cred = buff.toString("utf-8");

        // Get username and password
        const userPass = cred.split(":", 2);
        if (userPass.length !== 2) {
            userPass[1] = "";
        }

        return {
            userName: userPass[0],
            password: userPass[1],
        };
    }
}

module.exports = Middlewares;
