'use strict';
module.exports = (sequelize, DataTypes) => {
  const Verification = sequelize.define('Verification', {
    number: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {});
  Verification.associate = function(models) {
    // associations can be defined here
  };
  return Verification;
};