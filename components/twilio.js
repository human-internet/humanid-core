'use strict'

const request = require('request'),
    config = require('./common').config

const requestPhoneVerification = async (countryCode, phone) => {
    if (config.AUTHY_API_URL && config.AUTHY_API_KEY) {
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
    } else {
        // mock up for demo
        return Promise.resolve()
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
                        reject({message: 'Invalid verification code'})
                    }  
                }
            })  
        })
    }
}

module.exports = {
    requestPhoneVerification: requestPhoneVerification,
    checkVerificationCode: checkVerificationCode,
}