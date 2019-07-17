'use strict'

const express = require('express'),
    bodyParser = require('body-parser'),
    helpers = require('./helpers'),
    models = require('./models/index'),
    config = helpers.config

const port = config.APP_PORT || process.env.PORT || 3000
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// routes
app.use('/', express.static('doc'))
app.use('/console', require('./routes/webconsole'))
app.use('/mobile', require('./routes/mobile'))

// global error handler
app.use(function (err, req, res, next) {
    // console.error(err)
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).send(err.message)
    } else {
        return res.status(500).send(err.message)
    }    
})

if (require.main === module) {
    if (process.env.DROP_CREATE === '1') {
        // heroku drop-create
        models.sequelize.drop()
            .then(() => {
                return models.sequelize.query('DROP TABLE IF EXISTS `SequelizeMeta`')
            })
            .then(models.migrate)
            .then(models.seed)
            .then(() => {
                app.listen(port, () => console.log(`Listening on port ${port}..`))            
            })    
    } else {
        app.listen(port, () =>
            console.log(`Listening on port ${port}..`),
        )
    }
} else {
    module.exports = app
}
