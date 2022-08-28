const BaseService = require("./base"),
    argon2 = require("argon2"),
    dateUtil = require("../components/date_util"),
    mailer = require("../adapters/mailer"),
    { parsePhoneNumber } = require("libphonenumber-js"),
    APIError = require("../server/api_error"),
    Constants = require("../constants"),
    { config } = require("../components/common"),
    nanoId = require("nanoid");
const { Op } = require("sequelize");
const { App, AppUser, UserRecoveryOTP, UserRecoverySession, UserExchangeSession, User } = require("../models");

// Constants
const HOUR_SEC = 3600;
const MIN_SEC = 60;
const RECOVERY_OTP_RULE = {
    otpSessionLifetime: 300,
    otpCountLimit: 3,
    failAttemptLimit: 5,
    nextResendDelay: 60,
    otpCodeLength: 6,
};

class AccountService extends BaseService {
    constructor(services, args) {
        super("Account", services, args);
        this.newUserRecoverySessionRequestId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
        this.newRecoveryOTPCode = nanoId.customAlphabet("0123456789", RECOVERY_OTP_RULE.otpCodeLength);
    }

    /**
     * Get app user from exchange token
     *
     * @param exchangeToken
     * @return {Promise<{appUser: *, user: *, sessionId: string, appCredential: *}>}
     */
    getAppUser = async (exchangeToken) => {
        const { Auth: AuthService } = this.services;
        const { appUserId, sessionId, appCredential } = await AuthService.validateExchangeToken(exchangeToken);

        // Get app user id instance
        const appUser = await this.models.AppUser.findOne({
            where: { extId: appUserId },
            include: [
                {
                    model: this.models.App,
                    as: "app",
                    required: true,
                },
                {
                    model: this.models.User,
                    as: "user",
                    required: true,
                },
            ],
        });
        if (!appUser) {
            throw new Error(`unexpected AppUser not found. appUserId = ${appUserId}`);
        }

        return { appUser, user: appUser.user, sessionId, appCredential };
    };

    async setRecoveryEmail(payload) {
        // Get app user from exchange token
        const { appUser, user, sessionId, appCredential } = await this.getAppUser(payload.exchangeToken);

        // Check if recovery email has been set
        if (user.recoveryEmail) {
            throw new APIError("ERR_38");
        }

        // Create derived keys of email
        user.recoveryEmail = await argon2.hash(payload.recoveryEmail);
        user.updatedAt = new Date();
        await user.save();

        // Clear exchange token
        const { Auth: AuthService } = this.services;
        await AuthService.clearExchangeToken(sessionId, new Date());

        // Generate redirect url
        return this.getAppRedirectUrl(appCredential.id, appUser, payload.source);
    }

    /**
     * Create redirect url to client application
     *
     * @param {string} appCredentialId
     * @param appUser
     * @param {string} source
     * @return {Promise<{expiredAt: number, redirectUrl: string}>}
     */
    async getAppRedirectUrl(appCredentialId, appUser, source) {
        // Issue new exchange token
        const { Auth: AuthService, App: AppService } = this.services;
        const { token, expiredAt } = await AuthService.createExchangeToken(appUser, appCredentialId);

        // Compose redirect url
        const redirectUrl = AppService.getRedirectUrl(appUser.app, source);

        return {
            exchangeToken: token,
            redirectUrl: AppService.composeRedirectUrl(redirectUrl.success, token),
            expiredAt: dateUtil.toEpoch(expiredAt),
        };
    }

    async requestVerifyNewPhoneOtp(payload) {
        // Breakdown phone and country code
        const phone = parsePhoneNumber(payload.phone);
        if (!phone.isValid()) {
            throw new APIError("ERR_10");
        }

        // Validate client
        const { App: AppService } = this.services;
        const client = await AppService.validateWebLoginToken({
            token: payload.token,
            purpose: Constants.WEB_LOGIN_SESSION_PURPOSE_REQUEST_LOGIN_OTP,
            source: payload.source,
        });

        // Check if the phone has been associated to an account in the same app id
        const { User: UserService } = this.services;
        const otp = await UserService.requestLoginOTP(phone, {
            appId: client.appId,
            environmentId: client.environmentId,
            language: payload.lang,
        });

        // Create recovery session
        const session = AppService.createWebLoginSessionToken({
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            purpose: Constants.JWT_PURPOSE_RECOVERY_VERIFY_NEW_PHONE,
        });

        return {
            otp,
            session,
        };
    }

    getAccount(appId, userId) {
        return AppUser.findOne({
            where: { appId, userId },
            include: {
                as: "app",
                model: App,
                required: true,
            },
        });
    }

    createRecoverySession = async (client, userId) => {
        // Create User Recovery Session record
        const createdAt = new Date();
        const expiredAt = dateUtil.toEpoch(createdAt) + config.RECOVERY_SESSION_LIFETIME;
        const requestId = this.newUserRecoverySessionRequestId();

        // Define rule
        const { App: AppService } = this.services;
        await this.models.UserRecoverySession.create({
            userId: userId,
            appId: client.appId,
            requestId,
            rule: RECOVERY_OTP_RULE,
            otpCount: 0,
            failAttemptCount: 0,
            expiredAt: dateUtil.fromEpoch(expiredAt),
            appCredentialId: client.appCredentialId,
            createdAt,
            updatedAt: createdAt,
        });

        // Create a session
        const result = AppService.createWebLoginSessionToken({
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            sessionId: requestId,
            purpose: Constants.JWT_PURPOSE_RECOVERY_TRANSFER_ACCOUNT,
        });

        // Check new phone has Account
        const existingAccount = await this.getAccount(client.appId, userId);
        result.hasAccount = existingAccount != null;

        return result;
    };

    async verifyNewPhone(payload) {
        // Breakdown phone and country code
        const phone = parsePhoneNumber(payload.phone);
        if (!phone.isValid()) {
            throw new APIError("ERR_10");
        }

        // Validate session
        const { App: AppService } = this.services;
        const client = await AppService.validateWebLoginToken({
            token: payload.token,
            purpose: Constants.JWT_PURPOSE_RECOVERY_VERIFY_NEW_PHONE,
            source: payload.source,
        });

        // Get hash id
        const { User: UserService } = this.services;
        const hashId = UserService.getHashId(phone.number);

        // Verify code
        await UserService.verifyOtpCode(hashId, payload.otpCode);

        // Get user (create user if exists)
        const user = await UserService.getUser(hashId, phone.country);

        // Create User Recovery Session record
        return this.createRecoverySession(client, user.id);
    }

    async getRecoverySession(token, source) {
        // Validate session
        const { App: AppService } = this.services;
        const session = await AppService.validateWebLoginToken({
            token,
            purpose: Constants.JWT_PURPOSE_RECOVERY_TRANSFER_ACCOUNT,
            source,
        });

        // Get recovery session
        const recoverySession = await this.models.UserRecoverySession.findOne({
            where: { requestId: session.sessionId },
        });
        if (!recoverySession) {
            throw new APIError("ERR_11");
        }

        return { session, recoverySession };
    }

    async getExistingUser(appId, oldPhone, recoveryEmail) {
        const { User: UserService } = this.services;
        const oldUserHashId = UserService.getHashId(oldPhone.number);
        const appUser = await this.models.AppUser.findOne({
            where: {
                appId,
            },
            include: {
                model: this.models.User,
                as: "user",
                required: true,
                where: {
                    hashId: oldUserHashId,
                },
            },
        });
        if (!appUser || !appUser.user) {
            throw new APIError("ERR_33");
        }

        // Check if user has been set recovery
        const { user } = appUser;
        if (!user.recoveryEmail) {
            throw new APIError("ERR_34");
        }

        // Check if recovery email is correct
        try {
            await argon2.verify(user.recoveryEmail, recoveryEmail);
        } catch (err) {
            throw new APIError("ERR_35");
        }

        return { appUser, user: appUser.user };
    }

    async createRecoveryOTP(recoverySession, targetAppUser, timestamp) {
        // Get references
        const { dateUtil } = this.components;
        const { UserRecoverySession, UserRecoveryOTP } = this.models;

        // Generate OTP Code
        const code = this.newRecoveryOTPCode();

        // Create signature
        const signature = await argon2.hash(code);

        // Set otp count
        const otpCount = recoverySession.otpCount + 1;

        // Update session
        const nextResendAt = dateUtil.addSecond(timestamp, recoverySession.rule.nextResendDelay);

        // Persist
        const tx = await UserRecoveryOTP.sequelize.transaction();
        try {
            // Insert otp
            await UserRecoveryOTP.create(
                {
                    sessionId: recoverySession.id,
                    otpNo: otpCount,
                    signature: signature,
                    metadata: {},
                    createdAt: timestamp,
                },
                {
                    transaction: tx,
                }
            );

            // Update otp session
            const count = await UserRecoverySession.update(
                {
                    otpCount: otpCount,
                    nextResendAt: nextResendAt,
                    targetAppUserId: targetAppUser.id,
                    appId: targetAppUser.appId,
                    updatedAt: timestamp,
                    version: recoverySession.version + 1,
                },
                {
                    where: { id: recoverySession.id },
                    transaction: tx,
                }
            );

            if (count === 0) {
                throw new Error("failed to update otp session");
            }
            await tx.commit();
        } catch (error) {
            await tx.rollback();
            throw error;
        }

        return {
            otpCount: otpCount,
            failAttemptCount: recoverySession.failAttemptCount,
            code: code,
            requestId: recoverySession.requestId,
            nextResendAt: dateUtil.toEpoch(nextResendAt),
        };
    }

    composeRecoveryEmailSubject(otpCode) {
        return `[humanID] Recovery Email Verification Code: ${otpCode}`;
    }

    composeRecoveryEmailBody(otpCode, expiredIn) {
        return `Hi human,
        <br />
        <br />
        Please use this one-time verification code to gain access to your account:
        <br />
        <br />
        <b>${otpCode}</b>
        <br />
        <br />
        This code will expire in ${expiredIn}, at which time your email address will be deleted from our servers.
        <br />
        If you did not ask for account recovery, please ignore this email.
        <br />
        <br />
        <br />
        <br />
        The humanID Team
        <br />
        Learn more about the Foundation for a Human Internet at <a href="https://human-internet.org">human-internet.org</a>`;
    }

    getExpiresIn = (sec) => {
        // Init string
        let expiresIn = "";

        // Get hours
        if (sec > HOUR_SEC) {
            // Get hours
            const h = Math.floor(sec / HOUR_SEC);

            // Get elapsed second left
            sec = sec % HOUR_SEC;

            if (h > 1) {
                expiresIn = `${h} hours`;
            } else {
                expiresIn = `${h} hour`;
            }
        }

        // Get minutes
        if (sec > MIN_SEC) {
            // Get minutes
            const m = Math.floor(sec / MIN_SEC);

            // Get elapsed second left
            sec = sec % MIN_SEC;

            // Set elapsed minutes left
            if (m > 1) {
                expiresIn = `${expiresIn} ${m} minutes`;
            } else {
                expiresIn = `${expiresIn} ${m} minute`;
            }
        }

        // Get seconds
        if (sec > 1) {
            expiresIn = `${expiresIn} ${sec} seconds`;
        }

        return expiresIn;
    };

    async requestTransferAccountOtp(payload) {
        // Breakdown phone and country code
        const oldPhone = parsePhoneNumber(payload.oldPhone);
        if (!oldPhone.isValid()) {
            throw new APIError("ERR_10");
        }

        // Get session
        const { session, recoverySession } = await this.getRecoverySession(payload.token, payload.source);

        // Get app user
        const { appUser } = await this.getExistingUser(session.appId, oldPhone, payload.recoveryEmail);

        // Validate app user and existing user
        if (appUser.userId === recoverySession.userId) {
            throw new APIError("ERR_36");
        }

        // Create Email OTP
        const otp = await this.createRecoveryOTP(recoverySession, appUser, new Date());

        if (config.DEBUG) {
            this.logger.debug(`OTP Code = ${otp.code}`);
        }

        // Send OTP to email
        mailer.send({
            to: payload.recoveryEmail,
            subject: this.composeRecoveryEmailSubject(otp.code),
            html: this.composeRecoveryEmailBody(otp.code, this.getExpiresIn(recoverySession.rule.otpSessionLifetime)),
        });

        return {
            requestId: otp.requestId,
            nextResendAt: otp.nextResendAt,
            failAttemptCount: otp.failAttemptCount,
            otpCount: otp.otpCount,
            config: recoverySession.rule,
        };
    }

    async validateTransferOtp(recoverySession, otpCode) {
        // Validate session expired
        if (dateUtil.compare(new Date(), recoverySession.expiredAt) === dateUtil.GREATER_THAN) {
            throw new APIError("ERR_15");
        }

        // Validate failed attempt count
        if (recoverySession.failAttemptCount >= recoverySession.rule.failAttemptLimit) {
            throw new APIError("ERR_13");
        }

        // Query otps
        const otpRows = await this.models.UserRecoveryOTP.findAll({
            where: { sessionId: recoverySession.id },
        });

        // Validate otp list exist
        const otpCount = otpRows.length;
        if (!otpRows || otpCount === 0) {
            throw new APIError("ERR_11");
        }

        // Iterate validation
        let valid;
        for (let i = 0; i < otpCount; i++) {
            const otp = otpRows[i];
            try {
                if (await argon2.verify(otp.signature, otpCode)) {
                    valid = true;
                    break;
                }
            } catch (err) {
                this.logger.error(`Failed to verify OTP. OTP No = ${otp.otpNo}`);
            }
        }

        // If invalid, throw error
        if (!valid) {
            recoverySession.failAttemptCount += 1;
            recoverySession.updatedAt = new Date();
            await recoverySession.save();

            // Throw error
            throw new APIError("ERR_5");
        }

        // Clear otp session
        await this.clearRecoverySession(recoverySession.id);
    }

    async clearRecoverySession(currentSessionId) {
        await this.deleteRecoverySession(currentSessionId);

        // Retrieve all expired session
        const expiredSessions = await this.models.UserRecoverySession.findAll({
            where: { expiredAt: { [Op.lte]: new Date() } },
        });

        if (expiredSessions.length === 0) {
            this.logger.debug("No expired recovery session found");
            return;
        }

        this.logger.debug(`Expired recovery session found = ${expiredSessions.length}`);
        for (const session of expiredSessions) {
            await this.deleteRecoverySession(session.id);
        }
    }

    async deleteRecoverySession(sessionId) {
        const { UserRecoveryOTP, UserRecoverySession } = this.models;
        let count = await UserRecoveryOTP.destroy({ where: { sessionId } });
        this.logger.debug(`Recovery session OTP deleted. SessionId = ${sessionId}, Count = ${count}`);

        count = await UserRecoverySession.destroy({ where: { id: sessionId } });
        this.logger.debug(`Recovery session deleted. SessionId = ${sessionId}, Count = ${count}`);
    }

    async updateTransferAccount(oldUser, appId, newUserId) {
        // Begin transaction
        const transaction = await AppUser.sequelize.transaction();

        try {
            // Remove existing account
            await this.removeAccount(newUserId, transaction);

            // Transfer all AppUser to new User
            const timestamp = new Date();
            await AppUser.update(
                {
                    userId: newUserId,
                    markReset: false,
                    updatedAt: timestamp,
                },
                { where: { userId: oldUser.id }, transaction }
            );

            // Update user last verified at
            await User.update(
                {
                    lastVerifiedAt: timestamp,
                    recoveryEmail: oldUser.recoveryEmail,
                    updatedAt: timestamp,
                },
                { where: { id: newUserId }, transaction }
            );

            // Update old user as new account
            await User.update(
                {
                    lastVerifiedAt: null,
                    recoveryEmail: null,
                    updatedAt: timestamp,
                },
                { where: { id: oldUser.id }, transaction }
            );

            await transaction.commit();
        } catch (err) {
            this.logger.error(`Unable to transfer account. Error = ${err}`);
            await transaction.rollback();
            throw err;
        }
    }

    removeAccountSessions = async (appUserId, transaction) => {
        // Get existing UserRecoverySession
        const recoverySessions = await UserRecoverySession.findAll({
            where: { targetAppUserId: appUserId },
            transaction,
        });
        if (recoverySessions.length > 0) {
            let otpCount = 0;
            let sessionCount = 0;

            // Delete all otps
            for (const recoverySession of recoverySessions) {
                const otpResult = await UserRecoveryOTP.destroy(
                    { where: { sessionId: recoverySession.id } },
                    transaction
                );
                otpCount += otpResult;

                const sessionResult = await UserRecoverySession.destroy({
                    where: { id: recoverySession.id },
                    transaction,
                });
                sessionCount += sessionResult;
            }
            this.logger.debug(`Recovery Session OTPs deleted. Count = ${otpCount}, AppUserId = ${appUserId}`);
            this.logger.debug(`Recovery Session deleted. Count = ${sessionCount}, AppUserId = ${appUserId}`);
        }

        // Remove on exchange session
        let count = await UserExchangeSession.destroy({ where: { appUserId }, transaction });
        this.logger.debug(`Exchange Session deleted. Count = ${count}, AppUserId = ${appUserId}`);

        // Delete AppUser
        count = await AppUser.destroy({ where: { id: appUserId }, transaction });
        this.logger.debug(`AppUser deleted. Count = ${count}, AppUserId = ${appUserId}`);
    };

    async removeAccount(userId, transaction) {
        // Get existing app user
        const appUsers = await AppUser.findAll({ where: { userId }, transaction });
        if (appUsers.length === 0) {
            this.logger.debug(`User does not have AppUser. Skipping remove account. UserId = ${userId}`);
            return;
        }

        await Promise.all(
            appUsers.map((appUser) => {
                return this.removeAccountSessions(appUser.id, transaction);
            })
        );
    }

    async transferAccount(payload) {
        // Get session
        const { recoverySession } = await this.getRecoverySession(payload.token, payload.source);

        // Get target app user
        const oldAppUser = await this.models.AppUser.findByPk(recoverySession.targetAppUserId, {
            include: [
                {
                    model: this.models.App,
                    as: "app",
                    required: true,
                },
                {
                    model: this.models.User,
                    as: "user",
                    required: true,
                },
            ],
        });
        if (!oldAppUser) {
            throw new Error(`unexpected targetAppUser is empty. RecoverySessionId = ${recoverySession.requestId}`);
        }

        // Validate otp
        await this.validateTransferOtp(recoverySession, payload.otpCode);

        // Transfer appUser to new user
        const oldUser = oldAppUser.user;
        await this.updateTransferAccount(oldUser, oldAppUser.appId, recoverySession.userId);

        // Clear session
        await this.clearRecoverySession(recoverySession.id);

        // Compose redirect url
        const result = await this.getAppRedirectUrl(recoverySession.appCredentialId, oldAppUser, payload.source);

        // Set app to result
        result.app = {
            name: oldAppUser.app.name,
        };

        return result;
    }

    /**
     * Log-in with Recovery Session
     *
     * @param payload
     * @return {Promise<{app: {config: {accountRecovery: boolean}}, expiredAt: number, redirectUrl: string, exchangeToken: *, user: {newAccount: *, hasSetupRecovery: boolean, isActive: *}}>}
     */
    logInWithRecoverySession = async (payload) => {
        // Get session
        const { recoverySession } = await this.getRecoverySession(payload.token, payload.source);

        // Get user
        const user = await User.findByPk(recoverySession.userId);
        if (!user) {
            `unexpected condition. User not found. UserId = ${user.id}, RecoverySessionId = ${recoverySession.id}`;
        }

        // Get app
        const app = await App.findByPk(recoverySession.appId);
        if (!app) {
            throw new Error(
                `unexpected condition. App not found. AppId = ${app.id}, RecoverySessionId = ${recoverySession.id}`
            );
        }

        // Register user to the app
        const { appUser, newAccount, isActive } = await this.services.User.getAppUser(app.id, user);

        // Create redirect url
        appUser.app = app;
        const { exchangeToken, redirectUrl, expiredAt } = await this.getAppRedirectUrl(
            recoverySession.appCredentialId,
            appUser,
            payload.source
        );

        // Compose response
        return {
            exchangeToken,
            redirectUrl,
            expiredAt,
            user: {
                isActive,
                newAccount,
                hasSetupRecovery: user.recoveryEmail != null && user.recoveryEmail !== "",
            },
            app: {
                config: {
                    accountRecovery: app.config.web.accountRecovery || false,
                },
            },
        };
    };

    recoverFromLogIn = async (payload) => {
        // Get user app from exchange token
        const { user, sessionId, appCredential } = await this.getAppUser(payload.exchangeToken);

        // Create recovery session
        const result = await this.createRecoverySession(
            {
                appCredentialId: appCredential.id,
                appId: appCredential.appId,
                clientId: appCredential.clientId,
                clientSecret: appCredential.clientSecret,
            },
            user.id
        );

        // Clear exchange token
        const { Auth: AuthService } = this.services;
        await AuthService.clearExchangeToken(sessionId, new Date());

        return result;
    };
}

module.exports = AccountService;
