'use strict'

class APIError extends Error {
    /**
     * Creates APIError
     *
     * @param code {string} Error code
     * @param message {string} Error message
     * @param source {Error|null} Error Cause
     */
    constructor(code, message = 'APIError', source = null) {
        super(message);
        this.name = 'APIError'
        this.code = code
        this.message = message
        this.source = source
    }
}

module.exports = APIError