'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    hash: {
      type: DataTypes.STRING,
      allowNull: false, 
    },
  }, {})
  User.associate = function(models) {
    User.hasMany(models.AppUser)
    User.belongsToMany(models.App, {
      through: models.AppUser,
      as: 'apps',
      foreignKey: 'userId',
      otherKey: 'appId',
    })
  }
  return User
}