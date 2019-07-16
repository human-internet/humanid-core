const fs = require('fs'),
    crypto = require('crypto'),
    jwt = require('jsonwebtoken'),
    request = require('request'),
    env = process.env.NODE_ENV || 'development',
    configPath = './config.json'

// load config
let config = {}
if (fs.existsSync(configPath)) {
    config = require(configPath)
} else {
    console.warn(`${configPath} not found`)
}

// override config
if (env === 'test') {
  config.AUTHY_API_KEY = ''
} else {
  // override if available in env
  config.AUTHY_API_KEY = process.env.AUTHY_API_KEY || config.AUTHY_API_KEY
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

// trigger phone verification sms
const requestPhoneVerification = async (countryCode, phone) => {
  if (!config.AUTHY_API_URL || !config.AUTHY_API_KEY) {
    // mock up for demo
    return Promise.resolve()
  } else {
    let options = {
        method: 'post',
        url: `${config.AUTHY_API_URL}/protected/json/phones/verification/start`,
        headers: {'X-Authy-API-Key': config.AUTHY_API_KEY},
        qs: {via: 'sms', country_code: countryCode, phone_number: phone},
        json: true,
    }
    return new Promise((resolve, reject) => {
      request(options, (error, res, body) => {
          if (error) {
            reject(error)
          } else {
            console.log(body)
            if (body.success === true) {
              resolve(body)
            } else {
              reject(body)
            }            
          }
      })  
    })
  }
}

// check verification code
const checkVerificationCode = async (countryCode, phone, verificationCode) => {
  if (!config.AUTHY_API_URL || !config.AUTHY_API_KEY) {
    // mock up for demo
    return Promise.resolve(true)
  } else {
    let options = {
        method: 'get',
        url: `${config.AUTHY_API_URL}/protected/json/phones/verification/check`,
        headers: {'X-Authy-API-Key': config.AUTHY_API_KEY},
        qs: {via: 'sms', country_code: countryCode, phone_number: phone, verification_code: verificationCode},
        json: true,
    }
    return new Promise((resolve, reject) => {
      request(options, (error, res, body) => {
          if (error) {
              reject(error)
          } else {
            if (body.success === true) {
              console.log(body)
              resolve(true)
            } else {
              console.error(body)
              resolve(false)
            }  
          }
      })  
    })
  }
}


module.exports = {
    config: config,
    hmac: hmac,
    validate: validate,
    createJWT: createJWT,
    verifyJWT: verifyJWT,
    requestPhoneVerification: requestPhoneVerification,
    checkVerificationCode: checkVerificationCode,
}