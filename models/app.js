'use strict'
module.exports = (sequelize, DataTypes) => {
  const App = sequelize.define('App', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      validate: {        
        is: {
          args: ["^[a-zA-Z0-9_]{5,20}$",'i'],
          msg: 'App ID must be 5-20 alphanumeric characters',
        },
      }, 
    },
    secret: DataTypes.STRING,
    urls: DataTypes.STRING,
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