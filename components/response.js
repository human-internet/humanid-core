'use strict'

/**
 * @typedef {object} ResponseBody
 * @property {boolean} success Determine response is Success or Error
 * @property {string} code Response message code
 * @property {string} message Response message
 * @property {*} data Response data
 */

// Import Dependencies
const
    _ = require('lodash'),
    fs = require('fs')

// Init codes constants
const SUCCESS = 'OK'
const ERROR_BAD_REQUEST = '400'
const ERROR_UNAUTHORIZED = '401'
const ERROR_FORBIDDEN = '403'
const ERROR_NOT_FOUND = '404'
const ERROR_INTERNAL = '500'

/**
 * ResponseComponent class
 */
class ResponseComponent {
    /** @member {Object.<string, Response>} */
    _responseCodes = {}

    /**
     * @member {Object.<string, string>}
     * @static
     */
    static STD_CODES = {
        SUCCESS, ERROR_BAD_REQUEST, ERROR_UNAUTHORIZED, ERROR_FORBIDDEN, ERROR_NOT_FOUND, ERROR_INTERNAL
    }

    constructor({filePath}) {
        // Init standard codes
        const stdCodes = initStandardCodes()

        // Validate path
        const fileExist = fs.existsSync(filePath)

        // If file exist, load response codes
        if (fileExist) {
            // Load response codes from file
            const userCodesJson = require(filePath)
            const userCodes = convertCodes(userCodesJson)

            // Merge with standard response and set to private member
            this._responseCodes = _.merge(userCodes, stdCodes)
        } else {
            // Else, load only standard codes
            this._responseCodes = stdCodes
        }
    }

    /**
     * Get Response by code
     * @param {string} code Response code
     * @param {Object} opt Options
     * @param {boolean} opt.success If true, return Standard Success. Else, return Internal Error
     * @returns {Response} Response object
     */
    get = (code, opt= {success: false}) => {
        // Get response by code
        let resp = this._responseCodes[code]

        // If response code is not found, return default response
        if (!resp) {
            if (opt.success) {
                code = SUCCESS
                resp = this._responseCodes[SUCCESS]
            } else {
                code = ERROR_INTERNAL
                resp = this._responseCodes[ERROR_INTERNAL]
            }
        }

        // Set code
        resp.code = code

        return resp
    }

    getSuccess = () => {
        return this._responseCodes[SUCCESS]
    }

    getInternalError = () => {
        return this._responseCodes[ERROR_INTERNAL]
    }
}

/**
 * Response class
 */
class Response {
    /**
     * Create a response
     *
     * @param {number} status Response Status
     * @param {boolean} success Determine response is Success or Error
     * @param {string} code Response message code
     * @param {string} message Response message
     */
    constructor(code, status, success, message) {
        /**@member {boolean} */
        this.success = success

        /**@member {string} */
        this.code = code

        /**@member {string} */
        this.message = message

        /**@member {number} */
        this.status = status
    }

    /**
     * Compose response body and returns ResponseBody object
     *
     * @param opt {object} Compose option
     * @param opt.data {object|undefined} Data to compose
     * @param opt.message {string|undefined} Message to override
     * @returns {ResponseBody}
     */
    compose = (opt= {}) => {
        return {
            success: this.success,
            code: this.code,
            message: opt.message || this.message,
            data: opt.data || undefined
        }
    }
}

/**
 * Initiate standard Response mapping
 *
 * @returns {Object.<string, Response>}
 */
function initStandardCodes() {
    const respCodes = {}
    respCodes[SUCCESS] = new Response(SUCCESS, 200, true, 'Success')
    respCodes[ERROR_BAD_REQUEST] = new Response(ERROR_BAD_REQUEST, 400, false, 'Bad Request')
    respCodes[ERROR_UNAUTHORIZED] = new Response(ERROR_UNAUTHORIZED, 401, false, "Unauthorized")
    respCodes[ERROR_FORBIDDEN] = new Response(ERROR_FORBIDDEN, 403, false, "Forbidden")
    respCodes[ERROR_NOT_FOUND] = new Response(ERROR_NOT_FOUND, 404, false, "Not Found")
    respCodes[ERROR_INTERNAL] = new Response(ERROR_INTERNAL, 500, false, "Internal Error")
    return respCodes
}

/**
 * Convert user defined codes into Response mapping
 * If status is not set, then response is set to success
 *
 * @param codes {Object.<string, {status: boolean, success: true, message: string}>}
 * @returns {Object.<string, Response>}
 */
function convertCodes(codes) {
    // Convert user codes to response
    return _.reduce(codes, (o, v, k) => {
        let {status, success, message} = v

        // If status not set, then set to success
        if (!status) {
            status = 200
            success = true
        }

        // If message is not defined, set to code
        if (!message) {
            message = k
        }

        // Create new response
        o[k] = new Response(k, status, success, message)
        return o
    })
}

module.exports = ResponseComponent

