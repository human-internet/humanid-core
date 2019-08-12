'use strict'

const helpers = require('../helpers/common'),
    models = require('../models/index'),
    validate = helpers.validate,
    hmac = helpers.hmac,    
	app = require('express').Router()
	
// TODO: API to send push notification for web SDK login
// TODO: API to receive confirmation from mobile SDK for web login
