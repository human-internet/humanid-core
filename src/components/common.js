"use strict";

const APIError = require("../server/api_error"),
    Constants = require("../constants"),
    path = require("path"),
    crypto = require("crypto"),
    jwt = require("jsonwebtoken"),
    logger = require("../logger"),
    LibPhoneNo = require("libphonenumber-js/max"),
    nanoId = require("nanoid");
require("dotenv").config();
// load config
let config = {};

// Server
config.WORK_DIR = process.env.WORK_DIR || process.cwd();
config.PORT = process.env.PORT || 3000;
config.DEBUG = process.env.DEBUG === "true";
config.DEMO_MODE = process.env.DEMO_MODE === "true";
config.BASE_PATH = process.env.BASE_PATH || "";
config.BASE_URL = process.env.BASE_URL || `http://localhost:${config.PORT}${config.BASE_PATH}`;

config.DB_DRIVER = process.env.DB_DRIVER || "mysql";
config.DB_HOST = process.env.DB_HOST || "localhost";
config.DB_PORT = process.env.DB_PORT || 3306;
config.DB_USER = process.env.DB_USER || "root";
config.DB_PASS = process.env.DB_PASS || "root";
config.DB_NAME = process.env.DB_NAME || "l-humanid-core";
config.DB_ENABLE_LOGGING = process.env.DB_ENABLE_LOGGING === "true";

config.ASSETS_URL = process.env.ASSETS_URL || config.BASE_URL + "/public";
config.ASSETS_DIR = process.env.ASSETS_DIR || path.join(config.WORK_DIR, "/public");
config.HMAC_SECRET = process.env.HMAC_SECRET || "ThisIsADefaultSecretPhrase";

// Server.UserHash
config.HASH_ID_SALT_1 = process.env.HASH_ID_SALT_1;
config.HASH_ID_SALT_2 = process.env.HASH_ID_SALT_2;
config.HASH_ID_REPEAT = process.env.HASH_ID_REPEAT || 4;
config.HASH_ID_SECRET = process.env.HASH_ID_SECRET;

// Client.ExchangeToken
config.EXCHANGE_TOKEN_AES_KEY = process.env.EXCHANGE_TOKEN_AES_KEY;
config.EXCHANGE_TOKEN_LIFETIME = parseInt(process.env.EXCHANGE_TOKEN_LIFETIME) || 300;

// Client.DevConsole
config.DEV_CONSOLE_CLIENT_API_KEY = process.env.DEV_CONSOLE_CLIENT_API_KEY;

// Client.WebLogin
config.WEB_LOGIN_URL = process.env.WEB_LOGIN_URL || "https://web-login.human-id.org/login";
config.WEB_LOGIN_SESSION_SALT = process.env.WEB_LOGIN_SESSION_SALT;
config.WEB_LOGIN_SESSION_SALT = process.env.WEB_LOGIN_SESSION_SALT;
config.WEB_LOGIN_SESSION_SECRET = process.env.WEB_LOGIN_SESSION_SECRET;
config.WEB_LOGIN_SESSION_LIFETIME = process.env.WEB_LOGIN_SESSION_LIFETIME || 300;

// Components.Nexmo
config.NEXMO_API_URL = "https://api.nexmo.com";
config.NEXMO_API_KEY = process.env.NEXMO_API_KEY;
config.NEXMO_API_SECRET = process.env.NEXMO_API_SECRET;
config.NEXMO_SENDER_ID_DEFAULT = process.env.NEXMO_SENDER_ID_DEFAULT || "humanID";
config.NEXMO_SENDER_ID_US = process.env.NEXMO_SENDER_ID_US;
config.NEXMO_SENDER_ID_VN = process.env.NEXMO_SENDER_ID_VN;

// Components.AWS
config.AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
config.AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
config.AWS_SMS_REGION = process.env.AWS_SMS_REGION || "us-west-2";

// Adapters.S3
config.S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
config.S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;
config.S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
config.S3_REGION = process.env.S3_REGION;
config.S3_CDN_BASE_URL = process.env.S3_CDN_BASE_URL || "https://s3.human-id.org";
config.S3_DIR_PREFIX = process.env.S3_DIR_PREFIX || "local";

// Adapters.SMTP
config.SMTP_HOST = process.env.SMTP_HOST;
config.SMTP_PORT = process.env.SMTP_PORT;
config.SMTP_SECURE = (process.env.SMTP_SECURE || "true") === "true";
config.SMTP_AUTH_USER = process.env.SMTP_AUTH_USER;
config.SMTP_AUTH_PASS = process.env.SMTP_AUTH_PASS;
config.SMTP_DEFAULT_FROM_NAME = process.env.SMTP_DEFAULT_FROM_NAME || "humanID";
config.SMTP_DEFAULT_FROM_EMAIL = process.env.SMTP_DEFAULT_FROM_EMAIL || "no-reply@human-id.org";

// Recovery
config.RECOVERY_SESSION_LIFETIME = parseInt(process.env.RECOVERY_SESSION_LIFETIME || "300");

// Sandbox
config.ORG_DEV_USER_LIMIT = parseInt(process.env.ORG_DEV_USER_LIMIT || "2");

// Stripe
config.STRIPE_PRIVATE_KEY = process.env.STRIPE_PRIVATE_KEY;
config.STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Balance
config.FIXED_PRICE_AWS_SNS = +(process.env.FIXED_PRICE_AWS_SNS || 0.014);
config.LOW_BALANCE_ALERT_THRESHOLD = +(process.env.LOW_BALANCE_ALERT_THRESHOLD || 2.5);
config.LOW_BALANCE_ALERT_API = process.env.LOW_BALANCE_ALERT_API;
config.BALANCE_MIN_TO_STOP_SEND_SMS = +process.env.BALANCE_MIN_TO_STOP_SEND_SMS || 0;
config.BALANCE_MIN_STOP_SEND_SMS = process.env.BALANCE_MIN_STOP_SEND_SMS === "true" ? true : false;
config.JWT_ISSUER = process.env.ISSUER;
config.JWT_SECRET_KEY = process.env.SECRET_KEY;

// hash data using secret
const hmac = (data, secret) => {
    secret = secret || config.HMAC_SECRET;
    return crypto.createHmac("sha256", secret).update(data).digest("hex");
};

// sleep
const sleep = require("util").promisify(setTimeout);

// validate body
const validate = (rules, body) => {
    for (let r in rules) {
        // If field is a custom or inherited property, continue
        if (!rules.hasOwnProperty(r)) {
            continue;
        }
        // Validate
        if (rules[r] === "required" && !body[r]) {
            return { error: `${r} is required` };
        }
    }
    return null;
};

// verify JWT
const verifyJWT = (token, secret) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secret, {}, (err, decodedToken) => {
            if (err || !decodedToken) {
                return reject(err);
            }
            resolve(decodedToken);
        });
    });
};

// generate random string
const randStr = (length, type) => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    if (type === 1) {
        characters = "0123456789";
    } else if (type === 2) {
        characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    }
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

// combine country code and phone number
const combinePhone = (countryCode, phone) => {
    phone = phone[0] === "0" ? phone.substring(1) : phone;
    return countryCode + phone;
};

const getEpoch = (t) => {
    return Math.round(t.getTime() / 1000);
};

/**
 * Validate body against rules
 * @param {Object.<string, string>} rules
 * @param {*} body Request Body
 */
const validateReq = (rules, body) => {
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
};

/**
 * parsePhone parse phone number to E.164 format
 *
 * @param phoneStr Phone number input, without country code
 * @param {object?} options Optional input
 * @param {string?} options.countryCode For parsing old phone input format. Prefix of country in phone number
 * @param {string[]?} options.limitCountry List of unsupported country. Defined in ISO Alpha-2 Country code list
 * @return {PhoneNumber}
 */
const parsePhone = (phoneStr, options = {}) => {
    // Init options
    if (!options) {
        options = {};
    }

    // Parse old format
    if (options.countryCode) {
        // Combine format to e.164
        phoneStr = "+" + options.countryCode + (phoneStr[0] === "0" ? phoneStr.substring(1) : phoneStr);
    }

    // Parse phone
    let phone;
    try {
        phone = LibPhoneNo.parsePhoneNumber(phoneStr);
    } catch (err) {
        logger.error(`Failed to parse phone number input. Error = ${phone}, Input = ${phoneStr}`);
        throw new APIError("ERR_10");
    }

    // Check if it's valid
    if (!phone.isValid()) {
        logger.error(`Invalid phone number input. Input = ${phoneStr}`);
        throw new APIError("ERR_10");
    }

    // Check for country
    if (!phone.country) {
        logger.error(`Country not found in phone number input. Error = ${phone}, Input = ${phoneStr}`);
        throw new APIError("ERR_10");
    }

    // Check if phone number is unsupported
    if (options.limitCountry && options.limitCountry.length > 0) {
        for (const c of options.limitCountry) {
            if (phone.country === c) {
                logger.warn(`Phone is from unsupported country: ${phone.country}`);
                throw new APIError("ERR_40");
            }
        }
    }

    return phone;
};

module.exports = {
    config: config,
    sleep: sleep,
    hmac: hmac,
    validate: validate,
    verifyJWT: verifyJWT,
    randStr: randStr,
    combinePhone: combinePhone,
    getEpoch,
    validateReq,
    parsePhone: parsePhone,
    newRequestId: nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 24),
};
