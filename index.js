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
app.use('/', require('./routes/webconsole'))
app.use('/', require('./routes/mobile'))

// global error handler
app.use(function (err, req, res, next) {
    console.error(err)
    return res.status(500).send(err.message)
})

if (require.main === module) {
    if (process.env.JAWSDB_URL) {
        // heroku
        models.migrate().then(() => {
            app.listen(port, () =>
                console.log(`Listening on port ${port}..`),
            )            
        })    
    } else {
        app.listen(port, () =>
            console.log(`Listening on port ${port}..`),
        )
    }
} else {
    module.exports = app
}
