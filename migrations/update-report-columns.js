'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Rename reported_entity_id to target_id
    await queryInterface.renameColumn('reports', 'reported_entity_id', 'target_id');
    
    // Rename reported_entity_type to target_type
    await queryInterface.renameColumn('reports', 'reported_entity_type', 'target_type');
  },

  down: async (queryInterface, Sequelize) => {
    // Revert the changes if needed
    await queryInterface.renameColumn('reports', 'target_id', 'reported_entity_id');
    await queryInterface.renameColumn('reports', 'target_type', 'reported_entity_type');
  }
};
