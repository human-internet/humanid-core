const logger = require("./logger"),
    common = require("./components/common"),
    models = require("./models/index"),
    Server = require("./server"),
    services = require("./services/index"),
    components = require("./components/index"),
    manifest = require("./manifest");

const port = common.config.PORT;
const app = new Server({
    config: common.config,
    components,
    models,
    services,
    logger,
}).app;

app.listen(port, () => {
    logger.info(`App: ${manifest.appName} ${manifest.appVersion}. BuildSignature: ${manifest.buildSignature}`);
    logger.info(`Listening on port ${port}...`);
    logger.info(`Base URL: ${common.config.BASE_URL}`);
    logger.info(`Press CTRL+C to exit`);

    if (common.config.DEMO_MODE) {
        logger.info("Running on Demo mode");
    }
});
