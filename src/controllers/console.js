"use strict";

const BaseController = require("./base"),
    express = require("express"),
    APIError = require("../server/api_error"),
    Constants = require("../constants"),
    multer = require("multer"),
    path = require("path"),
    { DateTime } = require("luxon");

class ConsoleController extends BaseController {
    constructor(args) {
        super(args.models, args);

        // Create child logger
        this.logger = args.logger.child({ scope: "Core.ConsoleAPI" });

        // Init uploader to temporary directory
        this.tempDir = path.join(this.config.WORK_DIR, "/storage/temp");
        this.upload = multer({
            dest: this.tempDir,
            fileFilter: function (req, file, cb) {
                // TODO: read by detecting mime types and content types header
                const ext = path.extname(file.originalname);
                if (![".png", ".jpg", ".jpeg"].includes(ext)) {
                    return cb(new APIError("ERR_30"));
                }
                cb(null, true);
            },
        }).single("logo");

        // Route
        this.route();
    }

    handlePatchUpdateAppName = this.handleRESTAsync(async (req) => {
        const appExtId = req.params.appExtId;
        const payload = req.body;

        // Validate body
        if (!payload || !payload.name) {
            throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST);
        }

        await this.services.App.updateAppName(appExtId, payload.name);

        return {
            data: null,
        };
    });

    uploadAsync = (req, res) => {
        return new Promise((resolve, reject) => {
            this.upload(req, res, (err) => {
                if (err) {
                    if (err instanceof multer.MulterError) {
                        switch (err.code) {
                            case "LIMIT_FILE_SIZE": {
                                err = new APIError("ERR_31");
                                break;
                            }
                        }
                    }
                    return reject(err);
                }

                return resolve();
            });
        });
    };

    handlePutUploadAppLogo = this.handleAsync(async (req, res) => {
        // Handle form data
        await this.uploadAsync(req, res);

        // Check if file uploaded
        if (!req.file) {
            this.logger.debug("logo file is required");
            throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST);
        }

        // Get app id params
        const extId = req.params["appExtId"];

        // Store logo file
        const result = await this.services.App.uploadLogo(extId, req.file);

        this.sendResponse(res, {
            data: result,
        });
    });

    handleGetAppDetail = this.handleRESTAsync(async (req) => {
        const extId = req.params["appExtId"];

        const app = await this.services.App.getAppDetail(extId);

        return {
            data: app,
        };
    });

    handlePatchAppCredentialName = this.handleRESTAsync(async (req) => {
        const clientId = req.params["clientId"];
        const payload = req.body;

        // Validate body
        if (!payload || !payload.name) {
            throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST);
        }

        await this.services.App.updateAppCredentialName(clientId, payload.name);

        return {
            data: null,
        };
    });

    route() {
        this.router = express.Router();

        this.router.get("/apps", this.handleConsoleAuth, this.handleListApp);
        this.router.post("/apps", this.handleConsoleAuth, this.handleCreateApp);
        this.router.put("/apps", this.handleConsoleAuth, this.handleUpdateOwnerId);
        this.router.delete("/apps/:appExtId", this.handleConsoleAuth, this.handleDeleteApp);
        this.router.post("/apps/:appExtId/credentials", this.handleConsoleAuth, this.handleCreateAppCredential);
        this.router.get("/apps/:appExtId/credentials", this.handleConsoleAuth, this.handleListAppCredential);
        this.router.put("/apps/:appExtId/configurations", this.handleConsoleAuth, this.handleUpdateAppConfig);
        this.router.get("/apps/:appExtId", this.handleConsoleAuth, this.handleGetAppDetail);
        this.router.put("/apps/:appExtId/logo", this.handleConsoleAuth, this.handlePutUploadAppLogo);
        this.router.patch("/apps/:appExtId/name", this.handleConsoleAuth, this.handlePatchUpdateAppName);
        this.router.patch(
            "/apps/credentials/:clientId/name",
            this.handleConsoleAuth,
            this.handlePatchAppCredentialName
        );
        this.router.delete(
            "/apps/:appExtId/credentials/:clientId",
            this.handleConsoleAuth,
            this.handleDeleteAppCredential
        );
        this.router.put(
            "/apps/:appExtId/credentials/:clientId/status",
            this.handleConsoleAuth,
            this.handleToggleAppCredentialStatus
        );
        this.router.get("/apps/:ownerId/dashboard", this.handleConsoleAuth, this.handleListOwnerApp);
        this.router.post("/sandbox/dev-users", this.handleConsoleAuth, this.handleRegisterDevUser);
        this.router.get("/sandbox/dev-users", this.handleConsoleAuth, this.handleListDevUser);
        this.router.delete("/sandbox/dev-users/:extId", this.handleConsoleAuth, this.handleDeleteDevUser);
        this.router.get("/sandbox/otps", this.handleConsoleAuth, this.handleListSandboxOTPs);
        this.router.post("/dc-users", this.handleConsoleAuth, this.handleCreateDCUser);
        this.router.patch("/dc-users/:id", this.handleConsoleAuth, this.handleUpdateBalanceDCUser);
        this.router.get("/dc-users/:id", this.handleConsoleAuth, this.handleGetDCUser);
    }

    handleDeleteDevUser = this.handleRESTAsync(async (req) => {
        const extId = req.params["extId"];

        const { App } = this.services;
        await App.deleteSandboxDevUser(extId);

        return {};
    });

    handleListSandboxOTPs = this.handleRESTAsync(async (req) => {
        const reqBody = {
            skip: parseInt(req.query["skip"], 10) || 0,
            limit: parseInt(req.query["limit"], 10) || 10,
            ownerEntityTypeId: parseInt(req.query["ownerEntityTypeId"], 0) || 0,
            ownerId: req.query["ownerId"],
        };

        this.validate(
            {
                ownerEntityTypeId: "required",
                ownerId: "required",
            },
            reqBody
        );

        const { App } = this.services;
        const result = await App.listSandboxOTPs(reqBody);

        return {
            data: result,
        };
    });

    handleUpdateAppConfig = this.handleRESTAsync(async (req) => {
        // Get request parameters
        const payload = req.body;
        const appExtId = req.params["appExtId"];

        const { App } = this.services;
        await App.updateConfig(appExtId, payload);

        return {};
    });

    handleListDevUser = this.handleRESTAsync(async (req) => {
        const reqBody = {
            skip: parseInt(req.query["skip"], 10) || 0,
            limit: parseInt(req.query["limit"], 10) || 10,
            ownerEntityTypeId: parseInt(req.query["ownerEntityTypeId"], 0) || 0,
            ownerId: req.query["ownerId"],
        };

        this.validate(
            {
                ownerEntityTypeId: "required",
                ownerId: "required",
            },
            reqBody
        );

        const { App } = this.services;
        const result = await App.listSandboxDevUsers(reqBody);

        return {
            data: result,
        };
    });

    handleRegisterDevUser = this.handleRESTAsync(async (req) => {
        const body = req.body;
        this.validate(
            {
                ownerEntityTypeId: "required",
                ownerId: "required",
                countryCode: "required",
                phone: "required",
            },
            body
        );

        // Register dev user
        await this.services.App.registerDevUser({
            ownerEntityTypeId: body.ownerEntityTypeId,
            ownerId: body.ownerId,
            inputCountryCode: body.countryCode,
            inputPhoneNo: body.phone,
        });

        return {};
    });

    handleCreateApp = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body;
        this.validate(
            {
                ownerEntityTypeId: "required",
                ownerId: "required",
                dcProjectId: "required",
                name: "required",
            },
            body
        );

        // Create app
        const result = await this.services.App.create(body);

        return {
            data: {
                id: result.extId,
            },
        };
    });

    handleCreateAppCredential = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body;
        this.validate(
            {
                credentialTypeId: "required",
            },
            body
        );

        // Get app external id
        const appExtId = req.params["appExtId"];

        // Create app
        const result = await this.services.App.createCredential(appExtId, body);

        return {
            data: {
                environmentId: result.environmentId,
                credentialTypeId: result.credentialTypeId,
                name: result.name,
                clientId: result.clientId,
                clientSecret: result.clientSecret,
                options: result.options,
                credentialStatusId: result.credentialStatusId,
                createdAt: result.createdAt,
                updatedAt: result.updatedAt,
            },
        };
    });

    handleListAppCredential = this.handleRESTAsync(async (req) => {
        // Get pagination from query
        const skip = parseInt(req.query["skip"], 10) || 0;
        const limit = parseInt(req.query["limit"], 10) || 10;
        const appExtId = req.params["appExtId"];

        const result = await this.services.App.listCredential(appExtId, skip, limit);

        return {
            data: result,
        };
    });

    handleListApp = this.handleRESTAsync(async (req) => {
        // Get pagination from query
        const skip = parseInt(req.query["skip"], 10) || 0;
        const limit = parseInt(req.query["limit"], 10) || 10;
        const filters = {
            ownerId: req.query["filterOwnerId"],
            name: req.query["filterName"],
        };

        const result = await this.services.App.list(skip, limit, filters);

        return {
            data: result,
        };
    });

    handleDeleteApp = this.handleRESTAsync(async (req) => {
        const appExtId = req.params["appExtId"];

        await this.services.App.delete(appExtId);

        return {};
    });

    handleDeleteAppCredential = this.handleRESTAsync(async (req) => {
        const appExtId = req.params["appExtId"];
        const clientId = req.params["clientId"];

        const result = await this.services.App.deleteCredential(appExtId, clientId);

        return {
            data: result,
        };
    });

    handleToggleAppCredentialStatus = this.handleRESTAsync(async (req) => {
        const appExtId = req.params["appExtId"];
        const clientId = req.params["clientId"];

        const result = await this.services.App.toggleCredentialStatus(appExtId, clientId);

        return {
            data: result,
        };
    });

    handleConsoleAuth = (req, res, next) => {
        // Get api key from header
        const apiKey = req.headers["x-api-key"];

        // Validate
        if (apiKey !== this.config.DEV_CONSOLE_CLIENT_API_KEY) {
            this.sendErrorResponse(res, new APIError(Constants.RESPONSE_ERROR_UNAUTHORIZED));
            return;
        }

        next();
    };

    handleCreateDCUser = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body;
        this.validate(
            {
                dcClientId: "required",
            },
            body
        );

        // Check exist
        const dcUser = await this.models.DevConsoleClient.findOne({ where: { dcClientId: body.dcClientId } });

        if (dcUser) {
            return {
                data: {
                    id: dcUser.id,
                    dcClientId: dcUser.dcClientId,
                },
            };
        }
        // Create DevConsoleClient
        const result = await this.models.DevConsoleClient.create(body);

        return {
            data: {
                id: result.id,
                dcClientId: result.dcClientId,
            },
        };
    });

    handleUpdateBalanceDCUser = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body;
        this.validate(
            {
                transactionId: "required",
            },
            body
        );

        // Check exist
        const [dcUser, transaction] = await Promise.all([
            this.models.DevConsoleClient.findOne({ where: { id: req.params.id } }),
            this.components.stripe.getTransactionById(body.transactionId),
        ]);

        if (!dcUser || !transaction) {
            throw new APIError(Constants.RESPONSE_ERROR_NOT_FOUND);
        }

        const currentBalance = +dcUser.balance + transaction.amount / 100;
        await this.models.DevConsoleClient.update({ balance: currentBalance }, { where: { id: dcUser.id } });

        return {
            data: {
                id: dcUser.id,
                dcClientId: dcUser.dcClientId,
                balance: currentBalance,
            },
        };
    });

    handleGetDCUser = this.handleRESTAsync(async (req) => {
        const dcUser = await this.models.DevConsoleClient.findOne({ where: { id: req.params.id } });

        if (!dcUser) {
            throw new APIError(Constants.RESPONSE_ERROR_NOT_FOUND);
        }

        return {
            data: {
                id: dcUser.id,
                dcClientId: dcUser.dcClientId,
                balance: +dcUser.balance,
            },
        };
    });

    handleListOwnerApp = this.handleRESTAsync(async (req) => {
        const { startDate, endDate } = req.query;
        if (
            !DateTime.fromFormat(startDate, "yyyy-MM-dd").isValid ||
            !DateTime.fromFormat(endDate, "yyyy-MM-dd").isValid
        ) {
            throw new APIError(
                Constants.RESPONSE_ERROR_BAD_REQUEST,
                "startDate and endDate must be valid dates with format yyyy-mm-dd"
            );
        }

        const { ownerId } = req.params;
        if (Number.isNaN(ownerId)) {
            throw new APIError(Constants.RESPONSE_ERROR_BAD_REQUEST, "ownerId must be a number");
        }

        // Define the start and end of the day
        const start = new Date(startDate);
        const end = new Date(endDate);

        const utcStart = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
        const utcEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));

        const result = await this.services.App.getListDashboard(ownerId, utcStart, utcEnd);

        return {
            data: result,
        };
    });

    handleUpdateOwnerId = this.handleRESTAsync(async (req) => {
        // Validate request
        const body = req.body;
        this.validate(
            {
                dcProjectId: "required",
                ownerId: "required",
            },
            body
        );

        const app = await this.models.App.findOne({ where: { dcProjectId: body.dcProjectId } });
        app.ownerId = body.ownerId;

        await app.save();

        return {
            data: {
                id: app.id,
                ownerId: app.ownerId,
            },
        };
    });
}

module.exports = ConsoleController;
