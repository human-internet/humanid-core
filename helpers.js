const fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    configPath = './config.json'

// load config
let config = {}
if (fs.existsSync(configPath)) {
    config = require(configPath)
} else {
    console.warn(`${configPath} not found`)
}

const SECRET = config.APP_SECRET || 'ThisIsADefaultSecretPhrase'

// hash data using secret
const hmac = (data) => {
    return crypto.createHmac('sha256', SECRET).update(data).digest('hex')
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

// create (sign) JWT
const createJWT = (user) => {
  return jwt.sign({id: user.id}, SECRET)
}

// verify JWT
const verifyJWT = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decodedToken) => {
      if (err || !decodedToken) {
        return reject(err)
      }
      resolve(decodedToken)
    })
  })
}

module.exports = {
    config: config,
    hmac: hmac,
    validate: validate,
    createJWT: createJWT,
    verifyJWT: verifyJWT,
}