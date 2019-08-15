'use strict'

const common = require('./helpers/common'),
    nexmo = require('./helpers/nexmo'),
    models = require('./models/index'),    
    middlewares = require('./middlewares'),
    Server = require('./server')

const port = common.config.APP_PORT || process.env.PORT || 3000
const app = new Server(models, common, middlewares, nexmo).app

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
