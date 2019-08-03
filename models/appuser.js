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
    delete values.userId
    delete values.notifId
    return values
  }

  return AppUser
}