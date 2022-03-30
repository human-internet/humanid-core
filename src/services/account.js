const BaseService = require("./base"),
    argon2 = require("argon2"),
    dateUtil = require("../components/date_util");

class AccountService extends BaseService {
    constructor(services, args) {
        super("Account", services, args);
    }

    async setRecoveryEmail(payload) {
        // Validate exchange token
        const { Auth: AuthService } = this.services;
        const { appUserId, sessionId } = await AuthService.validateExchangeToken(payload.exchangeToken);

        // Get app user id instance
        const appUser = await this.models.AppUser.findOne({ where: { extId: appUserId } });
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

        return {
            exchangeToken: token,
            expiredAt: dateUtil.toEpoch(expiredAt),
        };
    }
}

module.exports = AccountService;
