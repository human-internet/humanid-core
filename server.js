'use strict'

const express = require('express'),
	bodyParser = require('body-parser'),	
	WebConsoleController = require('./controllers/webconsole'),
	MobileController = require('./controllers/mobile'),
	WebController = require('./controllers/web')

class Server {
	constructor(models, common, middlewares, nexmo) {
		models = models

		this.app = express()
		this.app.use(bodyParser.json())
		this.app.use(bodyParser.urlencoded({ extended: true }))
		
		// routes
		this.app.use('/', express.static('doc'))
		this.app.use('/lib', express.static('client/dist'))
		this.app.use('/examples', express.static('examples'))
		this.app.use('/console', new WebConsoleController(models, common, middlewares).router)
		this.app.use('/mobile',  new MobileController(models, common, middlewares, nexmo).router)
		this.app.use('/web', new WebController(models, common, nexmo).router)
		
		// global error handler
		this.app.use(function (err, req, res, next) {
			console.error(err)
			if (err.name === 'SequelizeValidationError' || err.name === 'ValidationError') {
				return res.status(400).send(err.message)
			} else {
				return res.status(500).send(err.message)
			}    
		})
		
		// 404 handler
		this.app.use(function(req, res){
			res.status(404).send({ error: 'Unknown method' })
		})
		
	}
}

module.exports = Server