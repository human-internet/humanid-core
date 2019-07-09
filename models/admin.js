'use strict'
module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {})

  Admin.prototype.toJSON = function() {
    let values = Object.assign({}, this.get())
    delete values.id
    delete values.password
    return values
  }

  Admin.associate = function(models) {
    // associations can be defined here
  }

  return Admin
}