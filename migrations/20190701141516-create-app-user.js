'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('AppUsers', {
      appId: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'Apps',
          key: 'id',
        },
      },
      userHash: {
        type: Sequelize.STRING,
        primaryKey: true,
        references: {
          model: 'Users',
          key: 'hash',
        },
      },
      deviceId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notifId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      hash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('AppUsers');
  }
};