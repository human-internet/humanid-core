'use strict';

const bcrypt = require('bcryptjs')

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
    app1.secret = '2ee4300fd136ed6796a6a507de7c1f49aecd4a11663352fe54e54403c32bd6a0'
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
