const { createStrapi } = require('@strapi/strapi');

async function hideTitleFields() {
  console.log('Updating Content Manager settings to hide title field from edit forms while keeping top header title...');
  const app = await createStrapi({ appDir: process.cwd() }).load();

  // 1. Ensure documents have title values
  const hp = await app.documents('api::homepage.homepage').findFirst();
  if (hp) {
    await app.documents('api::homepage.homepage').update({
      documentId: hp.documentId,
      data: { title: 'Homepage' },
      status: 'published',
    });
  }

  const gh = await app.documents('api::global-header.global-header').findFirst();
  if (gh) {
    await app.documents('api::global-header.global-header').update({
      documentId: gh.documentId,
      data: { title: 'Global Header' },
      status: 'published',
    });
  }

  const gf = await app.documents('api::global-footer.global-footer').findFirst();
  if (gf) {
    await app.documents('api::global-footer.global-footer').update({
      documentId: gf.documentId,
      data: { title: 'Global Footer' },
      status: 'published',
    });
  }

  // 2. Update Content Manager configurations in core-store
  const singleTypes = [
    'plugin_content_manager_configuration_content_types::api::homepage.homepage',
    'plugin_content_manager_configuration_content_types::api::global-header.global-header',
    'plugin_content_manager_configuration_content_types::api::global-footer.global-footer',
  ];

  for (const key of singleTypes) {
    const row = await app.db.query('strapi::core-store').findOne({ where: { key } });
    if (row && row.value) {
      const config = JSON.parse(row.value);
      
      // Set mainField to title for header
      config.settings.mainField = 'title';

      // Set title metadata edit visibility to false
      if (config.metadatas && config.metadatas.title) {
        config.metadatas.title.edit = {
          label: 'title',
          description: '',
          placeholder: '',
          visible: false,
          editable: false,
        };
      }

      // Remove title from edit layouts
      if (Array.isArray(config.layouts.edit)) {
        config.layouts.edit = config.layouts.edit
          .map(row => row.filter(field => field.name !== 'title'))
          .filter(row => row.length > 0);
      }

      await app.db.query('strapi::core-store').update({
        where: { id: row.id },
        data: { value: JSON.stringify(config) },
      });
      console.log(`Updated CM settings for ${key}: title set to mainField & hidden from form inputs.`);
    }
  }

  console.log('✅ Single type edit layouts updated cleanly!');
  process.exit(0);
}

hideTitleFields().catch(err => {
  console.error('Error updating CM layout:', err);
  process.exit(1);
});
