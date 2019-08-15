'use strict'

const fs = require('fs'),
	path = require('path'),
	crypto = require('crypto'),
	jwt = require('jsonwebtoken'),
	firebase = require('firebase-admin'),
	configPath = 'config.json'

// load config
let config = {DATABASE: {}}
if (fs.existsSync(path.join('.', configPath))) {
	config = require('../' + configPath)
} else {
	console.warn(`${configPath} not found`)
}

// override config
config.APP_SECRET = process.env.APP_SECRET || config.APP_SECRET || 'ThisIsADefaultSecretPhrase'

config.AUTHY_API_URL = process.env.AUTHY_API_URL || 'https://api.authy.com'
config.NEXMO_API_URL = process.env.NEXMO_API_URL || 'https://api.nexmo.com'
config.NEXMO_REST_URL = process.env.NEXMO_REST_URL || 'https://rest.nexmo.com'
config.AUTHY_API_KEY = process.env.AUTHY_API_KEY || config.AUTHY_API_KEY
config.NEXMO_API_KEY = process.env.NEXMO_API_KEY || config.NEXMO_API_KEY
config.NEXMO_API_SECRET = process.env.NEXMO_API_SECRET || config.NEXMO_API_SECRET

config.FIREBASE_DB_URL = process.env.FIREBASE_DB_URL || config.FIREBASE_DB_URL
config.FIREBASE_ACCOUNT_KEY = config.FIREBASE_ACCOUNT_KEY || {}
config.FIREBASE_ACCOUNT_KEY.type = process.env.FIREBASE_ACCOUNT_KEY_type || config.FIREBASE_ACCOUNT_KEY.type
config.FIREBASE_ACCOUNT_KEY.project_id = process.env.FIREBASE_ACCOUNT_KEY_project_id || config.FIREBASE_ACCOUNT_KEY.project_id
config.FIREBASE_ACCOUNT_KEY.private_key_id = process.env.FIREBASE_ACCOUNT_KEY_private_key_id || config.FIREBASE_ACCOUNT_KEY.private_key_id
config.FIREBASE_ACCOUNT_KEY.private_key = process.env.FIREBASE_ACCOUNT_KEY_private_key || config.FIREBASE_ACCOUNT_KEY.private_key
config.FIREBASE_ACCOUNT_KEY.client_email = process.env.FIREBASE_ACCOUNT_KEY_client_email || config.FIREBASE_ACCOUNT_KEY.client_email
config.FIREBASE_ACCOUNT_KEY.client_id = process.env.FIREBASE_ACCOUNT_KEY_client_id || config.FIREBASE_ACCOUNT_KEY.client_id
config.FIREBASE_ACCOUNT_KEY.auth_uri = process.env.FIREBASE_ACCOUNT_KEY_auth_uri || config.FIREBASE_ACCOUNT_KEY.auth_uri
config.FIREBASE_ACCOUNT_KEY.token_uri = process.env.FIREBASE_ACCOUNT_KEY_token_uri || config.FIREBASE_ACCOUNT_KEY.token_uri
config.FIREBASE_ACCOUNT_KEY.auth_provider_x509_cert_url = process.env.FIREBASE_ACCOUNT_KEY_auth_provider_x509_cert_url || config.FIREBASE_ACCOUNT_KEY.auth_provider_x509_cert_url
config.FIREBASE_ACCOUNT_KEY.client_x509_cert_url = process.env.FIREBASE_ACCOUNT_KEY_client_x509_cert_url || config.FIREBASE_ACCOUNT_KEY.client_x509_cert_url

// firebase
if (config.FIREBASE_ACCOUNT_KEY && config.FIREBASE_DB_URL) {
	firebase.initializeApp({
		credential: firebase.credential.cert(config.FIREBASE_ACCOUNT_KEY),
		databaseURL: config.FIREBASE_DB_URL,
	})
} else {
	console.warn(`FIREBASE_ACCOUNT_KEY and/or FIREBASE_DB_URL are not configured`)
}

const SECRET = config.APP_SECRET

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
	firebase: firebase,
}