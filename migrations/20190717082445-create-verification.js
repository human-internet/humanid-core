'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Verifications', {
      number: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      requestId: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
    .then(() => {
      return queryInterface.addIndex('Verifications', ['requestId'])
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Verifications')
      .then(() => {
        return queryInterface.removeIndex('Verifications', 'requestId')
      })
  }
};