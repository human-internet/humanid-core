"use strict";

const { QueryTypes } = require("sequelize");

module.exports = {
    async up(queryInterface, _Sequelize) {
        // Get all parent product
        const db = queryInterface.sequelize;

        // Query all apps
        const rows = await db.query("SELECT * FROM `App`", {
            type: QueryTypes.SELECT,
        });

        if (rows.length === 0) {
            console.log("  > No App rows");
            return;
        }

        // Init counter
        let successCount = 0;

        for (const app of rows) {
            try {
                // Init config if not set
                if (app.config == null) {
                    app.config = {};
                }

                // Init web config if not set
                if (app.config.web == null) {
                    app.config.web = {};
                }

                // Update config, ensure not to overwrite existing values
                if (app.config.web.redirectUrls == null) {
                    app.config.web.redirectUrls = {};
                }

                if (app.config.web.redirectUrls.success == null) {
                    app.config.web.redirectUrls.success = "";
                }

                if (app.config.web.redirectUrls.failed == null) {
                    app.config.web.redirectUrls.failed = "";
                }

                if (app.config.web.priorityCountry == null) {
                    app.config.web.priorityCountry = [];
                }

                if (app.config.web.limitCountry == null) {
                    app.config.web.limitCountry = [];
                }

                if (app.config.web.accountRecovery == null) {
                    app.config.web.accountRecovery = false;
                }

                if (app.config.web.privacyPolicyUrl == null) {
                    app.config.web.privacyPolicyUrl = "";
                }

                // Set metadata
                app.config = JSON.stringify(app.config);
                app.updatedAt = new Date();

                // Save
                await save(db, app);

                console.log(`  > Success process App. Id: ${app.extId}`);
                successCount += 1;
            } catch (err) {
                console.log(`  > Failed to process App row. Id: ${app.extId}. Reason: ${err}`);
            }
        }

        const pct = (successCount / rows.length) * 100;
        console.log(`  > Success processing ${successCount} of ${rows.length}. Rate = ${pct}`);
    },

    async down(queryInterface, Sequelize) {},
};

// -- PRIVATE METHODS

const updateQuery = "UPDATE `App` SET updatedAt = :updatedAt, config = :config WHERE id = :id";

async function save(db, row) {
    return db.query(updateQuery, { replacements: row, type: QueryTypes.UPDATE });
}
