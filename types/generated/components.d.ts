import type { Schema, Struct } from '@strapi/strapi';

export interface ElementsAmenityItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_amenity_items';
  info: {
    description: 'Room or facility amenity with icon key or SVG upload';
    displayName: 'Amenity Item';
    icon: 'star';
  };
  attributes: {
    iconImage: Schema.Attribute.Media<'images'>;
    iconName: Schema.Attribute.Enumeration<
      [
        'coffee',
        'wifi',
        'bed',
        'sqft',
        'balcony',
        'room_service',
        'tv',
        'garden_view',
        'mini_bar',
        'safe_locker',
        'bath',
        'pool',
        'gym',
        'ac',
        'parking',
        'shuttle',
        'breakfast',
        'sitout',
      ]
    >;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsBreadcrumbItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_breadcrumb_items';
  info: {
    displayName: 'Breadcrumb Item';
    icon: 'link';
  };
  attributes: {};
}

export interface ElementsButton extends Struct.ComponentSchema {
  collectionName: 'components_elements_buttons';
  info: {
    displayName: 'Button';
    icon: 'cursor';
  };
  attributes: {
    href: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface ElementsDistanceItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_distance_items';
  info: {
    displayName: 'Distance Item';
    icon: 'pin';
  };
  attributes: {
    name: Schema.Attribute.String;
  };
}

export interface ElementsFacilityItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_facility_items';
  info: {
    description: 'Facility item with title, description, image, and link';
    displayName: 'Facility Item';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    left_image: Schema.Attribute.Media<'images'>;
    right_image: Schema.Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    >;
    title: Schema.Attribute.String;
  };
}

export interface ElementsFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_faq_items';
  info: {
    displayName: 'FAQ Item';
    icon: 'question';
  };
  attributes: {
    answer: Schema.Attribute.Text & Schema.Attribute.Required;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ElementsLocationItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_location_items';
  info: {
    displayName: 'Location Item';
    icon: 'pin';
  };
  attributes: {
    address: Schema.Attribute.Text;
    email: Schema.Attribute.String;
    mapUrl: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsMeetingEventItem extends Struct.ComponentSchema {
  collectionName: 'components_elements_meeting_event_items';
  info: {
    description: 'Meeting or event item with title, description, gallery images, and link';
    displayName: 'Meeting Event Item';
    icon: 'calendar';
  };
  attributes: {
    description: Schema.Attribute.Text;
    href: Schema.Attribute.String;
    images: Schema.Attribute.Media<'images', true>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsPackageTariff extends Struct.ComponentSchema {
  collectionName: 'components_elements_package_tariffs';
  info: {
    displayName: 'Package Tariff';
    icon: 'shopping-cart';
  };
  attributes: {
    extraDetails: Schema.Attribute.JSON;
    inclusions: Schema.Attribute.JSON;
    landscapeImage: Schema.Attribute.Media<'images'>;
    portraitLeftImage: Schema.Attribute.Media<'images'>;
    portraitRightImage: Schema.Attribute.Media<'images'>;
    price: Schema.Attribute.String;
    validity: Schema.Attribute.String;
  };
}

export interface ElementsRoomAboutSlide extends Struct.ComponentSchema {
  collectionName: 'components_elements_room_about_slides';
  info: {
    displayName: 'Room About Slide';
    icon: 'landscape';
  };
  attributes: {
    description: Schema.Attribute.Text;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsSectionTitle extends Struct.ComponentSchema {
  collectionName: 'components_elements_section_titles';
  info: {
    displayName: 'Section Title';
    icon: 'heading';
  };
  attributes: {
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface ElementsSpaOffer extends Struct.ComponentSchema {
  collectionName: 'components_elements_spa_offers';
  info: {
    displayName: 'Spa Offer';
    icon: 'gift';
  };
  attributes: {
    description: Schema.Attribute.Text;
    discount: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface ElementsVenueSpec extends Struct.ComponentSchema {
  collectionName: 'components_elements_venue_specs';
  info: {
    displayName: 'Venue Specification Item';
    icon: 'house';
  };
  attributes: {
    capacity: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    dimensions: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String;
  };
}

export interface SectionsAbout extends Struct.ComponentSchema {
  collectionName: 'components_sections_abouts';
  info: {
    displayName: 'About Section';
    icon: 'information';
  };
  attributes: {
    button: Schema.Attribute.Component<'elements.button', false>;
    description: Schema.Attribute.Text;
    image_left: Schema.Attribute.Media<'images'>;
    image_right: Schema.Attribute.Media<'images'>;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsActivitiesSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_activities_sections';
  info: {
    displayName: 'Activities Section';
    icon: 'heart';
  };
  attributes: {
    activities: Schema.Attribute.Relation<
      'oneToMany',
      'api::activity.activity'
    >;
    button: Schema.Attribute.Component<'elements.button', false>;
    description: Schema.Attribute.Text;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsBlogsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_blogs_sections';
  info: {
    displayName: 'Blogs Section';
    icon: 'feather';
  };
  attributes: {
    blogs: Schema.Attribute.Relation<'oneToMany', 'api::blog-post.blog-post'>;
    button: Schema.Attribute.Component<'elements.button', false>;
    main_title: Schema.Attribute.String;
    sub_title: Schema.Attribute.String;
  };
}

export interface SectionsDestinationsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_destinations_sections';
  info: {
    displayName: 'Destinations Section';
    icon: 'pin';
  };
  attributes: {
    bg_video: Schema.Attribute.Media<'videos' | 'files'>;
    destinations: Schema.Attribute.Relation<
      'oneToMany',
      'api::destination.destination'
    >;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsDualStory extends Struct.ComponentSchema {
  collectionName: 'components_sections_dual_stories';
  info: {
    displayName: 'Dual Story Section';
    icon: 'book';
  };
  attributes: {
    description1: Schema.Attribute.Text;
    description2: Schema.Attribute.Text;
    leftImage: Schema.Attribute.Media<'images'>;
    leftImageAlt: Schema.Attribute.String;
    rightImage: Schema.Attribute.Media<'images'>;
    rightImageAlt: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsFacilitiesSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_facilities_sections';
  info: {
    displayName: 'Facilities Section';
    icon: 'star';
  };
  attributes: {
    button: Schema.Attribute.Component<'elements.button', false>;
    description: Schema.Attribute.Text;
    facilities: Schema.Attribute.Component<'elements.facility-item', true>;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_heroes';
  info: {
    displayName: 'Hero Section';
    icon: 'picture';
  };
  attributes: {
    description: Schema.Attribute.Text;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
    video: Schema.Attribute.Media<'videos' | 'files'>;
  };
}

export interface SectionsImageFaq extends Struct.ComponentSchema {
  collectionName: 'components_sections_image_faqs';
  info: {
    displayName: 'Image FAQ Section';
    icon: 'question';
  };
  attributes: {
    description: Schema.Attribute.Text;
    faqs: Schema.Attribute.Component<'elements.faq-item', true>;
    image: Schema.Attribute.Media<'images'>;
    imageAlt: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsInnerHero extends Struct.ComponentSchema {
  collectionName: 'components_sections_inner_heroes';
  info: {
    displayName: 'Inner Page Hero';
    icon: 'picture';
  };
  attributes: {
    bgType: Schema.Attribute.Enumeration<['image', 'video']> &
      Schema.Attribute.DefaultTo<'image'>;
    description: Schema.Attribute.Text;
    media: Schema.Attribute.Media<'images' | 'videos'>;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsLivingSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_living_sections';
  info: {
    displayName: 'Living Section';
    icon: 'house';
  };
  attributes: {
    living_spaces: Schema.Attribute.Relation<
      'oneToMany',
      'api::living-space.living-space'
    >;
    sub_title: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsMeetingsEventsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_meetings_events_sections';
  info: {
    displayName: 'Meetings & Events Section';
    icon: 'calendar';
  };
  attributes: {
    meetings_events: Schema.Attribute.Component<
      'elements.meeting-event-item',
      true
    >;
  };
}

export interface SectionsTestimonialsSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials_sections';
  info: {
    displayName: 'Testimonials Section';
    icon: 'quote';
  };
  attributes: {
    main_title: Schema.Attribute.String;
    sub_title: Schema.Attribute.String;
    testimonials: Schema.Attribute.Relation<
      'oneToMany',
      'api::testimonial.testimonial'
    >;
  };
}

export interface SectionsVenueSpecifications extends Struct.ComponentSchema {
  collectionName: 'components_sections_venue_specifications';
  info: {
    displayName: 'Venue Specifications Section';
    icon: 'house';
  };
  attributes: {
    description: Schema.Attribute.Text;
    specs: Schema.Attribute.Component<'elements.venue-spec', true>;
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsVisitUs extends Struct.ComponentSchema {
  collectionName: 'components_sections_visit_uses';
  info: {
    displayName: 'Visit Us Section';
    icon: 'paper-plane';
  };
  attributes: {
    distances: Schema.Attribute.Component<'elements.distance-item', true>;
    email: Schema.Attribute.String;
    left_box_title: Schema.Attribute.String;
    phone: Schema.Attribute.String;
    right_box_title: Schema.Attribute.String;
    route_text: Schema.Attribute.String;
    route_url: Schema.Attribute.String;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Comprehensive SEO and custom head/body script fields';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalUrl: Schema.Attribute.String;
    customBodyScripts: Schema.Attribute.Text;
    customHeadScripts: Schema.Attribute.Text;
    metaDescription: Schema.Attribute.Text;
    metaImage: Schema.Attribute.Media<'images'>;
    metaKeywords: Schema.Attribute.String;
    metaRobots: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'elements.amenity-item': ElementsAmenityItem;
      'elements.breadcrumb-item': ElementsBreadcrumbItem;
      'elements.button': ElementsButton;
      'elements.distance-item': ElementsDistanceItem;
      'elements.facility-item': ElementsFacilityItem;
      'elements.faq-item': ElementsFaqItem;
      'elements.location-item': ElementsLocationItem;
      'elements.meeting-event-item': ElementsMeetingEventItem;
      'elements.package-tariff': ElementsPackageTariff;
      'elements.room-about-slide': ElementsRoomAboutSlide;
      'elements.section-title': ElementsSectionTitle;
      'elements.spa-offer': ElementsSpaOffer;
      'elements.venue-spec': ElementsVenueSpec;
      'sections.about': SectionsAbout;
      'sections.activities-section': SectionsActivitiesSection;
      'sections.blogs-section': SectionsBlogsSection;
      'sections.destinations-section': SectionsDestinationsSection;
      'sections.dual-story': SectionsDualStory;
      'sections.facilities-section': SectionsFacilitiesSection;
      'sections.hero': SectionsHero;
      'sections.image-faq': SectionsImageFaq;
      'sections.inner-hero': SectionsInnerHero;
      'sections.living-section': SectionsLivingSection;
      'sections.meetings-events-section': SectionsMeetingsEventsSection;
      'sections.testimonials-section': SectionsTestimonialsSection;
      'sections.venue-specifications': SectionsVenueSpecifications;
      'sections.visit-us': SectionsVisitUs;
      'shared.seo': SharedSeo;
    }
  }
}
