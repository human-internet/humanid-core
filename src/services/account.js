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

    async setRecoveryEmail(payload) {
        // Validate exchange token
        const { Auth: AuthService } = this.services;
        const { appUserId, sessionId } = await AuthService.validateExchangeToken(payload.exchangeToken);

        // Get app user id instance
        const appUser = await this.models.AppUser.findOne({
            where: { extId: appUserId },
            include: {
                model: this.models.App,
                as: "app",
                required: true,
            },
        });
        if (!appUser) {
            throw new Error(`unexpected AppUser not found. appUserId = ${appUserId}`);
        }

        // Create derived keys of email
        appUser.recoveryEmail = await argon2.hash(payload.recoveryEmail);
        appUser.updatedAt = new Date();
        await appUser.save();

        // Clear exchange token
        await AuthService.clearExchangeToken(sessionId, new Date());

        return this.getAppRedirectUrl(appUser, payload.source);
    }

    async getAppRedirectUrl(appUser, source) {
        // Issue new exchange token
        const { Auth: AuthService, App: AppService } = this.services;
        const { token, expiredAt } = await AuthService.createExchangeToken(appUser);

        // Compose redirect url
        const redirectUrl = AppService.getRedirectUrl(appUser.app, source);

        return {
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
        const hashId = UserService.getHashId(phone.number);
        const appUser = await this.models.AppUser.findOne({
            where: { appId: client.appId },
            include: {
                model: this.models.User,
                as: "user",
                required: true,
                where: {
                    hashId,
                },
            },
        });
        if (appUser) {
            throw new APIError("ERR_37");
        }

        // Create otp
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
        const createdAt = new Date();
        const requestId = this.newUserRecoverySessionRequestId();
        const expiredAt = dateUtil.toEpoch(createdAt) + config.RECOVERY_SESSION_LIFETIME;

        // Define rule
        await this.models.UserRecoverySession.create({
            userId: user.id,
            requestId,
            rule: RECOVERY_OTP_RULE,
            otpCount: 0,
            failAttemptCount: 0,
            expiredAt: dateUtil.fromEpoch(expiredAt),
            createdAt,
            updatedAt: createdAt,
        });

        // Create a session
        return AppService.createWebLoginSessionToken({
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            sessionId: requestId,
            purpose: Constants.JWT_PURPOSE_RECOVERY_TRANSFER_ACCOUNT,
        });
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
        if (!appUser.recoveryEmail) {
            throw new APIError("ERR_34");
        }

        // Check if recovery email is correct
        try {
            await argon2.verify(appUser.recoveryEmail, recoveryEmail);
        } catch (err) {
            throw new APIError("ERR_35");
        }

        return { appUser, user: appUser.user };
    }

    async createRecoveryOTP(recoverySession, targetAppUserId, timestamp) {
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
                    targetAppUserId,
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
        return `Hi Human,
        <br />
        <br />
        Please use this one-time verification code to gain access to your account:
        <br />
        <br />
        <b>${otpCode}</b>
        <br />
        <br />
        This code will expire in ${expiredIn}.
        <br />
        If you did not ask for account recovery, please ignore this email.
        <br />
        <br />
        <br />
        The humanID Team`;
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
        const otp = await this.createRecoveryOTP(recoverySession, appUser.id, new Date());
        this.logger.debug(`OTP Code = ${otp.code}`);

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

    async transferAccount(payload) {
        // Get session
        const { recoverySession } = await this.getRecoverySession(payload.token, payload.source);

        // Get target app user
        const targetAppUser = await this.models.AppUser.findByPk(recoverySession.targetAppUserId, {
            include: {
                model: this.models.App,
                as: "app",
                required: true,
            },
        });
        if (!targetAppUser) {
            throw new Error(`unexpected targetAppUser is empty. RecoverySessionId = ${recoverySession.requestId}`);
        }

        // Validate otp
        await this.validateTransferOtp(recoverySession, payload.otpCode);

        // Transfer appUser to new user
        targetAppUser.userId = recoverySession.userId;
        targetAppUser.updatedAt = new Date();
        await targetAppUser.save();

        // Clear session
        await this.clearRecoverySession(recoverySession.id);

        // Compose redirect url
        return this.getAppRedirectUrl(targetAppUser, payload.source);
    }
}

module.exports = AccountService;
