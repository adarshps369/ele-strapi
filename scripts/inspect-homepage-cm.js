const { createStrapi } = require('@strapi/strapi');

async function checkHomepage() {
  const app = await createStrapi({ appDir: process.cwd() }).load();
  const k = 'plugin_content_manager_configuration_content_types::api::homepage.homepage';
  const row = await app.db.query('strapi::core-store').findOne({ where: { key: k } });
  if (row) {
    console.log(JSON.stringify(JSON.parse(row.value), null, 2));
  }
  process.exit(0);
}

checkHomepage();
