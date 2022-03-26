"use strict";

const APIError = require("../server/api_error"),
    Constants = require("../constants"),
    path = require("path"),
    crypto = require("crypto"),
    jwt = require("jsonwebtoken"),
    LibPhoneNo = require("libphonenumber-js");

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

// Server.DemoMode

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

// parsePhoneNo parse phone number to E.164 format
const parsePhoneNo = (countryCode, phoneNo) => {
    // Clean input
    const input = "+" + countryCode + (phoneNo[0] === "0" ? phoneNo.substring(1) : phoneNo);

    // Clean phoneNo number with libphonenumber
    const result = LibPhoneNo.parsePhoneNumberFromString(input);

    // If failed to parse phoneNo number, then throw error
    if (!result) {
        throw new APIError("ERR_10");
    }

    // Check for country
    if (!result.country) {
        throw new APIError("ERR_10");
    }

    return result;
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
    parsePhoneNo: parsePhoneNo,
};
