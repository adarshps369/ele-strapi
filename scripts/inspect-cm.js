const { createStrapi } = require('@strapi/strapi');

async function checkCM() {
  const app = await createStrapi({ appDir: process.cwd() }).load();
  const storeRows = await app.db.query('strapi::core-store').findMany({
    where: { key: { $contains: 'plugin_content_manager_configuration' } }
  });
  console.log('Found CM config keys:', storeRows.map(r => r.key));
  for (const r of storeRows) {
    console.log('--- Key:', r.key);
    console.log(JSON.stringify(JSON.parse(r.value), null, 2));
  }
  process.exit(0);
}

checkCM();
