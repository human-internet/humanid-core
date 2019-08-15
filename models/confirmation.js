'use strict';
module.exports = (sequelize, DataTypes) => {
  const Confirmation = sequelize.define('Confirmation', {
    appId: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    type: DataTypes.STRING,
    confirmingAppId: DataTypes.STRING,
    messageId: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {});
  
  Confirmation.associate = function(models) {
    // associations can be defined here
  };

  Confirmation.prototype.toJSON = function() {
    let values = Object.assign({}, this.get())
    // exclude internal user ID
    delete values.userId
    return values
  }

  // constants
  Confirmation.StatusCode = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
  }

  Confirmation.TypeCode = { 
    WEB_LOGIN_REQUEST: 'WEB_LOGIN_REQUEST',
  }

  return Confirmation;
};