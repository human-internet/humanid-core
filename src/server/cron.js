const { CronJob } = require("cron");
const fetch = require("node-fetch");
const jwt = require("jsonwebtoken");
const logger = require("../logger");
const { User, App, AppUser } = require("../models");

require("dotenv").config();

module.exports.checkUpdateBalance = new CronJob(
    "0 */2 * * *",
    async function () {
        logger.info("Start Updating Balance");
        try {
            const token = jwt.sign({ iss: process.env.ISSUER }, process.env.SECRET_KEY, { expiresIn: "5s" });

            const resp = await fetch(`${process.env.DEV_CONSOLE_BASE_URL}/account/balance`, {
                method: "get",
                headers: { Authorization: `Bearer ${token}` },
            });
            const resBody = await resp.json();
            if (resp.status !== 200) {
                throw Error(resBody.error);
            }
            await Promise.all(
                resBody.map(async (data) => {
                    if (data.ownerId) {
                        const ownerId = data.ownerId.replace("owner", "");
                        const app = await App.findOne({
                            where: { ownerId },
                            include: [{ model: AppUser, as: "appUser" }],
                        });

                        if (app?.appUser.length > 0) {
                            app?.appUser.map(async (appUser) => {
                                const transaction = await User.sequelize.transaction();
                                await User.update(
                                    {
                                        accountBalance: +data.credit_balance > 0 ? data.credit_balance : 0,
                                    },
                                    { where: { id: appUser.userId }, transaction }
                                );
                                await transaction.commit();
                            });
                        }
                    }
                })
            );
            logger.info("Finish, Balance Updated!!");
        } catch (error) {
            logger.error(`Failed to update balance. Error:${error.message}`);
        }
    },
    null,
    false
);
