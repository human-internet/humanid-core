"use strict";

const logger = require("../logger").child({ scope: "Core.Sequelize" }),
    Sequelize = require("sequelize"),
    helpers = require("../components/common"),
    config = helpers.config,
    db = {};

// Import models
const App = require("./app"),
    AppCredential = require("./app-credential"),
    AppUser = require("./app-user"),
    AppUserSession = require("./app-user-session"),
    OrgDevUser = require("./org-dev-user"),
    SMSTransaction = require("./sms-transaction"),
    SMSTransactionLog = require("./sms-transaction-log"),
    User = require("./user"),
    UserEventLog = require("./user-event-log"),
    UserExchangeSession = require("./user-exchange-session"),
    UserOTP = require("./user-otp"),
    UserOTPSandbox = require("./user-otp-sandbox"),
    UserOTPSession = require("./user-otp-session"),
    UserRecoverySession = require("./user-recovery-session"),
    UserRecoveryOTP = require("./user-recovery-otp");

// Configure logging function
let enableLog = process.env.ENABLE_SEQUELIZE_LOG;
let logSequelize;
if (enableLog && enableLog === "true") {
    logSequelize = (msg) => {
        logger.debug(msg);
    };
}

const sequelize = new Sequelize(config.DB_NAME, config.DB_USER, config.DB_PASS, {
    dialect: config.DB_DRIVER,
    host: config.DB_HOST,
    port: config.DB_PORT,
    logging: logSequelize,
});

// Register models
db.App = App(sequelize);
db.AppCredential = AppCredential(sequelize);
db.AppUser = AppUser(sequelize);
db.AppUserSession = AppUserSession(sequelize);
db.OrgDevUser = OrgDevUser(sequelize);
db.SMSTransaction = SMSTransaction(sequelize);
db.SMSTransactionLog = SMSTransactionLog(sequelize);
db.User = User(sequelize);
db.UserEventLog = UserEventLog(sequelize);
db.UserExchangeSession = UserExchangeSession(sequelize);
db.UserOTP = UserOTP(sequelize);
db.UserOTPSandbox = UserOTPSandbox(sequelize);
db.UserOTPSession = UserOTPSession(sequelize);
db.UserRecoverySession = UserRecoverySession(sequelize);
db.UserRecoveryOTP = UserRecoveryOTP(sequelize);

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
