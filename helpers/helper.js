const fs = require('fs'),
path = require('path'),
    crypto = require('crypto'),
    configPath = './config.json'

// load config
let config = {}
if (fs.existsSync(configPath)) {
    config = require(path.join('..', configPath))
} else {
    console.warn(`${configPath} not found`)
}


// hash data using secret
const hmac = (data) => {
    secret = config.APP_SECRET || 'ThisIsADefaultSecretPhrase'
    return crypto.createHmac('sha256', secret).update(data).digest('hex')
}

// validate body
const validate = (rules, body) => {
    for (let r in rules) {
        if (rules[r] === 'required' && !body[r]) {
            return {error: `${r} is required`}
        }
    }
    return null
}

module.exports = {
    config: config,
    hmac: hmac,
    validate: validate,
}