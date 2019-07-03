'use strict'
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    hash: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false, 
    },
  }, {})
  User.associate = function(models) {
    User.belongsToMany(models.App, {
      through: models.AppUser,
      as: 'apps',
      foreignKey: 'userHash',
      otherKey: 'appId',
    })
  }
  return User
}