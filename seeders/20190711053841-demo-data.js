'use strict';

const bcrypt = require('bcryptjs'),
  helpers = require('../helpers/common')

module.exports = {
  up: (queryInterface, Sequelize) => {
    let now = new Date()
    let admin1 = {
      email: 'admin@local.host', 
      password: bcrypt.hashSync('admin123'),
      createdAt: now,
      updatedAt: now,
    }
    let app1 = {id: 'DEMO_APP', createdAt: now, updatedAt: now}
    app1.secret = helpers.hmac(app1.id)
    return queryInterface.bulkInsert('Admins', [admin1])
      .then(() => {
        return queryInterface.bulkInsert('Apps', [app1])
      })
      .catch(console.error)      
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Admins', null)
        .then(() => {
          return queryInterface.bulkDelete('Apps', null)
        })
        .catch(console.error)      
  }
};
