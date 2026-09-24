const { createStrapi } = require('@strapi/strapi');

async function applyTitles() {
  console.log('Initializing Strapi to update titles and Content Manager display settings...');
  const app = await createStrapi({ appDir: process.cwd() }).load();

  // 1. Update Homepage title
  const hp = await app.documents('api::homepage.homepage').findFirst();
  if (hp) {
    await app.documents('api::homepage.homepage').update({
      documentId: hp.documentId,
      data: { title: 'Homepage' },
      status: 'published',
    });
    console.log('Updated Homepage document title -> "Homepage"');
  }

  // 2. Update Global Header title
  const gh = await app.documents('api::global-header.global-header').findFirst();
  if (gh) {
    await app.documents('api::global-header.global-header').update({
      documentId: gh.documentId,
      data: { title: 'Global Header' },
      status: 'published',
    });
    console.log('Updated Global Header document title -> "Global Header"');
  }

  // 3. Update Global Footer title
  const gf = await app.documents('api::global-footer.global-footer').findFirst();
  if (gf) {
    await app.documents('api::global-footer.global-footer').update({
      documentId: gf.documentId,
      data: { title: 'Global Footer' },
      status: 'published',
    });
    console.log('Updated Global Footer document title -> "Global Footer"');
  }

  // 4. Update Content Manager view settings in strapi::core-store
  const ctypeKeys = [
    'plugin_content_manager_configuration_content_types::api::homepage.homepage',
    'plugin_content_manager_configuration_content_types::api::global-header.global-header',
    'plugin_content_manager_configuration_content_types::api::global-footer.global-footer',
  ];

  for (const k of ctypeKeys) {
    const row = await app.db.query('strapi::core-store').findOne({ where: { key: k } });
    if (row && row.value) {
      const parsed = JSON.parse(row.value);
      parsed.settings.mainField = 'title';
      parsed.settings.defaultSortBy = 'title';
      await app.db.query('strapi::core-store').update({
        where: { id: row.id },
        data: { value: JSON.stringify(parsed) },
      });
      console.log(`Updated CM mainField setting to "title" for ${k}`);
    }
  }

  console.log('✅ Title and Content Manager display settings updated successfully!');
  process.exit(0);
}

applyTitles().catch(err => {
  console.error('Error applying titles:', err);
  process.exit(1);
});
