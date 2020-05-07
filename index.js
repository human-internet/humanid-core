'use strict'

const
    logger = require('./logger'),
    common = require('./helpers/common'),
    nexmo = require('./helpers/nexmo'),
    models = require('./models/index'),    
    middlewares = require('./middlewares'),
    Server = require('./server')

const port = process.env.PORT || common.config.APP_PORT
const app = new Server(models, common, middlewares, nexmo, { logger }).app

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
                app.listen(port, () => logger.info(`Listening on port ${port}..`))
            })    
    } else {
        app.listen(port, () =>
            logger.info(`Listening on port ${port}..`),
        )
    }
} else {
    module.exports = app
}
