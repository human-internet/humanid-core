'use strict'

const
    Common = require('./common'),
    ResponseMapper = require('./response-mapper'),
    Nexmo = require('./nexmo')

function init({config}) {
    // Init response mapper singleton
    ResponseMapper.init({filePath: config.server.workDir + '/response-codes.json'})

    // Return components
    return {
        common: Common,
        nexmo: Nexmo,
        response: ResponseMapper
    }
}

module.exports = {init}

