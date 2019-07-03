'use strict'
module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false, 
    },
    secret: DataTypes.STRING,
  }, {})
  App.associate = function(models) {
    App.hasMany(models.AppUser, {
      foreignKey: 'appId',
      as: 'appUsers',
    })
    App.belongsToMany(models.User, {
      through: models.AppUser,
      as: 'users',
      foreignKey: 'appId',
      otherKey: 'userHash',
    })
  }
  return App
}