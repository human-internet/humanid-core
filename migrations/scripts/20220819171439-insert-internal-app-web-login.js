"use strict";

const nanoId = require("nanoid");
const { QueryTypes } = require("sequelize");

const newAppExtId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 16);
const newAppCredentialClientId = nanoId.customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 22);
const newAppCredentialClientSecret = nanoId.customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_.~",
    64
);

module.exports = {
    async up(queryInterface, _Sequelize) {
        const extId = newAppExtId();
        await queryInterface.bulkInsert("App", [
            {
                ownerEntityTypeId: "1",
                ownerId: "HUMANID",
                extId,
                name: "Internal.WebLogin",
                logoFile: null,
                appStatusId: 4,
                createdAt: new Date(),
                updatedAt: new Date(),
                config: '{"web": {"limitCountry": [], "redirectUrls": {"failed": "", "success": ""}, "accountRecovery": false, "priorityCountry": [], "privacyPolicyUrl": ""}}',
            },
        ]);

        // Get extId pk
        const db = queryInterface.sequelize;
        const rows = await db.query(
            `SELECT id
                                     FROM App
                                     WHERE extId = '${extId}'`,
            {
                type: QueryTypes.SELECT,
            }
        );
        const appId = rows[0].id;

        // Create app credential for web login
        const clientId = `INTERNAL_${newAppCredentialClientId()}`;
        const clientSecret = newAppCredentialClientSecret();
        await queryInterface.bulkInsert("AppCredential", [
            {
                appId,
                environmentId: 1,
                credentialTypeId: 3,
                name: "WebLogin",
                clientId,
                clientSecret,
                options: '{"platform": "web"}',
                credentialStatusId: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
        console.log(
            `  > App Credential for Web Log-in created: clientId = ${clientId} clientSecret = ${clientSecret} extId = ${extId}`
        );
    },

    async down(_queryInterface, _Sequelize) {
        // Do nothing
    },
};
