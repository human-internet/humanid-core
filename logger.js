'use strict'

const winston = require('winston');

// Retrieve logger configuration from env
const logLevel = process.env['LOG_LEVEL'] || 'info'

// Create logger singleton module
module.exports = winston.createLogger({
    level: logLevel,
    format: winston.format.json(),
    transports: [
        new winston.transports.Console({})
    ]
})

