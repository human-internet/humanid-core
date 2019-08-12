'use strict'
module.exports = (sequelize, DataTypes) => {
  const AppUser = sequelize.define('AppUser', {
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
    notifId: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false, 
      unique: true,
    },
  }, {})
  
  AppUser.associate = function(models) {
    AppUser.belongsTo(models.App, {
      foreignKey: 'appId',
      as: 'app',
    })
    AppUser.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    })
  }

  AppUser.prototype.toJSON = function() {
    let values = Object.assign({}, this.get())
    // exclude internal user ID
    delete values.userId
    // exclude relations
    if (values.app) delete values.app
    if (values.user) delete values.user
    return values
  }

  return AppUser
}