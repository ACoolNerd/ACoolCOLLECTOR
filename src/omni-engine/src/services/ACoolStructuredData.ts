export type SocialMetadataInput = {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  imageAlt: string;
  type?: 'website' | 'article' | 'product';
  locale?: string;
  siteName?: string;
  robots?: string;
};

export type ProductSchemaInput = {
  name: string;
  description: string;
  url: string;
  imageUrls: string[];
  sku?: string;
  brand?: string;
  conditionUrl?: string;
  priceCents?: number;
  currency?: string;
  availabilityUrl?: string;
  sellerName?: string;
  published: boolean;
  aggregateRating?: { ratingValue: number; reviewCount: number };
};

export type EventSchemaInput = {
  name: string;
  description?: string;
  url: string;
  imageUrls?: string[];
  startDate: string;
  endDate?: string;
  eventStatusUrl?: string;
  attendanceModeUrl?: string;
  venueName?: string;
  streetAddress?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  countryCode?: string;
  organizerName?: string;
  organizerUrl?: string;
  ticketUrl?: string;
  ticketPriceCents?: number;
  currency?: string;
  ticketAvailabilityUrl?: string;
};

export type VendorSchemaInput = {
  name: string;
  description?: string;
  url: string;
  logoUrl?: string;
  imageUrl?: string;
  businessType?: 'Store' | 'LocalBusiness' | 'Organization';
  publicEmail?: string;
  publicPhone?: string;
  city?: string;
  region?: string;
  countryCode?: string;
  verifiedSameAs?: string[];
  aggregateRating?: { ratingValue: number; reviewCount: number };
};

const schemaContext = 'https://schema.org';

export const requireHttpsUrl = (value: string, field = 'url'): string => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`invalid_${field}`);
  }
  if (parsed.protocol !== 'https:') throw new Error(`invalid_${field}`);
  return parsed.toString();
};

const cleanText = (value: string, max: number): string => {
  const result = value.replace(/\s+/g, ' ').trim();
  if (!result) throw new Error('metadata_text_required');
  return result.slice(0, max);
};

const escapeAttribute = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/"/g, '&quot;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

export const buildSocialMetaTags = (input: SocialMetadataInput): string[] => {
  const title = cleanText(input.title, 120);
  const description = cleanText(input.description, 300);
  const canonical = requireHttpsUrl(input.canonicalUrl, 'canonical_url');
  const image = requireHttpsUrl(input.imageUrl, 'image_url');
  const alt = cleanText(input.imageAlt, 200);
  const siteName = cleanText(input.siteName ?? 'ACoolCOLLECTOR', 80);
  const locale = input.locale ?? 'en_US';
  const robots = input.robots ?? 'index,follow,max-image-preview:large';
  const ogType = input.type === 'article' ? 'article' : input.type === 'product' ? 'product' : 'website';

  const tag = (property: string, content: string) =>
    `<meta property="${escapeAttribute(property)}" content="${escapeAttribute(content)}">`;
  const nameTag = (name: string, content: string) =>
    `<meta name="${escapeAttribute(name)}" content="${escapeAttribute(content)}">`;

  return [
    `<title>${escapeAttribute(title)}</title>`,
    nameTag('description', description),
    nameTag('robots', robots),
    `<link rel="canonical" href="${escapeAttribute(canonical)}">`,
    tag('og:title', title),
    tag('og:type', ogType),
    tag('og:url', canonical),
    tag('og:image', image),
    tag('og:image:alt', alt),
    tag('og:description', description),
    tag('og:site_name', siteName),
    tag('og:locale', locale),
    nameTag('twitter:card', 'summary_large_image'),
    nameTag('twitter:title', title),
    nameTag('twitter:description', description),
    nameTag('twitter:image', image),
    nameTag('twitter:image:alt', alt),
  ];
};

export const buildSiteGraph = (baseUrl: string) => {
  const base = requireHttpsUrl(baseUrl, 'base_url').replace(/\/$/, '');
  return {
    '@context': schemaContext,
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${base}/#organization`,
        name: 'ACoolCOLLECTOR',
        url: base,
        slogan: 'Cards today. Legacy tomorrow.',
        description: 'An AI-native operating system for collectors, vendors, card shows, collection goals, deck goals, pricing evidence, and collectibles commerce.',
      },
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: base,
        name: 'ACoolCOLLECTOR',
        publisher: { '@id': `${base}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${base}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${base}/#application`,
        name: 'ACoolCOLLECTOR',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web, iOS, Android',
        url: base,
        publisher: { '@id': `${base}/#organization` },
      },
    ],
  };
};

export const buildProductSchema = (input: ProductSchemaInput) => {
  const schema: Record<string, unknown> = {
    '@context': schemaContext,
    '@type': 'Product',
    name: cleanText(input.name, 180),
    description: cleanText(input.description, 1000),
    url: requireHttpsUrl(input.url),
    image: input.imageUrls.map((url) => requireHttpsUrl(url, 'image_url')),
    ...(input.sku ? { sku: cleanText(input.sku, 100) } : {}),
    ...(input.brand ? { brand: { '@type': 'Brand', name: cleanText(input.brand, 120) } } : {}),
  };

  if (input.aggregateRating && input.aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.aggregateRating.ratingValue,
      reviewCount: input.aggregateRating.reviewCount,
    };
  }

  if (input.published && input.priceCents !== undefined) {
    schema.offers = {
      '@type': 'Offer',
      url: requireHttpsUrl(input.url),
      priceCurrency: input.currency ?? 'USD',
      price: (input.priceCents / 100).toFixed(2),
      availability: input.availabilityUrl ?? 'https://schema.org/InStock',
      itemCondition: input.conditionUrl,
      seller: input.sellerName ? { '@type': 'Organization', name: cleanText(input.sellerName, 160) } : undefined,
    };
  }

  return schema;
};

export const buildEventSchema = (input: EventSchemaInput) => {
  const schema: Record<string, unknown> = {
    '@context': schemaContext,
    '@type': 'Event',
    name: cleanText(input.name, 180),
    url: requireHttpsUrl(input.url),
    startDate: input.startDate,
    ...(input.endDate ? { endDate: input.endDate } : {}),
    ...(input.description ? { description: cleanText(input.description, 1000) } : {}),
    ...(input.imageUrls?.length ? { image: input.imageUrls.map((url) => requireHttpsUrl(url, 'image_url')) } : {}),
    eventStatus: input.eventStatusUrl ?? 'https://schema.org/EventScheduled',
    eventAttendanceMode: input.attendanceModeUrl ?? 'https://schema.org/OfflineEventAttendanceMode',
  };

  if (input.venueName) {
    schema.location = {
      '@type': 'Place',
      name: cleanText(input.venueName, 180),
      address: {
        '@type': 'PostalAddress',
        streetAddress: input.streetAddress,
        addressLocality: input.city,
        addressRegion: input.region,
        postalCode: input.postalCode,
        addressCountry: input.countryCode,
      },
    };
  }

  if (input.organizerName) {
    schema.organizer = {
      '@type': 'Organization',
      name: cleanText(input.organizerName, 180),
      ...(input.organizerUrl ? { url: requireHttpsUrl(input.organizerUrl, 'organizer_url') } : {}),
    };
  }

  if (input.ticketUrl) {
    schema.offers = {
      '@type': 'Offer',
      url: requireHttpsUrl(input.ticketUrl, 'ticket_url'),
      availability: input.ticketAvailabilityUrl ?? 'https://schema.org/InStock',
      ...(input.ticketPriceCents !== undefined ? {
        price: (input.ticketPriceCents / 100).toFixed(2),
        priceCurrency: input.currency ?? 'USD',
      } : {}),
    };
  }

  return schema;
};

export const buildVendorSchema = (input: VendorSchemaInput) => {
  const sameAs = (input.verifiedSameAs ?? []).map((url) => requireHttpsUrl(url, 'same_as_url'));
  const schema: Record<string, unknown> = {
    '@context': schemaContext,
    '@type': input.businessType ?? 'Store',
    name: cleanText(input.name, 180),
    url: requireHttpsUrl(input.url),
    ...(input.description ? { description: cleanText(input.description, 1000) } : {}),
    ...(input.logoUrl ? { logo: requireHttpsUrl(input.logoUrl, 'logo_url') } : {}),
    ...(input.imageUrl ? { image: requireHttpsUrl(input.imageUrl, 'image_url') } : {}),
    ...(input.publicEmail ? { email: input.publicEmail } : {}),
    ...(input.publicPhone ? { telephone: input.publicPhone } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  if (input.city || input.region || input.countryCode) {
    schema.address = {
      '@type': 'PostalAddress',
      addressLocality: input.city,
      addressRegion: input.region,
      addressCountry: input.countryCode,
    };
  }

  if (input.aggregateRating && input.aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: input.aggregateRating.ratingValue,
      reviewCount: input.aggregateRating.reviewCount,
    };
  }

  return schema;
};

export const buildBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': schemaContext,
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: cleanText(item.name, 120),
    item: requireHttpsUrl(item.url),
  })),
});
