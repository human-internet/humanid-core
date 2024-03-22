const logger = require("./logger"),
    common = require("./components/common"),
    models = require("./models"),
    Server = require("./server"),
    services = require("./services"),
    components = require("./components"),
    manifest = require("./manifest");

const Sentry = require("@sentry/node");
const ProfilingNode = require("@sentry/profiling-node");
//nodeProfilingIntegration
const port = common.config.PORT;
const app = new Server({
    config: common.config,
    components,
    models,
    services,
    logger,
}).app;

// initialize Sentry
Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({tracing: true}),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({app}),
        ProfilingNode.nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());
// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
});


app.listen(port, () => {
    logger.info(`App: ${manifest.appName}`);
    logger.info(`Version: ${manifest.appVersion}, BuildSignature: ${manifest.buildSignature}`);
    logger.info(`Listening on port ${port}...`);
    logger.info(`Base URL: ${common.config.BASE_URL}`);
    logger.info(`Press CTRL+C to exit`);

    if (common.config.DEMO_MODE) {
        logger.info("Running on Demo mode");
    }
});
