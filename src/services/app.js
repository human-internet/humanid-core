"use strict";

const APIError = require("../server/api_error"),
    nanoId = require("nanoid"),
    crypto = require("crypto"),
    sequelize = require("sequelize"),
    { QueryTypes, Op } = sequelize,
    jwt = require("jsonwebtoken"),
    Joi = require("joi"),
    _ = require("lodash"),
    fs = require("fs"),
    CountryValidator = require("../validator/country-validator"),
    s3 = require("../adapters/s3"),
    BaseService = require("./base"),
    Constants = require("../constants"),
    { promisify } = require("util");

const APP_UNVERIFIED = 1;

const OWNER_ENTITY_ORGANIZATION = 1;

const SERVER_CRED_TYPE = 1,
    MOBILE_SDK_CRED_TYPE = 2,
    CRED_TYPE_TEXT = {
        1: "Server Credential",
        2: "Mobile Credential",
    },
    CRED_TYPE_PREFIX = {
        1: "SERVER_",
        2: "MOBILE_",
    };

const ENV_PRODUCTION = 1,
    ENV_DEVELOPMENT = 2,
    ENV_TEXT = {
        1: "Production",
        2: "Development",
    };

const CREDENTIAL_ACTIVE = 1,
    CREDENTIAL_INACTIVE = 2;

const PLATFORM_ANDROID_SLUG = "android",
    PLATFORM_IOS_SLUG = "ios";

const ORG_REGISTERED_DEV_USER_LIMIT = 2;

const APP_PATH = "apps";

const deleteFile = promisify(fs.unlink);

class AppService extends BaseService {
    constructor(services, args) {
        super("App", services, args);

        this.generateExtId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);
        this.generateClientId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 22);
        this.generateClientSecret = nanoId.customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.~",
            64
        );
        this.generateDevUserExtId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 24);
        this.generateWebLoginSessionId = nanoId.customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            64
        );
        this.generateLogoFileName = nanoId.customAlphabet(
            "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
            16
        );

        // Init validation schemas
        const webConfig = Joi.object().keys({
            redirectUrls: Joi.object({
                success: Joi.string().uri(),
                failed: Joi.string().uri(),
            }),
            priorityCountry: Joi.array().items(Joi.string().length(2)).optional(),
            privacyPolicyUrl: Joi.string().uri().optional(),
            limitCountry: Joi.array().items(Joi.string().length(2)).optional(),
        });

        this.schemas = {
            webConfig: webConfig,
            appConfig: Joi.object().keys({
                web: webConfig,
            }),
        };
    }

    composeRedirectUrl(redirectUrl, exchangeToken) {
        // Encode exchange token to URL
        exchangeToken = encodeURIComponent(exchangeToken);

        // Compose redirect url
        return `${redirectUrl}?et=${exchangeToken}`;
    }

    async updateConfig(appExtId, payload) {
        // Get app by external id
        const app = await this.getApp(appExtId);

        // Validate config schema
        const validationResult = this.schemas.appConfig.validate(payload);

        // Return validation result
        if (validationResult.error) {
            this.logger.error(`ValidationError = ${validationResult.error}`);
            throw new APIError("ERR_29").setData({ validationError: validationResult.error.details });
        }

        // Validate web config if set
        if (payload.web) {
            this.validateWebConfigInput(payload.web);
        }

        // Save config
        app.config = payload;
        await app.save();
    }

    resolveLogoUrl(fileName) {
        // Resolve assets url
        if (!fileName) {
            fileName = "placeholder.png";
        }

        return {
            thumbnail: s3.getUrl(APP_PATH, fileName),
        };
    }

    getRedirectUrl(app, source) {
        switch (source) {
            case Constants.WebLogin.SourceWeb: {
                this.validateWebAppConfig(app);
                return app.config.web.redirectUrls;
            }
            case Constants.WebLogin.SourceMobile: {
                const baseUri = `humanid-${app.extId.toLowerCase()}://login/`;
                return {
                    failed: baseUri + "failed",
                    success: baseUri + "success",
                };
            }
            default: {
                throw new Error(`unknown source: ${source}`);
            }
        }
    }

    async getAppWebLoginInfo(appExtId, source) {
        // Get app by external id
        const app = await this.getApp(appExtId);

        // Get redirect url
        const redirectUrls = this.getRedirectUrl(app, source);

        // Resolve assets url
        const logoUrls = this.resolveLogoUrl(app.logoFile);

        // Composer response
        return {
            app: {
                name: app.name,
                logoUrls: logoUrls,
                redirectUrlFail: redirectUrls.failed,
            },
        };
    }

    async getWebLoginURL(args) {
        // Get client id and client secret
        const { appId, appCredential, languageCode } = args;
        let { priorityCountry, source } = args;

        // Normalize source
        switch (source) {
            case Constants.WebLogin.SourceWeb:
            case Constants.WebLogin.SourceMobile: {
                break;
            }
            default: {
                source = Constants.WebLogin.SourceWeb;
            }
        }

        // Find by client id
        const { App } = this.models;

        // Validate redirect url configuration
        const app = await App.findOne({
            where: { id: appId },
        });

        // Validate source config for web
        if (source === Constants.WebLogin.SourceWeb) {
            this.validateWebAppConfig(app);
        }

        priorityCountry = this.getPriorityCountry(priorityCountry, app.config);

        const limitCountry = app.config?.limitCountry || [];

        // Generate session
        const session = this.createWebLoginSessionToken({
            clientId: appCredential.clientId,
            clientSecret: appCredential.clientSecret,
            purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_REQUEST_LOGIN_OTP,
        });

        // Generate web login URL
        const webLoginURL = new URL(this.config["WEB_LOGIN_URL"]);
        webLoginURL.searchParams.append("t", session.token);
        webLoginURL.searchParams.append("a", app.extId);
        webLoginURL.searchParams.append("lang", languageCode);
        webLoginURL.searchParams.append("priority_country", priorityCountry.toUpperCase());
        webLoginURL.searchParams.append("s", source);

        // Append limit country if set
        if (limitCountry.length > 0) {
            webLoginURL.searchParams.append("lc", limitCountry.join(",").toUpperCase());
        }

        return {
            webLoginUrl: webLoginURL.href,
        };
    }

    getPriorityCountry(req, appConfig) {
        // If request is set, then return
        if (req) {
            return req;
        }

        // Retrieve from config
        if (appConfig && appConfig.web && appConfig.web.priorityCountry && appConfig.web.priorityCountry.length > 0) {
            return _.join(appConfig.web.priorityCountry);
        }

        return "US";
    }

    async validateWebLoginToken({ token, purpose, source }) {
        // Verify jwt
        const { common } = this.components;
        const jwtSecret = this.config["WEB_LOGIN_SESSION_SECRET"];

        let payload;
        try {
            payload = await common.verifyJWT(token, jwtSecret);
        } catch (e) {
            // TODO: Handle jwt error and Re-throw exception with APIError
            throw e;
        }

        // Parse payload
        const clientId = payload.sub;
        const sessionId = payload.jti;

        // Find credentials by client id
        const { AppCredential, App } = this.models;
        const appCred = await AppCredential.findOne({
            where: { clientId: clientId },
            include: [{ model: App, as: "app" }],
        });

        // If credential not found, throw error
        if (!appCred) {
            throw new APIError("ERR_26");
        }

        // Generate session signature
        const expectedSignature = this.signWebLoginPayload(sessionId, appCred.clientId, appCred.clientSecret, purpose);

        // Validate session signature
        if (expectedSignature !== payload.signature) {
            throw new APIError("ERR_27");
        }

        // Retrieve redirect url value
        const app = appCred.app;
        const redirectUrl = this.getRedirectUrl(app, source);

        return {
            appId: appCred.appId,
            environmentId: appCred.environmentId,
            clientId: appCred.clientId,
            clientSecret: appCred.clientSecret,
            sessionId: sessionId,
            redirectUrl: redirectUrl.success,
        };
    }

    validateWebConfigInput(config) {
        // Validate config structure
        let result = this.schemas.webConfig.validate(config);
        if (result.error) {
            this.logger.error(`ValidationError = ${result.error}`);
            throw new APIError("ERR_28").setData({ validationError: result.error.details });
        }

        // Init priority country list if not set
        if (!config.priorityCountry) {
            config.priorityCountry = [];
        } else {
            // Normalize values
            config.priorityCountry = config.priorityCountry.map((v) => v.toUpperCase());
        }

        // Validate priorityCountry
        result = CountryValidator.isValidAlpha2(config.priorityCountry);
        if (result.error) {
            this.logger.error(`ValidationError = ${result.error}`);
            throw new APIError("ERR_28").setData({ validationError: result.error });
        }

        // Init limit country list if not set
        if (!config.limitCountry) {
            config.limitCountry = [];
        } else {
            // Normalize values
            config.limitCountry = config.limitCountry.map((v) => v.toUpperCase());
        }

        // Validate priorityCountry
        result = CountryValidator.isValidAlpha2(config.limitCountry);
        if (result.error) {
            this.logger.error(`ValidationError = ${result.error}`);
            throw new APIError("ERR_28").setData({ validationError: result.error });
        }

        // Ensure limit country value does not available in priority
        if (config.limitCountry.length > 0 && config.priorityCountry.length > 0) {
            const countryIntersection = config.limitCountry.filter((i) => config.priorityCountry.includes(i));
            if (countryIntersection.length > 0) {
                const countries = countryIntersection.join(", ");
                throw new APIError("ERR_29").setData({
                    validationError: {
                        message: `cannot have a same country in both priorityCountry and limitCountry. Country: ${countries}`,
                    },
                });
            }
        }
    }

    validateWebAppConfig(app) {
        if (!app.config) {
            this.logger.error("app.config is empty");
            throw new APIError("ERR_28");
        }

        const result = this.schemas.webConfig.validate(app.config["web"]);

        if (result.error) {
            this.logger.error(`ValidationError = ${result.error}`);
            throw new APIError("ERR_28").setData({ validationError: result.error.details });
        }
    }

    async requestWebLoginSession(args) {
        // Get client id and client secret
        const { partnerClientId: clientId, partnerClientSecret: clientSecret } = args;

        // Find by client id
        const { AppCredential, App } = this.models;
        const appCred = await AppCredential.findOne({
            where: { clientId },
            include: [{ model: App, as: "app" }],
        });

        // If credential not found, throw error
        if (!appCred) {
            throw new APIError("ERR_26");
        }

        // if client secret does not match, throw error
        if (appCred.clientSecret !== clientSecret) {
            throw new APIError("ERR_26");
        }

        // Validate redirect url configuration
        const app = appCred["app"];
        this.validateWebAppConfig(app);

        // Generate session
        const session = this.createWebLoginSessionToken({
            clientId: clientId,
            clientSecret: clientSecret,
            purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_REQUEST_LOGIN_OTP,
        });

        const logoUrls = this.resolveLogoUrl(app.logoFile);

        return {
            app: {
                name: app.name,
                logoUrls: logoUrls,
            },
            session: session,
        };
    }

    signWebLoginPayload(sessionId, clientId, clientSecret, purpose) {
        const salt = this.config["WEB_LOGIN_SESSION_SALT"];
        const rawSignature = `${purpose}-${sessionId}-${clientId}-${salt}`;
        return this.components.common.hmac(rawSignature, clientSecret);
    }

    createWebLoginSessionToken({ clientId, clientSecret, purpose, sessionId, lifetime }) {
        // If session id is unset, then generate a new session id
        if (!sessionId) {
            sessionId = this.generateWebLoginSessionId();
        }

        // If lifetime is unset, then set default lifetime from config
        if (!lifetime) {
            lifetime = this.config["WEB_LOGIN_SESSION_LIFETIME"];
        }

        // Sign credentials
        const signature = this.signWebLoginPayload(sessionId, clientId, clientSecret, purpose);

        // Create payload
        const payload = {
            purpose: purpose,
            signature: signature,
        };

        // Calculate expiration
        const { dateUtil } = this.components;
        const expiredAt = dateUtil.addSecond(new Date(), lifetime);

        // Create jwt
        const secret = this.config["WEB_LOGIN_SESSION_SECRET"];
        const token = jwt.sign(payload, secret, {
            jwtid: sessionId,
            subject: clientId,
            expiresIn: `${lifetime}s`,
        });

        return {
            purpose: purpose,
            token: token,
            expiredAt: dateUtil.toEpoch(expiredAt),
        };
    }

    async listSandboxOTPs({ ownerEntityTypeId, ownerId, skip, limit }) {
        // Get data source reference
        const { UserOTPSandbox, OrgDevUser } = this.models;

        // Retrieve data
        const result = await UserOTPSandbox.findAndCountAll({
            include: {
                model: OrgDevUser,
                as: "devUser",
                required: true,
                where: {
                    ownerEntityTypeId,
                    ownerId,
                },
            },
            where: { expiredAt: { [Op.gt]: new Date() } },
            limit,
            offset: skip,
        });

        // Response data
        const respData = result.rows.map((item) => {
            return {
                phoneNoMasked: item.phoneNoMasked,
                otpCode: item.otpCode,
                createdAt: item.createdAt,
            };
        });

        return {
            otps: respData,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count,
            },
        };
    }

    async getSandboxDevUser(appId, phoneNo) {
        const { App, OrgDevUser } = this.models;

        // Get owner info
        const app = await App.findByPk(appId);
        if (!app) {
            throw new APIError("ERR_17");
        }

        // Get hash id
        const hashId = this.getDevPhoneHash(app.ownerEntityTypeId, app.ownerId, phoneNo);

        // Get dev user
        return OrgDevUser.findOne({ where: { hashId: hashId } });
    }

    createFileName(file) {
        // Determine extensions
        let ext;
        switch (file.mimetype) {
            case "image/png": {
                ext = ".png";
                break;
            }
            case "image/jpeg": {
                ext = ".jpg";
                break;
            }
        }

        return this.generateLogoFileName() + ext;
    }

    async uploadLogo(extId, file) {
        // Get models
        const { App } = this.models;

        // Get app
        const app = await App.findOne({ where: { extId } });
        if (!app) {
            throw new APIError("ERR_17");
        }

        // Get destination
        const fileName = this.createFileName(file);
        const objectName = s3.getObjectName(APP_PATH, fileName);

        // Upload file to s3
        const fileContent = fs.readFileSync(file.path);
        try {
            await s3.client
                .upload({
                    Bucket: s3.bucketName,
                    Key: objectName,
                    Body: fileContent,
                    ContentType: file.mimetype,
                })
                .promise();
            this.logger.debug(`File uploaded to S3. ObjectName = ${objectName}`);
        } catch (err) {
            this.logger.error(`an error occurred during upload to s3. Error = ${err}`);
            throw err;
        }

        // Delete temporary file
        await this.deleteTempFile(file.path);

        // Update app logo file
        const count = await App.update(
            {
                logoFile: fileName,
            },
            {
                where: { id: app.id },
            }
        );
        this.logger.debug(`updated app logoFile count = ${count}`);

        // Compose response
        return {
            logoFile: fileName,
            logoUrls: this.resolveLogoUrl(fileName),
        };
    }

    async deleteTempFile(filePath) {
        try {
            await deleteFile(filePath);
            this.logger.debug(`successfully delete temporary file. filePath = ${filePath}`);
        } catch (err) {
            this.logger.warn(`failed to delete temporary file. filePath = ${filePath}`, {
                error: err,
            });
        }
    }

    async getAppDetail(extId) {
        // Get models
        const { App } = this.models;

        // Get app
        const app = await App.findOne({ where: { extId } });
        if (!app) {
            throw new APIError("ERR_17");
        }

        return {
            extId: app.extId,
            ownerEntityTypeId: app.ownerEntityTypeId,
            ownerId: app.ownerId,
            name: app.name,
            logoFile: app.logoFile,
            logoUrls: this.resolveLogoUrl(app.logoFile),
            appStatusId: app.appStatusId,
            config: app.config,
            createdAt: app.createdAt,
            updatedAt: app.updatedAt,
        };
    }

    async deleteSandboxDevUser(extId) {
        // Get models
        const { OrgDevUser, UserOTPSandbox } = this.models;

        // Get OrgDevUser
        const devUser = await OrgDevUser.findOne({ where: { extId: extId } });
        if (!devUser) {
            throw new APIError("ERR_25");
        }

        // delete all otp related to user
        let count = await UserOTPSandbox.destroy({ where: { devUserId: devUser.id } });
        this.logger.debug(`OrgDevUser deleted count = ${count}. devUserId = ${devUser.id}`);

        // delete user
        count = await OrgDevUser.destroy({ where: { id: devUser.id } });
        this.logger.debug(`OrgDevUser deleted count = ${count}. devUserId = ${devUser.id}`);
    }

    async listSandboxDevUsers({ ownerEntityTypeId, ownerId, skip, limit }) {
        // Get rows
        const { OrgDevUser } = this.models;
        const result = await OrgDevUser.findAndCountAll({
            where: {
                ownerEntityTypeId: ownerEntityTypeId,
                ownerId: ownerId,
            },
            limit: limit,
            offset: skip,
        });

        // Response data
        const respData = result.rows.map((item) => {
            return {
                extId: item.extId,
                phoneNoMasked: item.phoneNoMasked,
                createdAt: item.createdAt,
            };
        });

        return {
            devUsers: respData,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count,
            },
        };
    }

    getDevPhoneHash(ownerEntityTypeId, ownerId, phoneNo) {
        // Get config
        const salt1 = this.config.HASH_ID_SALT_1;
        const salt2 = this.config.HASH_ID_SALT_2;
        const secret = this.config.HASH_ID_SECRET;

        // Create a hashed sha-512 phone number
        const raw = salt2 + ownerEntityTypeId + phoneNo + ownerId + salt1;
        return crypto.createHmac("sha512", secret).update(raw).digest("hex");
    }

    async registerDevUser({ ownerEntityTypeId, ownerId, inputCountryCode, inputPhoneNo }) {
        // Count registered dev user
        const { OrgDevUser } = this.models;
        const devUserCount = await OrgDevUser.count({
            where: {
                ownerEntityTypeId: ownerEntityTypeId,
                ownerId: ownerId,
            },
        });

        // If registered count reach limit, then return error
        if (devUserCount >= ORG_REGISTERED_DEV_USER_LIMIT) {
            throw new APIError("ERR_23");
        }

        // Parse phone number
        const phone = this.components.common.parsePhoneNo(inputCountryCode, inputPhoneNo);
        const phoneNo = phone.number;

        // Generate dev user hash id
        const hashId = this.getDevPhoneHash(ownerEntityTypeId, ownerId, phoneNo);

        // Search if exist
        const foundCount = await OrgDevUser.count({
            where: {
                hashId: hashId,
            },
        });

        if (foundCount > 0) {
            throw new APIError("ERR_24");
        }

        // Get Country Code
        const countryCode = phone.countryCallingCode;
        const maskedLen = phoneNo.length - 3 - countryCode.length;

        // Create masked phone number
        const phoneNoMasked = "+" + countryCode + "X".repeat(maskedLen) + phoneNo.substr(-3);

        // Insert
        await OrgDevUser.create({
            extId: this.generateDevUserExtId(),
            ownerEntityTypeId: ownerEntityTypeId,
            ownerId: ownerId,
            hashId: hashId,
            phoneNoMasked: phoneNoMasked,
            createdAt: new Date(),
        });
    }

    async create({ ownerEntityTypeId, ownerId, name }) {
        // Validate ownerEntityTypeId
        if (ownerEntityTypeId !== OWNER_ENTITY_ORGANIZATION) {
            throw new APIError("ERR_16");
        }

        // Get model reference
        const { App } = this.models;

        // Init timestamp
        const timestamp = new Date();

        // Insert app
        const result = await App.create({
            ownerEntityTypeId: ownerEntityTypeId,
            ownerId: ownerId,
            extId: this.generateExtId(),
            name: name,
            appStatusId: APP_UNVERIFIED,
            createdAt: timestamp,
            updatedAt: timestamp,
        });

        return {
            id: result.id,
            extId: result.extId,
        };
    }

    validatePlatform(platformSlug) {
        switch (platformSlug) {
            case PLATFORM_ANDROID_SLUG:
            case PLATFORM_IOS_SLUG:
                return true;
            default:
                throw new APIError("ERR_20");
        }
    }

    getPlatformOptions(platformSlug, options) {
        let rules = {};
        switch (platformSlug) {
            case PLATFORM_ANDROID_SLUG:
                rules = { packageId: "required" };
                break;
            case PLATFORM_IOS_SLUG:
                rules = { bundleId: "required" };
                break;
            default:
                throw new APIError("ERR_21");
        }

        try {
            this.components.common.validateReq(rules, options);
        } catch (e) {
            throw new APIError("ERR_22");
        }

        switch (platformSlug) {
            case PLATFORM_ANDROID_SLUG:
                return {
                    platform: platformSlug,
                    packageId: options.packageId,
                };

            case PLATFORM_IOS_SLUG:
                return {
                    platform: platformSlug,
                    bundleId: options.bundleId,
                };

            default:
                return {};
        }
    }

    parseCredentialPlatformOption(payload) {
        // Get platform slug name
        const platformSlug = payload.platform;

        // If platform is not set, then set
        if (!platformSlug) {
            throw new APIError("ERR_20");
        }

        // Validate platform slug name
        this.validatePlatform(platformSlug);

        // Get platform options
        const platformOpts = payload[platformSlug];
        if (!platformOpts) {
            throw new APIError("ERR_21");
        }

        return this.getPlatformOptions(platformSlug, platformOpts);
    }

    async createCredential(appExtId, payload) {
        // Get parameters
        let { environmentId, credentialTypeId, name } = payload;

        // Validate credentialTypeId
        if (![SERVER_CRED_TYPE, MOBILE_SDK_CRED_TYPE].includes(credentialTypeId)) {
            throw new APIError("ERR_18");
        }

        // Set development env if unset
        if (![ENV_PRODUCTION, ENV_DEVELOPMENT].includes(environmentId)) {
            environmentId = ENV_DEVELOPMENT;
        }

        // Get model reference
        const { AppCredential } = this.models;

        // Validate app existence
        const app = await this.getApp(appExtId);

        // Set default name if unset
        if (!name) {
            name = `${app.name} ${CRED_TYPE_TEXT[credentialTypeId]} for ${ENV_TEXT[environmentId]}`;
        }

        // Get options from payload
        let options = {};
        if (credentialTypeId === MOBILE_SDK_CRED_TYPE) {
            options = this.parseCredentialPlatformOption(payload["options"]);
        }

        // Init timestamp
        const timestamp = new Date();

        // Create client id and secret
        const clientId = CRED_TYPE_PREFIX[credentialTypeId] + this.generateClientId();
        const clientSecret = this.generateClientSecret();

        // Create app
        return await AppCredential.create({
            appId: app.id,
            environmentId: environmentId,
            credentialTypeId: credentialTypeId,
            name: name,
            clientId: clientId,
            clientSecret: clientSecret,
            options: options,
            credentialStatusId: CREDENTIAL_ACTIVE,
            createdAt: timestamp,
            updatedAt: timestamp,
        });
    }

    async listCredential(appExtId, skip, limit) {
        // Get app
        const app = await this.getApp(appExtId);

        // Get rows
        const { AppCredential } = this.models;
        const result = await AppCredential.findAndCountAll({ where: { appId: app.id }, limit: limit, offset: skip });

        // Compose response
        const credentialList = result.rows.map((item) => {
            return {
                environmentId: item.environmentId,
                credentialTypeId: item.credentialTypeId,
                name: item.name,
                clientId: item.clientId,
                clientSecret: item.clientSecret,
                options: item.options,
                credentialStatusId: item.credentialStatusId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });

        return {
            credentials: credentialList,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count,
            },
        };
    }

    async list(skip, limit, filters) {
        // Prepare where
        const whereFilter = {};
        if (filters.ownerId) {
            whereFilter.ownerId = filters.ownerId;
        }

        if (filters.name) {
            // whereFilter.name = sequelize.where(sequelize.fn('LOWER', sequelize.col('name')), 'LIKE', '%' + filters.name + '%');
            whereFilter.name = { [Op.like]: `%${filters.name}%` };
        }

        // Get rows
        const { App } = this.models;
        const result = await App.findAndCountAll({ where: whereFilter, limit: limit, offset: skip });

        // Compose response
        const appsResp = result.rows.map((item) => {
            return {
                extId: item.extId,
                ownerEntityTypeId: item.ownerEntityTypeId,
                ownerId: item.ownerId,
                name: item.name,
                logoUrls: this.resolveLogoUrl(item.logoFile),
                appStatusId: item.appStatusId,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
            };
        });

        return {
            apps: appsResp,
            _metadata: {
                limit: limit,
                skip: skip,
                count: result.count,
            },
        };
    }

    async delete(appExtId) {
        // Get app
        const app = await this.getApp(appExtId);

        // Get connection from models
        const db = this.models.App.sequelize;

        // delete all exchange session that is related to app id
        let result = await db.query(
            "DELETE aus FROM AppUserSession aus INNER JOIN AppUser au on aus.appUserId = au.id WHERE au.appId = $appId;",
            {
                bind: { appId: app.id },
                type: QueryTypes.UPDATE,
            }
        );
        this.logger.debug(`AppUserSession deleted count = ${result[1]}. appId = ${app.id}`);

        // delete all user app session
        result = await db.query(
            "DELETE ues FROM UserExchangeSession ues INNER JOIN AppUser au on ues.appUserId = au.id WHERE au.appId = $appId;",
            {
                bind: { appId: app.id },
                type: QueryTypes.UPDATE,
            }
        );
        this.logger.debug(`UserExchangeSession deleted count = ${result[1]}. appId = ${app.id}`);

        // delete all user that is related to app
        let count = await this.models.AppUser.destroy({ where: { appId: app.id } });
        this.logger.debug(`AppUser deleted count = ${count}. appId = ${app.id}`);

        // delete all credential
        count = await this.models.AppCredential.destroy({ where: { appId: app.id } });
        this.logger.debug(`AppCredential deleted count = ${count}. appId = ${app.id}`);

        // delete app
        count = await this.models.App.destroy({ where: { id: app.id } });
        this.logger.debug(`App deleted count = ${count}. id = ${app.id}`);
    }

    async deleteCredential(appExtId, clientId) {
        // Get app
        const app = await this.getApp(appExtId);

        // Delete credential
        const count = await this.models.AppCredential.destroy({ where: { appId: app.id, clientId: clientId } });

        return {
            deletedCount: count,
        };
    }

    async toggleCredentialStatus(appExtId, clientId) {
        // Get app
        const app = await this.getApp(appExtId);

        // Get credential
        const credential = await this.models.AppCredential.findOne({ where: { appId: app.id, clientId: clientId } });
        if (!credential) {
            throw new APIError("ERR_19");
        }

        // Determine status
        let updatedStatus;
        if (credential.credentialStatusId === CREDENTIAL_INACTIVE) {
            updatedStatus = CREDENTIAL_ACTIVE;
        } else {
            updatedStatus = CREDENTIAL_INACTIVE;
        }

        // Update credential
        credential.credentialStatusId = updatedStatus;
        credential.updatedAt = new Date();
        await credential.save();

        return {
            credentialStatusId: updatedStatus,
        };
    }

    async getApp(appExtId) {
        // Validate app existence
        const app = await this.models.App.findOne({
            where: { extId: appExtId },
        });
        if (!app) {
            throw new APIError("ERR_17");
        }

        return app;
    }

    async updateAppCredentialName(clientId, name) {
        // Retrieve app credential
        const ac = await this.models.AppCredential.findOne({
            where: { clientId },
        });

        // If credential not found, return error
        if (!ac) {
            throw new APIError("ERR_32");
        }

        // Update name
        ac.name = name;
        ac.updatedAt = new Date();
        await ac.save();
    }

    async updateAppName(extId, name) {
        // Retrieve app credential
        const ac = await this.models.App.findOne({
            where: { extId },
        });

        // If credential not found, return error
        if (!ac) {
            throw new APIError("ERR_17");
        }

        // Update name
        ac.name = name;
        ac.updatedAt = new Date();
        await ac.save();
    }
}

module.exports = AppService;
