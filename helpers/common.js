'use strict'

const fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	env = process.env.NODE_ENV || 'development',
	configPath = 'config.json'

// load config
let config = {}
if (fs.existsSync(path.join('.', configPath))) {
	config = require('../' + configPath)
} else {
	console.warn(`${configPath} not found`)
}

// override config
config.AUTHY_API_URL = process.env.AUTHY_API_KEY || 'https://api.authy.com'
config.NEXMO_API_URL = process.env.NEXMO_API_URL || 'https://api.nexmo.com'
config.NEXMO_REST_URL = process.env.NEXMO_REST_URL || 'https://rest.nexmo.com'
if (env === 'test') {	
	config.AUTHY_API_KEY = process.env.AUTHY_API_KEY || ''
	config.NEXMO_API_KEY = process.env.NEXMO_API_KEY || ''
	config.NEXMO_API_SECRET = process.env.NEXMO_API_SECRET || ''
} else {	
	config.AUTHY_API_KEY = process.env.AUTHY_API_KEY || config.AUTHY_API_KEY
	config.NEXMO_API_KEY = process.env.NEXMO_API_KEY || config.NEXMO_API_KEY
	config.NEXMO_API_SECRET = process.env.NEXMO_API_SECRET || config.NEXMO_API_SECRET
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

// generate random string
const randStr = (length, type) => {
	let result = ''	
	let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
	if (type === 1) {
		characters = '0123456789'
	} else if (type === 2) {
		characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	}
	let charactersLength = characters.length
	for (let i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength))
	}
	return result
}

// combine country code and phone number
const combinePhone = (countryCode, phone) => {
	phone = phone[0] === '0' ? phone.substring(1) : phone
	return countryCode + phone
}

module.exports = {
	config: config,
	hmac: hmac,
	validate: validate,
	createJWT: createJWT,
	verifyJWT: verifyJWT,
	randStr: randStr,
	combinePhone: combinePhone,
}