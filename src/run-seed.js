const { createStrapi } = require('@strapi/strapi');
const seedHomepageData = require('./bootstrap-seed');

async function run() {
  const strapi = await createStrapi().load();
  await seedHomepageData(strapi);
  console.log('Seed runner completed.');
  process.exit(0);
}

run().catch(err => {
  console.error('Seed runner failed:', err);
  process.exit(1);
});
