const BaseService = require("./base"),
    argon2 = require("argon2"),
    dateUtil = require("../components/date_util");
const { parsePhoneNumber } = require("libphonenumber-js");
const APIError = require("../server/api_error");
const Constants = require("../constants");
const { config } = require("../components/common");
const nanoId = require("nanoid");

class AccountService extends BaseService {
    constructor(services, args) {
        super("Account", services, args);
        this.newUserRecoverySessionExtId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);
    }

    async setRecoveryEmail(payload) {
        // Validate exchange token
        const { Auth: AuthService, App: AppService } = this.services;
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

        // Issue new exchange token
        const { token, expiredAt } = await AuthService.createExchangeToken(appUser);

        // Compose redirect url
        const redirectUrl = AppService.getRedirectUrl(appUser.app, payload.source);

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

        // TODO: Validate new phone number did not found in existing AppUsers

        // Create otp
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
        const extId = this.newUserRecoverySessionExtId();
        const expiredAt = dateUtil.toEpoch(createdAt) + config.RECOVERY_SESSION_LIFETIME;

        await this.models.UserRecoverySession.create({
            userId: user.id,
            extId,
            expiredAt: dateUtil.fromEpoch(expiredAt),
            createdAt,
        });

        // Create a session
        return AppService.createWebLoginSessionToken({
            clientId: client.clientId,
            clientSecret: client.clientSecret,
            sessionId: extId,
            purpose: Constants.JWT_PURPOSE_RECOVERY_TRANSFER_ACCOUNT,
        });
    }
}

module.exports = AccountService;
