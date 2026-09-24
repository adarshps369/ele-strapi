'use strict';

const fs = require('fs');
const path = require('path');

const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../frontend/public');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.svg':
      return 'image/svg+xml';
    case '.mp4':
      return 'video/mp4';
    case '.webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

async function uploadAsset(strapi, relativePath) {
  if (!relativePath) return null;
  const fullPath = path.join(FRONTEND_PUBLIC_DIR, relativePath.replace(/^\//, ''));
  if (!fs.existsSync(fullPath)) {
    console.warn(`Asset not found: ${fullPath}`);
    return null;
  }

  const mimeType = getMimeType(fullPath);
  const stats = fs.statSync(fullPath);
  const fileName = path.basename(fullPath);

  try {
    const fileBuffer = fs.readFileSync(fullPath);
    const fileObj = {
      path: fullPath,
      filepath: fullPath,
      name: fileName,
      originalFilename: fileName,
      type: mimeType,
      mimetype: mimeType,
      size: stats.size,
      buffer: fileBuffer,
    };

    const uploadedFiles = await strapi.plugin('upload').service('upload').upload({
      data: {},
      files: fileObj,
    });

    const file = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;
    if (file && file.id) {
      console.log(`Uploaded asset: ${relativePath} -> ID ${file.id}`);
      return file;
    } else {
      console.error(`Upload returned empty file object for ${relativePath}:`, uploadedFiles);
      return null;
    }
  } catch (err) {
    console.error(`Failed to upload asset ${relativePath}:`, err);
    return null;
  }
}

async function enablePublicPermissions(strapi) {
  try {
    const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
      where: { type: 'public' },
    });

    if (!publicRole) return;

    const actionsToEnable = [];
    const contentTypes = [
      'api::homepage.homepage',
      'api::global-header.global-header',
      'api::global-footer.global-footer',
      'api::about-page.about-page',
      'api::about-ayurveda-page.about-ayurveda-page',
      'api::activities-page.activities-page',
      'api::ayurvedic-treatments-page.ayurvedic-treatments-page',
      'api::contact-page.contact-page',
      'api::dining-page.dining-page',
      'api::facilities-amenities-page.facilities-amenities-page',
      'api::gallery-page.gallery-page',
      'api::igh-packages-page.igh-packages-page',
      'api::meetings-events-page.meetings-events-page',
      'api::testimonials-page.testimonials-page',
      'api::theme-wedding-page.theme-wedding-page',
      'api::yoga-meditation-page.yoga-meditation-page',
      'api::living-space.living-space',
      'api::activity.activity',
      'api::facility.facility',
      'api::meeting-event.meeting-event',
      'api::destination.destination',
      'api::testimonial.testimonial',
      'api::blog-post.blog-post',
      'api::package.package',
      'api::ayurvedic-treatment.ayurvedic-treatment',
      'api::gallery-item.gallery-item',
      'api::award-certification.award-certification',
      'api::global-seo-analytics.global-seo-analytics',
      'api::visit-us-section.visit-us-section',
    ];

    for (const ct of contentTypes) {
      actionsToEnable.push(`${ct}.find`);
      actionsToEnable.push(`${ct}.findOne`);
    }

    const existingPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
      where: { role: publicRole.id },
    });

    const existingActions = new Set(existingPermissions.map(p => p.action));

    for (const action of actionsToEnable) {
      if (!existingActions.has(action)) {
        await strapi.db.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: publicRole.id,
          },
        });
      }
    }
    console.log('Public permissions successfully enabled for all content types.');
  } catch (err) {
    console.warn('Failed to configure public permissions:', err.message);
  }
}

module.exports = async function seedHomepageData(strapi) {
  try {
    console.log('Starting full Strapi content architecture seeding...');

    // 1. Enable Public Permissions
    await enablePublicPermissions(strapi);

    // Ensure Global Visit Us singleType is created & published
    const existingVisitUs = await strapi.documents('api::visit-us-section.visit-us-section').findFirst();
    if (!existingVisitUs) {
      await strapi.documents('api::visit-us-section.visit-us-section').create({
        data: {
          left_box_title: 'VISIT US',
          route_text: 'Click here for getting </br> the route to me',
          route_url: 'https://maps.google.com',
          phone: '+91 8086418199',
          email: 'reservations@Intergrandhotels.Com',
          right_box_title: 'DISTANCE TO THEKKADY FROM MAJOR TOWNS',
          distances: [
            { name: 'Cochin airport, kerala (165 kms)' },
            { name: 'Munnar, kerala (90 kms)' },
            { name: 'Aleppy, kerala (155 kms)' },
            { name: 'Kumarakom, kerala (125 kms)' },
            { name: 'Madurai airport, Tamilnadu (125 kms)' },
          ],
        },
        status: 'published',
      });
      console.log('Seeded Global Visit Us singleType.');
    }

    // Seed Gallery Data (SingleType & Collection)
    await seedGalleryData(strapi);

    // Seed About Page Data (SingleType)
    await seedAboutPageData(strapi);

    // 2. Check if Living Spaces and Packages already populated
    const existingRooms = await strapi.documents('api::living-space.living-space').findMany();
    const existingPackages = await strapi.documents('api::package.package').findMany();

    if (existingRooms.length > 0 && existingPackages.length > 0) {
      console.log('Strapi content model & seed data already present. Skipping re-seeding.');
      return;
    }

    // Common Assets Upload
    const roomHero = await uploadAsset(strapi, '/assets/images/pages/room-detail/hero.jpg');
    const pool1 = await uploadAsset(strapi, '/assets/images/pages/room-detail/pool_1.jpg');
    const pool2 = await uploadAsset(strapi, '/assets/images/pages/room-detail/pool_2.jpg');
    const pool3 = await uploadAsset(strapi, '/assets/images/pages/room-detail/pool_3.jpg');

    const poolStudio1 = await uploadAsset(strapi, '/assets/images/pages/home/living/pool-studio-1.jpg');
    const poolStudio2 = await uploadAsset(strapi, '/assets/images/pages/home/living/pool-studio-2.jpg');
    const poolStudio3 = await uploadAsset(strapi, '/assets/images/pages/home/living/pool-studio-3.jpg');

    // --- Seed Living Spaces ---
    const roomsSeed = [
      {
        title: 'POOL STUDIO',
        slug: 'pool-studio',
        subTitle: 'best five star resort in thekkady',
        description: 'Where trees sway to the gust of wind blown down from the mighty peaks of the western ghats, where spices scent the cool air with distinct fragrances.',
        image: poolStudio1 ? poolStudio1.id : null,
        heroImage: roomHero ? roomHero.id : null,
        href: '/pool-studio',
        about: [
          { title: 'PRIVATE PLUNGE POOL', description: 'Step directly from your bedroom into your private plunge pool overlooking the lush forest.', image: pool1 ? pool1.id : null },
          { title: 'TROPICAL GARDEN VIEW', description: 'Immerse yourself in nature with floor-to-ceiling glass windows and tranquil garden views.', image: pool2 ? pool2.id : null },
          { title: 'CUSTOM HANDCRAFTED INTERIORS', description: 'Designed with natural teak wood, plush linens, and traditional Kerala craftsmanship.', image: pool3 ? pool3.id : null },
        ],
        amenities: [
          { title: 'Private Bath', iconName: 'Bath' },
          { title: 'High-speed Wifi', iconName: 'Wifi' },
          { title: '24/7 Service', iconName: 'ConciergeBell' },
          { title: 'Room Service', iconName: 'UtensilsCrossed' },
          { title: 'Air Conditioning', iconName: 'Wind' },
          { title: 'Parking Space', iconName: 'Car' },
          { title: 'Shuttle Service', iconName: 'Rocket' },
          { title: 'Gym & Spa', iconName: 'Dumbbell' },
        ],
      },
      {
        title: 'PATIO VILLA',
        slug: 'patio-villa',
        subTitle: 'best five star resort in thekkady',
        description: 'Experience serene luxury in our spacious Patio Villa, surrounded by lush tropical greenery with private outdoor lounging and refined artisan decor.',
        image: poolStudio2 ? poolStudio2.id : null,
        heroImage: roomHero ? roomHero.id : null,
        href: '/patio-villa',
        about: [
          { title: 'PRIVATE OUTDOOR PATIO', description: 'Enjoy peaceful mornings and starry nights on your secluded private lounge patio.', image: pool2 ? pool2.id : null },
          { title: 'LUSH VERDANT SURROUNDINGS', description: 'Surrounded by exotic flora and aromatic spice trees for complete seclusion.', image: pool1 ? pool1.id : null },
          { title: 'SPA-INSPIRED BATHROOM', description: 'Includes an oversized rain shower, luxury bath amenities, and stone soaking tub.', image: pool3 ? pool3.id : null },
        ],
        amenities: [
          { title: 'Private Bath', iconName: 'Bath' },
          { title: 'High-speed Wifi', iconName: 'Wifi' },
          { title: '24/7 Service', iconName: 'ConciergeBell' },
          { title: 'Room Service', iconName: 'UtensilsCrossed' },
          { title: 'Air Conditioning', iconName: 'Wind' },
          { title: 'Garden Area', iconName: 'Trees' },
        ],
      },
      {
        title: 'GARDEN SUITE',
        slug: 'garden-suite',
        subTitle: 'best five star resort in thekkady',
        description: 'Indulge in unmatched comfort and royal ambiance in our Garden Suite featuring handcrafted wooden finishes and panoramic wilderness views.',
        image: poolStudio3 ? poolStudio3.id : null,
        heroImage: roomHero ? roomHero.id : null,
        href: '/garden-suite',
        about: [
          { title: 'EXPANSIVE LIVING AREA', description: 'Features a separate elegant living room ideal for relaxing or hosting intimate gatherings.', image: pool3 ? pool3.id : null },
          { title: 'PANORAMIC MOUNTAIN VIEWS', description: 'Breathtaking vistas of the Western Ghats from your private elevated balcony.', image: pool1 ? pool1.id : null },
          { title: 'VIP CONCIERGE HOSPITALITY', description: 'Dedicated 24/7 butler service and personalized Kerala luxury hospitality.', image: pool2 ? pool2.id : null },
        ],
        amenities: [
          { title: 'Private Bath', iconName: 'Bath' },
          { title: 'High-speed Wifi', iconName: 'Wifi' },
          { title: '24/7 Service', iconName: 'ConciergeBell' },
          { title: 'Swimming Pool', iconName: 'Waves' },
        ],
      },
      {
        title: 'HONEYMOON SUITE',
        slug: 'honeymoon-suite',
        subTitle: 'best five star resort in thekkady',
        description: 'An idyllic retreat designed for romance, featuring private balconies, opulent interiors, and bespoke personalized hospitality.',
        image: poolStudio2 ? poolStudio2.id : null,
        heroImage: roomHero ? roomHero.id : null,
        href: '/honeymoon-suite',
        about: [
          { title: 'ROMANTIC SUNSET BALCONY', description: 'Private balcony with cozy daybeds, designed for breathtaking romantic sunsets.', image: pool1 ? pool1.id : null },
          { title: 'JACUZZI & SOAKING TUB', description: 'Indulge in a private indoor jacuzzi adorned with fresh tropical flowers.', image: pool3 ? pool3.id : null },
          { title: 'BESPOKE DINING EXPERIENCES', description: 'Enjoy candlelit in-suite dining crafted by our master executive chefs.', image: pool2 ? pool2.id : null },
        ],
        amenities: [
          { title: 'Private Bath', iconName: 'Bath' },
          { title: 'High-speed Wifi', iconName: 'Wifi' },
          { title: '24/7 Service', iconName: 'ConciergeBell' },
          { title: 'Room Service', iconName: 'UtensilsCrossed' },
        ],
      },
    ];

    for (const r of roomsSeed) {
      await strapi.documents('api::living-space.living-space').create({
        data: r,
        status: 'published',
      });
      console.log(`Seeded Living Space: ${r.title}`);
    }

    // --- Seed Packages ---
    const hmoonHero = await uploadAsset(strapi, '/assets/images/pages/igh-packages/honeymoon-package/hero-image.jpg');
    const hmoonTarifLand = await uploadAsset(strapi, '/assets/images/pages/igh-packages/honeymoon-package/tarif-landscape.jpg');
    const hmoonTarifLeft = await uploadAsset(strapi, '/assets/images/pages/igh-packages/honeymoon-package/tarif-portrait-left.jpg');
    const hmoonTarifRight = await uploadAsset(strapi, '/assets/images/pages/igh-packages/honeymoon-package/tarif-portrait-right.jpg');

    const exploreHero = await uploadAsset(strapi, '/assets/images/pages/igh-packages/explore-thekkady/hero-image.jpg');
    const rumbleHero = await uploadAsset(strapi, '/assets/images/pages/igh-packages/rumble-jungle.jpg');
    const gaviHero = await uploadAsset(strapi, '/assets/images/pages/igh-packages/gavi-package.jpg');

    const packagesSeed = [
      {
        title: 'HONEYMOON SPECIAL PACKAGE',
        slug: 'honeymoon-package',
        subTitle: 'exclusive luxury romantic experience in thekkady',
        description: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        shortDescription: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        heroImage: hmoonHero ? hmoonHero.id : null,
        imageSrc: hmoonHero ? hmoonHero.id : null,
        duration: '02 Days & 03 Days',
        isFeatured: true,
        tariffData: {
          validity: 'Valid from 01st October 2025 - 20th December 2025 and 06 Jan to 31 March',
          price: '₹30000/- per couple',
          extraDetails: [
            'Extra Adult @ Rs. NA /-',
            'Extra Child with bed ( 6-12yrs) @ Rs.NA/-',
            'Extra Child without bed ( 6-12yrs) @ Rs. NA/-',
          ],
          inclusions: [
            'Traditional Kerala Welcome (with Aarti & Tikka) and homemade refreshment drink on arrival',
            'Accommodation in well-appointed AC Honeymoon Suite Room for 02 Nights & 03 Days',
            '02 Complimentary Breakfast & 01 Dinner',
            '01 Night - Private Candle light dinner',
            'Complimentary Flower bed decoration on the arrival day',
            'Fruit basket & cookies platter',
          ],
          landscapeImage: hmoonTarifLand ? hmoonTarifLand.id : null,
          portraitLeftImage: hmoonTarifLeft ? hmoonTarifLeft.id : null,
          portraitRightImage: hmoonTarifRight ? hmoonTarifRight.id : null,
        },
      },
      {
        title: 'EXPLORE THEKKADY',
        slug: 'explore-thekkady',
        subTitle: 'wildlife & rainforest adventure package',
        description: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        shortDescription: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        heroImage: exploreHero ? exploreHero.id : null,
        imageSrc: exploreHero ? exploreHero.id : null,
        duration: '02 Days & 03 Days',
        isFeatured: false,
      },
      {
        title: 'RUMBLE IN THE JUNGLE',
        slug: 'rumble-in-the-jungle',
        subTitle: 'thrilling jungle safari & trekking experience',
        description: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        shortDescription: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        heroImage: rumbleHero ? rumbleHero.id : null,
        imageSrc: rumbleHero ? rumbleHero.id : null,
        duration: '02 Days & 03 Days',
        isFeatured: false,
      },
      {
        title: 'GAVI PACKAGE',
        slug: 'gavi-package',
        subTitle: 'unspoiled eco-tourism rainforest trail',
        description: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        shortDescription: 'A programme designed to immerse in the unique landscape around you with an opportunity to view wildlife up-close.',
        heroImage: gaviHero ? gaviHero.id : null,
        imageSrc: gaviHero ? gaviHero.id : null,
        duration: '02 Days & 03 Days',
        isFeatured: false,
      },
    ];

    for (const p of packagesSeed) {
      await strapi.documents('api::package.package').create({
        data: p,
        status: 'published',
      });
      console.log(`Seeded Package: ${p.title}`);
    }

    // --- Seed Ayurvedic Treatments ---
    const ayurvedicTreatmentsSeed = [
      {
        title: 'ABHYANGAM MASSAGE',
        slug: 'abhyangam-massage',
        subTitle: 'Traditional Ayurvedic Full Body Herbal Massage',
        category: 'Primary Ayurvedic Treatments',
        shortDescription: 'A full-body massage with warm medicated herbal oils to improve blood circulation, eliminate toxins, and relieve muscle tension.',
        fullDescription: 'Abhyangam is an ancient Ayurvedic therapy involving deep tissue manipulation with specially formulated warm herbal oils.',
        duration: '60 Mins',
        benefits: ['Improves Blood Circulation', 'Relieves Stress & Fatigue', 'Enhances Skin Texture & Tone'],
      },
      {
        title: 'SHIRODHARA THERAPY',
        slug: 'shirodhara-therapy',
        subTitle: 'Relaxing Continuous Herbal Oil Pouring Treatment',
        category: 'Rejuvenation Packages',
        shortDescription: 'A continuous stream of warm medicated oil poured gently onto the forehead (third eye) to calm the nervous system.',
        fullDescription: 'Shirodhara brings profound mental clarity, deep relaxation, and peace of mind by stimulating cognitive balance.',
        duration: '45 Mins',
        benefits: ['Calms Nervous System', 'Promotes Deep Restful Sleep', 'Relieves Anxiety & Tension'],
      },
    ];

    for (const t of ayurvedicTreatmentsSeed) {
      await strapi.documents('api::ayurvedic-treatment.ayurvedic-treatment').create({
        data: t,
        status: 'published',
      });
      console.log(`Seeded Ayurvedic Treatment: ${t.title}`);
    }

    // --- Seed Single Types Hero & Data ---
    const aboutHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/about-hero.png');
    const ayurvedaHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/ayurveda-hero.jpg');
    const activitiesHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/activities-hero.jpg');
    const diningHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/dining-hero.jpg');
    const facilitiesHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/facilities-amenities-hero.jpg');
    const galleryHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/gallery-hero.jpg');
    const ighHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/igh-packages-hero.jpg');
    const meetingsHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/meetings-events-hero.png');
    const testimonialHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/testimonial-hero.jpg');
    const weddingHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/theme-wedding-hero.jpg');
    const yogaHeroImg = await uploadAsset(strapi, '/assets/images/common/hero/yoga-meditation-hero.jpg');

    const ayurvedicVideo = await uploadAsset(strapi, '/assets/videos/common/hero/ayurvedic-treatments-hero.mp4');
    const contactVideo = await uploadAsset(strapi, '/assets/videos/common/hero/contact-hero.mp4');

    // Seed Single Types
    await strapi.documents('api::about-page.about-page').create({
      data: {
        title: 'The Elephant Court',
        hero: {
          title: 'The Elephant Court',
          sub_title: 'best five star resort in thekkady',
          description: 'The only five-star luxury resort in Thekkady, where Kerala pristine wilderness meets refined hospitality and unforgettable experiences.',
          bgType: 'image',
          media: aboutHeroImg ? aboutHeroImg.id : null,
          overlay: 'dark',
        },
        moreAboutTitle: 'MORE ABOUT US',
        moreAboutSubTitle: 'THE ELEPHANT COURT',
        moreAboutDescription1: 'Nestled on a serene hillock in Thekkady, The Elephant Court is Kerala fine five-star luxury resort.',
        whyChooseTitle: 'Why Choose The Elephant Court',
        whyChooseSubTitle: 'UNMATCHED LUXURY & NATURE',
      },
      status: 'published',
    });

    await strapi.documents('api::about-ayurveda-page.about-ayurveda-page').create({
      data: {
        title: 'ABOUT AYURVEDA',
        hero: {
          title: 'ABOUT AYURVEDA',
          description: 'Experience ancient wellness & holistic healing in the rainforests of Thekkady.',
          bgType: 'image',
          media: ayurvedaHeroImg ? ayurvedaHeroImg.id : null,
        },
        scienceOfLifeTitle: 'THE SCIENCE OF LIFE',
        scienceOfLifeDescription: 'Ayurveda is a 5000-year-old system of natural healing that originated in the Vedic culture of India.',
      },
      status: 'published',
    });

    await strapi.documents('api::activities-page.activities-page').create({
      data: {
        title: 'ACTIVITIES',
        hero: {
          title: 'activities',
          description: 'Explore exciting wilderness adventures, bamboo rafting, and spice plantation tours.',
          bgType: 'image',
          media: activitiesHeroImg ? activitiesHeroImg.id : null,
        },
        introTitle: 'EMBARK ON MEMORABLE EXPERIENCES',
        introDescription: 'From trekking Periyar Tiger Reserve to experiencing authentic Kathakali performances.',
      },
      status: 'published',
    });

    await strapi.documents('api::ayurvedic-treatments-page.ayurvedic-treatments-page').create({
      data: {
        title: 'AYURVEDIC TREATMENTS',
        hero: {
          title: 'Ayurvedic Treatments',
          description: 'Restore mind, body, and soul with customized authentic Ayurvedic remedies.',
          bgType: 'video',
          media: ayurvedicVideo ? ayurvedicVideo.id : null,
        },
        introTitle: 'AUTHENTIC HEALING SANCTUARY',
        introDescription: 'Our certified Ayurvedic doctors design tailored wellness regimens using pure botanical formulations.',
      },
      status: 'published',
    });

    await strapi.documents('api::contact-page.contact-page').create({
      data: {
        title: 'Contact Us',
        hero: {
          title: 'Contact Us',
          description: 'Get in touch with our team for reservations, event planning, or general inquiries.',
          bgType: 'video',
          media: contactVideo ? contactVideo.id : null,
        },
        connectTitle: 'CONNECT WITH US',
        connectSubTitle: 'We are here to make your stay unforgettable',
        locations: [
          { title: 'The Elephant Court Resort', address: 'Thekkady, Idukki District, Kerala, India - 685536', phone: '+91 4869 224237', email: 'info@theelephantcourt.com' }
        ],
        distances: [
          { name: 'Cochin International Airport (COK) - 145 KM' },
          { name: 'Kottayam Railway Station - 108 KM' },
          { name: 'Madurai Airport (IXM) - 140 KM' }
        ],
        mapEmbedUrl: 'https://maps.google.com/?q=The+Elephant+Court+Thekkady',
      },
      status: 'published',
    });

    await strapi.documents('api::dining-page.dining-page').create({
      data: {
        title: 'DINING WITH US',
        hero: {
          title: 'DINING WITH US',
          description: 'Savor gourmet Kerala delicacies and international fine dining in nature ambient setting.',
          bgType: 'image',
          media: diningHeroImg ? diningHeroImg.id : null,
        },
        gastronomicEdenTitle: 'A GASTRONOMIC EDEN',
        gastronomicEdenDescription: 'Culinary masterpieces prepared with freshly picked organic herbs and local spices.',
      },
      status: 'published',
    });

    await strapi.documents('api::facilities-amenities-page.facilities-amenities-page').create({
      data: {
        title: 'Our Facilities & Amenities',
        hero: {
          title: 'Our Facilities & Amenities',
          description: 'World-class amenities designed for your total relaxation, wellness, and comfort.',
          bgType: 'image',
          media: facilitiesHeroImg ? facilitiesHeroImg.id : null,
        },
        spaWellnessTitle: 'AYURVEDIC SPA & WELLNESS CENTER',
        spaWellnessDescription: 'Rejuvenate your senses at our award-winning holistic wellness center.',
      },
      status: 'published',
    });

    await strapi.documents('api::gallery-page.gallery-page').create({
      data: {
        title: 'RESORT GALLERY',
        hero: {
          title: 'RESORT GALLERY',
          description: 'Take a visual tour through our luxurious resort, villas, pool area, and surrounding rainforests.',
          bgType: 'image',
          media: galleryHeroImg ? galleryHeroImg.id : null,
        },
      },
      status: 'published',
    });

    await strapi.documents('api::igh-packages-page.igh-packages-page').create({
      data: {
        title: 'IGH Special Packages',
        hero: {
          title: 'IGH Special Packages',
          description: 'Exclusive luxury resort packages tailored for couples, families, and nature enthusiasts.',
          bgType: 'image',
          media: ighHeroImg ? ighHeroImg.id : null,
        },
        featuredPackageTitle: 'HONEYMOON SPECIAL PACKAGE',
      },
      status: 'published',
    });

    await strapi.documents('api::meetings-events-page.meetings-events-page').create({
      data: {
        title: 'meeting and events',
        hero: {
          title: 'meeting and events',
          description: 'State-of-the-art corporate conference halls and grand celebratory venues.',
          bgType: 'image',
          media: meetingsHeroImg ? meetingsHeroImg.id : null,
        },
        dualStory: {
          title: 'Organize World-Class Events',
          description1: 'The Elephant Court offers perfect venue for organizing meetings and events.',
          description2: 'The place comes with a number of perks which takes off the pressure related to arrangements.',
        },
        faq: {
          title: 'Frequently Asked Questions',
          description: 'Everything you need to know about hosting an event at The Elephant Court.',
          faqs: [
            { question: 'What is the maximum guest capacity for events?', answer: 'Our main banquet hall accommodates up to 350 guests.' },
            { question: 'Do you provide in-house catering and audio-visual setup?', answer: 'Yes, we provide complete catering menus and state-of-the-art AV equipment.' },
          ],
        },
      },
      status: 'published',
    });

    await strapi.documents('api::testimonials-page.testimonials-page').create({
      data: {
        title: 'Testimonials',
        hero: {
          title: 'Testimonials',
          description: 'Discover what our cherished guests have to say about their stay with us.',
          bgType: 'image',
          media: testimonialHeroImg ? testimonialHeroImg.id : null,
        },
        pageTitle: 'GUEST REVIEWS & STORIES',
        pageDescription: 'Heartfelt experiences shared by travelers from around the globe.',
      },
      status: 'published',
    });

    await strapi.documents('api::theme-wedding-page.theme-wedding-page').create({
      data: {
        title: 'THEME WEDDING',
        hero: {
          title: 'THEME WEDDING',
          description: 'Celebrate your dream destination wedding surrounded by lush greenery and royal Kerala elegance.',
          bgType: 'image',
          media: weddingHeroImg ? weddingHeroImg.id : null,
        },
        dualStory: {
          title: 'Wedding Ceremonies',
          description1: 'The royal heritage property of the Elephant Court is the finest 5-star resort in Thekkady for destination weddings.',
          description2: 'From on ground handling to decking up the venue, our crew ensures a memorable celebration.',
        },
      },
      status: 'published',
    });

    await strapi.documents('api::yoga-meditation-page.yoga-meditation-page').create({
      data: {
        title: 'YOGA AND MEDITATION',
        hero: {
          title: 'YOGA AND MEDITATION',
          description: 'Harmonize your inner self in peaceful pavilion spaces surrounded by nature.',
          bgType: 'image',
          media: yogaHeroImg ? yogaHeroImg.id : null,
        },
        yogaTitle: 'HOLISTIC MINDFULNESS',
        yogaDescription: 'Daily guided yoga and meditation sessions led by experienced yoga masters.',
      },
      status: 'published',
    });

    await strapi.documents('api::global-seo-analytics.global-seo-analytics').create({
      data: {
        siteName: 'The Elephant Court Resort',
        defaultMetaTitle: 'The Elephant Court | 5 Star Luxury Resort in Thekkady',
        defaultMetaDescription: 'The only 5-star luxury resort in Thekkady, Kerala. Experience pristine nature, Ayurvedic wellness, luxury villas, and authentic fine dining.',
        googleAnalyticsId: 'G-EXAMPLE12345',
        googleTagManagerId: 'GTM-EXAMPLE99',
        searchConsoleVerification: 'google-site-verification-code-here',
        facebookPixelId: '123456789012345',
        headScripts: '<!-- Global Custom Head Scripts (e.g. Meta Verification, Schema Markup) -->',
        bodyStartScripts: '<!-- Global Body Start Scripts (e.g. GTM Noscript) -->',
        bodyEndScripts: '<!-- Global Body End Scripts -->',
      },
      status: 'published',
    });

    await seedGalleryData(strapi);
    await seedAboutPageData(strapi);

    console.log('Successfully completed full Strapi content architecture seeding!');
  } catch (err) {
    console.error('Error during Strapi content seeding:', err);
  }
};

async function seedGalleryData(strapi) {
  try {
    const existingPage = await strapi.documents('api::gallery-page.gallery-page').findMany();
    const existingItems = await strapi.documents('api::gallery-item.gallery-item').findMany();

    console.log(`Checking Strapi gallery seed state: pages=${existingPage.length}, items=${existingItems.length}`);

    console.log('Seeding Gallery Page and Gallery Items in Strapi...');

    const heroImg = await uploadAsset(strapi, '/assets/images/common/hero/gallery-hero.jpg');
    
    const carouselImg1 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-1.jpg');
    const carouselImg2 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-3.jpg');
    const carouselImg3 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-4.jpg');
    const carouselImg4 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-5.jpg');
    const carouselImg5 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-7.jpg');

    const carouselImgIds = [carouselImg1, carouselImg2, carouselImg3, carouselImg4, carouselImg5]
      .filter(Boolean)
      .map(img => img.id);

    if (existingPage.length === 0) {
      await strapi.documents('api::gallery-page.gallery-page').create({
        data: {
          title: 'RESORT GALLERY',
          hero: {
            title: 'RESORT GALLERY',
            description: 'The only five-star luxury resort in Thekkady, where Kerala\'s pristine wilderness meets refined hospitality and unforgettable experiences.',
            bgType: 'image',
            media: heroImg ? heroImg.id : null,
          },
          featuredCarousel: carouselImgIds,
          seo: {
            metaTitle: 'Resort Gallery | The Elephant Court 5 Star Resort Thekkady',
            metaDescription: 'Take a visual tour through our luxury resort, pool villas, rainforest views, and 360 degree virtual tours in Thekkady.',
            canonicalUrl: 'https://www.theelephantcourt.com/gallery',
          },
        },
        status: 'published',
      });
      console.log('Created Gallery Page single type entry in Strapi.');
    }

    const shortImg1 = carouselImg1;
    const shortImg2 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/short-image-2.jpg');
    const shortImg3 = carouselImg2;
    const shortImg4 = carouselImg3;
    const shortImg5 = carouselImg4;
    const shortImg7 = carouselImg5;
    const longImg1 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/long-image-1.jpg');
    const longImg2 = await uploadAsset(strapi, '/assets/images/pages/gallery/resort-gallery/long-image-2.jpg');
    const video1 = await uploadAsset(strapi, '/assets/videos/pages/gallery/resort-gallery/video-1.mp4');

    const itemsToSeed = [
      // RESORT
      {
        title: "Resort Pool & Balcony View",
        alt: "Couple standing on resort balcony overlooking swimming pool",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 1,
        media: shortImg1 ? shortImg1.id : null,
      },
      {
        title: "Night Bonfire & Pool Atmosphere",
        alt: "Guests around outdoor bonfire fire pit at night by resort pool",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 1,
        media: shortImg4 ? shortImg4.id : null,
      },
      {
        title: "Resort Main Building Evening Architecture",
        alt: "Illuminated traditional Kerala resort architecture at dusk",
        category: "resort",
        type: "image",
        aspect: "long",
        column: 1,
        media: longImg1 ? longImg1.id : null,
      },
      {
        title: "Elephant Bathing in Forest River",
        alt: "Video of elephant enjoying water in nature",
        category: "resort",
        type: "video",
        aspect: "short",
        column: 2,
        media: video1 ? video1.id : null,
        poster: shortImg2 ? shortImg2.id : null,
      },
      {
        title: "Aerial View of Resort & Pool",
        alt: "High angle aerial shot of green resort pool and courtyard",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 2,
        media: shortImg3 ? shortImg3.id : null,
      },
      {
        title: "Resort Suite Balcony View",
        alt: "Relaxing private balcony suite view",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 2,
        media: shortImg1 ? shortImg1.id : null,
      },
      {
        title: "Evening Campfire Atmosphere",
        alt: "Warm ambient outdoor lighting and campfire gathering",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 2,
        media: shortImg4 ? shortImg4.id : null,
      },
      {
        title: "Illuminated Resort Entry Walkway",
        alt: "Grand entrance architecture illuminated at night",
        category: "resort",
        type: "image",
        aspect: "long",
        column: 3,
        media: longImg2 ? longImg2.id : null,
      },
      {
        title: "Resort Entrance Driveway",
        alt: "Paved entrance driveway and lush resort facade",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 3,
        media: shortImg5 ? shortImg5.id : null,
      },
      {
        title: "Tropical Greenery & Pool Landscape",
        alt: "Aerial view of lush tropical trees surrounding resort pool",
        category: "resort",
        type: "image",
        aspect: "short",
        column: 3,
        media: shortImg7 ? shortImg7.id : null,
      },

      // DESTINATION
      {
        title: "Periyar Elephant Sanctuary",
        alt: "Wild elephant near water structure in Thekkady",
        category: "destination",
        type: "image",
        aspect: "short",
        column: 1,
        media: shortImg2 ? shortImg2.id : null,
      },
      {
        title: "Thekkady Spice Plantations",
        alt: "Lush green rainforest landscape in Thekkady",
        category: "destination",
        type: "image",
        aspect: "short",
        column: 1,
        media: shortImg3 ? shortImg3.id : null,
      },
      {
        title: "Periyar Tiger Reserve Trails",
        alt: "Rainforest canopy trail in Thekkady",
        category: "destination",
        type: "image",
        aspect: "long",
        column: 2,
        media: longImg1 ? longImg1.id : null,
      },
      {
        title: "Scenic Lake Boating",
        alt: "Picturesque boat ride on Periyar lake",
        category: "destination",
        type: "image",
        aspect: "short",
        column: 3,
        media: shortImg5 ? shortImg5.id : null,
      },
      {
        title: "Highland Tea Gardens",
        alt: "Rolling tea gardens of Western Ghats",
        category: "destination",
        type: "image",
        aspect: "short",
        column: 3,
        media: shortImg7 ? shortImg7.id : null,
      },

      // 360 VIRTUAL TOURS
      {
        title: "Pool Area & Courtyard 360° View",
        alt: "Interactive 360 degree virtual tour of resort swimming pool at night",
        category: "virtual_360",
        type: "virtual_360",
        aspect: "short",
        column: 1,
        media: shortImg4 ? shortImg4.id : null,
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1646809040091!6m8!1m7!1sCAoSLEFGMVFpcE8tYzdpdTI5UU5TTV9TNUNoZFp3UjN1bThtdUpNcEt3WVFTSDJX!2m2!1d9.6063116!2d77.1710775!3f220.768579888607!4f-11.81312996622087!5f0.7820865974627469",
      },
      {
        title: "Luxury Suite Bedroom 360° View",
        alt: "Interactive 360 degree virtual tour of resort suite bedroom interior",
        category: "virtual_360",
        type: "virtual_360",
        aspect: "short",
        column: 1,
        media: shortImg1 ? shortImg1.id : null,
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1655728941781!6m8!1m7!1sCAoSLEFGMVFpcE1sdFZTaEJqTjJnRHRVMnJTWUwzLVpFU1B4Z0FmckxRZU9LblZp!2m2!1d9.6063116!2d77.1710775!3f20!4f10!5f0.7820865974627469",
      },
      {
        title: "Resort Lobby Entrance 360° View",
        alt: "Interactive 360 degree virtual tour of resort main building and entrance",
        category: "virtual_360",
        type: "virtual_360",
        aspect: "long",
        column: 2,
        media: longImg2 ? longImg2.id : null,
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1655729118060!6m8!1m7!1sCAoSLEFGMVFpcFBFZF9XeUNXLWlxR0RMNnJzQzJCU0J1T3YwYy1RSGY5eEx3N2pl!2m2!1d9.6063116!2d77.1710775!3f0!4f10!5f0.7820865974627469",
      },
      {
        title: "Poolside Garden & Deck 360° View",
        alt: "Interactive 360 degree virtual tour of daytime pool deck and tropical garden",
        category: "virtual_360",
        type: "virtual_360",
        aspect: "short",
        column: 3,
        media: shortImg3 ? shortImg3.id : null,
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1655729136634!6m8!1m7!1sCAoSLEFGMVFpcE8zbTk5SUJiRVVDbjRWaFBZdGxyMTVQdEh6U1lTRmp2RVFYLWhP!2m2!1d9.6063116!2d77.1710775!3f47.62058!4f0!5f0.7820865974627469",
      },
      {
        title: "Grand Lobby Interior 360° View",
        alt: "Interactive 360 degree virtual tour of resort main lobby lounge",
        category: "virtual_360",
        type: "virtual_360",
        aspect: "short",
        column: 3,
        media: shortImg5 ? shortImg5.id : null,
        embedUrl: "https://www.google.com/maps/embed?pb=!4v1655729156207!6m8!1m7!1sCAoSLEFGMVFpcE5TV1J0aGxGUmNFeXJBcmJDOERwRFpQN0VxbkhJYmNYVWEtX011!2m2!1d9.6063116!2d77.1710775!3f0!4f10!5f0.7820865974627469",
      },
    ];

    if (existingItems.length < 20) {
      for (const item of existingItems) {
        await strapi.documents('api::gallery-item.gallery-item').delete({
          documentId: item.documentId,
        });
      }
      for (const itemData of itemsToSeed) {
        await strapi.documents('api::gallery-item.gallery-item').create({
          data: itemData,
          status: 'published',
        });
      }
      console.log(`Successfully seeded ${itemsToSeed.length} Gallery Items in Strapi!`);
    }
  } catch (err) {
    console.error('Error seeding gallery data in Strapi:', err);
  }
}

async function seedAboutPageData(strapi) {
  try {
    const existingAbout = await strapi.documents('api::about-page.about-page').findFirst();
    if (existingAbout) {
      console.log('About Page singleType already present in Strapi. Skipping re-seeding to preserve user updates.');
      return;
    }

    console.log('Seeding About Page singleType in Strapi...');

    // Upload assets
    const heroBg = await uploadAsset(strapi, '/assets/images/common/hero/about-hero.png');
    const largeImg = await uploadAsset(strapi, '/assets/images/pages/about/aboutus/large-image.png');
    const smallImg = await uploadAsset(strapi, '/assets/images/pages/about/aboutus/small-image.jpg');
    const aboutVid = await uploadAsset(strapi, '/assets/videos/pages/about/aboutus/about-video.mp4');
    const whyLeftImg = await uploadAsset(strapi, '/assets/images/pages/about/whychoose/left-image1.png');
    const whyRightImg = await uploadAsset(strapi, '/assets/images/pages/about/whychoose/right-image.jpg');

    // Get published testimonials & blogs to link
    const testimonials = await strapi.documents('api::testimonial.testimonial').findMany({ status: 'published' });
    const blogs = await strapi.documents('api::blog-post.blog-post').findMany({ status: 'published' });

    const testimonialIds = testimonials.map(t => t.id);
    const blogIds = blogs.map(b => b.id);

    const aboutData = {
      title: "The Elephant Court",
      hero: {
        title: "The Elephant Court",
        sub_title: "best five star resort in thekkady",
        description: "The only five-star luxury resort in Thekkady, where Kerala's pristine wilderness meets refined hospitality and unforgettable experiences.",
        bgType: "image",
        media: heroBg ? heroBg.id : null,
      },
      moreAboutTitle: "MORE ABOUT US",
      moreAboutSubTitle: "",
      moreAboutLeftDescription: "Wake up to the calls of birds and monkeys in a magical abode called ‘The Elephant Court’; a luxury resort that’s brilliantly designed and sustainably minded. From the iconic pool to endemic gardens and posh suites, the Elephant Court is grande-dame among Kerala’s upscale resorts. It is everything you desire about a leisure and wellness holiday.",
      moreAboutRightDescription: "The Cacophonous Cries And Monkey-Swings Of Nilgiri Langurs And Bonnet Macaques Among The Giant Palm Trees And Silk Cotton Trees Rules Major Part Of Your Elephant Court Life. This Nocturnal Soundscape Is Indeed A Luxury Rainforest Escape. Indeed A Setting For The Well-Heeled And Tasteful. Garden Corridors And Rare Tropical Rainforest Trees, Lovingly Tended, Arrives At The Same Place Abundantly. Be Charmed By The Harmonious Pace Of Life While Enjoying The Legendary Gracious Hospitality Of Elephant Court, The Only Classified 5 Star Hotel In Thekkady.",
      moreAboutRightLargeImage: largeImg ? largeImg.id : null,
      moreAboutRightSmallImage: smallImg ? smallImg.id : null,
      moreAboutLeftVideo: aboutVid ? aboutVid.id : null,
      whyChooseTitle: "Why Choose Our Resort.",
      whyChooseSubTitle: "",
      whyChooseLeftImage: whyLeftImg ? whyLeftImg.id : null,
      whyChooseLeftAlt: "Herds of elephants in Periyar rainforest",
      whyChooseLeftDescription: "The elephant court is a magnificent property hidden in the heart of periyar's fascinating ecosystem. it being the only classified 5 star hotel in thekkady , does not take its status for granted. there is always a synergy functioning in-depth to concoct the best of guest experience. life should be better when you check in; every detail which includes location, character, soul, facilities, seclusion and romance will take care of that. it is all about attention to detail at this exquisite, deeply opulent rainforest destination resort. its casa principal - the lobby is a lavish neoclassical house in an imposing palatial structure which perfectly translates the magnificence and enormousness of kerala's heritage architecture.",
      whyChooseRightImage: whyRightImg ? whyRightImg.id : null,
      whyChooseRightAlt: "Palatial resort lobby with bamboo architecture",
      whyChooseRightDescription: "The palatial lobby also houses 'patio', the main restaurant; 'elephano' a 1685 square feet, theatre style conference room and 'ayur hasthi' our ayurveda wellness abode. the pathway to the rooms is the noisiest nook in the resort, thanks to the ever chirpy love birds. the stone pathway opens into a large enclosure with a luxurious pool that separates the lobby, restaurant and recreational spaces from the lodgings. our pool with jacuzzi is a space loved by our guest, for its vastness and serenity. there is a paddling pool along with it for children. the 3.5-acres land is home to 65 air-conditioned rooms in different terraces connected through garden pathways.",
      whyChooseItems: [
        {
          alt: "Herds of elephants in Periyar rainforest",
          description: "The elephant court is a magnificent property hidden in the heart of periyar's fascinating ecosystem. it being the only classified 5 star hotel in thekkady , does not take its status for granted. there is always a synergy functioning in-depth to concoct the best of guest experience. life should be better when you check in; every detail which includes location, character, soul, facilities, seclusion and romance will take care of that. it is all about attention to detail at this exquisite, deeply opulent rainforest destination resort. its casa principal - the lobby is a lavish neoclassical house in an imposing palatial structure which perfectly translates the magnificence and enormousness of kerala's heritage architecture."
        },
        {
          alt: "Palatial resort lobby with bamboo architecture",
          description: "The palatial lobby also houses 'patio', the main restaurant; 'elephano' a 1685 square feet, theatre style conference room and 'ayur hasthi' our ayurveda wellness abode. the pathway to the rooms is the noisiest nook in the resort, thanks to the ever chirpy love birds. the stone pathway opens into a large enclosure with a luxurious pool that separates the lobby, restaurant and recreational spaces from the lodgings. our pool with jacuzzi is a space loved by our guest, for its vastness and serenity. there is a paddling pool along with it for children. the 3.5-acres land is home to 65 air-conditioned rooms in different terraces connected through garden pathways."
        }
      ],
      testimonials: {
        sub_title: "TESTIMONIALS",
        main_title: "WHAT OUR GUEST SAY ABOUT US",
        testimonials: testimonialIds,
      },
      blogs: {
        sub_title: "NEWS & BLOGS",
        main_title: "OUR BLOGS",
        button: { text: "VIEW ALL BLOGS", href: "/blogs" },
        blogs: blogIds,
      },
      seo: {
        metaTitle: "About Us | The Elephant Court - 5 Star Luxury Resort in Thekkady",
        metaDescription: "Learn more about The Elephant Court, the only 5-star luxury resort in Thekkady, Kerala. Pristine wilderness meets luxury hospitality.",
        canonicalUrl: "https://www.theelephantcourt.com/about",
      }
    };

    if (existingAbout) {
      await strapi.documents('api::about-page.about-page').update({
        documentId: existingAbout.documentId,
        data: aboutData,
        status: 'published',
      });
      console.log('Updated & published About Page singleType data in Strapi.');
    } else {
      await strapi.documents('api::about-page.about-page').create({
        data: aboutData,
        status: 'published',
      });
      console.log('Created & published About Page singleType data in Strapi.');
    }
  } catch (err) {
    console.error('Error seeding About Page data in Strapi:', err);
  }
}



