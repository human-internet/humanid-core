const nodemailer = require("nodemailer"),
    logger = require("../logger"),
    { config } = require("../components/common"),
    { EventEmitter } = require("events");

const SEND_MAIL_EVENT = "sendMail";

class Mailer {
    constructor() {
        // Logger
        this.logger = logger.child({ scope: "Adapters.Mailer" });

        // Get port
        let port;
        try {
            port = parseInt(config.SMTP_PORT);
        } catch (err) {
            port = 567;
        }

        // Init sender
        this.sender = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port,
            secure: config.SMTP_SECURE,
            auth: {
                user: config.SMTP_AUTH_USER,
                pass: config.SMTP_AUTH_PASS,
            },
            defaultFrom: {
                name: config.SMTP_DEFAULT_FROM_NAME,
                address: config.SMTP_DEFAULT_FROM_EMAIL,
            },
        });

        // Init event emitter
        this.emitter = new EventEmitter();
        this.emitter.on(SEND_MAIL_EVENT, this.handleSendEvent);
    }

    send(options) {
        this.emitter.emit(SEND_MAIL_EVENT, options);
        this.logger.debug(`Event emitted: ${SEND_MAIL_EVENT}`);
    }

    handleSendEvent = async (options) => {
        options.from = `"${config.SMTP_DEFAULT_FROM_NAME}" <${config.SMTP_DEFAULT_FROM_EMAIL}>`;
        this.logger.debug(`Event received: ${SEND_MAIL_EVENT}`);
        const result = await this.sender.sendMail(options);
        this.logger.debug(result);
    };
}

module.exports = new Mailer();
