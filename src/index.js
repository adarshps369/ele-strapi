'use strict';

const seedHomepageData = require('./bootstrap-seed');

// Strapi server initialization & bootstrap seed
module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   */
  async bootstrap({ strapi }) {
    // Execute full content architecture & gallery seeding - reload trigger
    await seedHomepageData(strapi);
  },
};

