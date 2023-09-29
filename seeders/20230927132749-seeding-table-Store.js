'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('Stores', [
      {
        name: 'Apaan tuh',
        description: 'Ceker Pedes',
        price: 3000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Ini itu',
        description: 'Tahu Bulat',
        price: 1000,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('Stores', null, {});
  }
};
