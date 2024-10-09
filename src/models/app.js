"use strict";

const Sequelize = require("sequelize");

const MODEL_NAME = "App",
    TABLE_NAME = "App";

module.exports = (sequelize) => {
    const Model = sequelize.define(
        MODEL_NAME,
        {
            id: {
                type: Sequelize.BIGINT,
                primaryKey: true,
                autoIncrement: true,
            },
            ownerEntityTypeId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            dcProjectId: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            ownerId: {
                type: Sequelize.BIGINT,
                allowNull: false,
            },
            extId: {
                type: Sequelize.STRING(64),
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            logoFile: {
                type: Sequelize.STRING(64),
                allowNull: true,
            },
            appStatusId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "AppStatus",
                    key: "id",
                },
            },
            config: {
                type: Sequelize.JSON,
                allowNull: true,
            },
        },
        {
            tableName: TABLE_NAME,
            timestamps: true,
        }
    );
    Model.associate = function (models) {
        Model.hasMany(models.AppUser, {
            foreignKey: "appId",
            as: "appUser",
        });
    };
    return Model;
};
