import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEventSchema,
  buildProductSchema,
  buildSiteGraph,
  buildSocialMetaTags,
  buildVendorSchema,
  requireHttpsUrl,
} from './ACoolStructuredData.js';

test('requireHttpsUrl rejects non-HTTPS destinations', () => {
  assert.throws(() => requireHttpsUrl('http://example.com'), /invalid_url/);
  assert.equal(requireHttpsUrl('https://example.com/path'), 'https://example.com/path');
});

test('social metadata includes required Open Graph properties and canonical URL', () => {
  const tags = buildSocialMetaTags({
    title: 'ACoolCOLLECTOR Card Show Mode',
    description: 'Capture cards, vendors, prices, and show context.',
    canonicalUrl: 'https://acoolcollector.com/card-shows',
    imageUrl: 'https://acoolcollector.com/social/card-shows.png',
    imageAlt: 'ACoolCOLLECTOR card-show dashboard',
  }).join('\n');

  assert.match(tags, /property="og:title"/);
  assert.match(tags, /property="og:type" content="website"/);
  assert.match(tags, /property="og:image"/);
  assert.match(tags, /property="og:url"/);
  assert.match(tags, /rel="canonical"/);
  assert.match(tags, /name="twitter:card"/);
});

test('product schema withholds Offer until the listing is published', () => {
  const draft = buildProductSchema({
    name: 'Example Card',
    description: 'Private listing draft.',
    url: 'https://acoolcollector.com/items/example',
    imageUrls: ['https://acoolcollector.com/images/example.png'],
    priceCents: 10000,
    published: false,
  });
  assert.equal('offers' in draft, false);

  const live = buildProductSchema({
    name: 'Example Card',
    description: 'Approved listing.',
    url: 'https://acoolcollector.com/items/example',
    imageUrls: ['https://acoolcollector.com/images/example.png'],
    priceCents: 10000,
    published: true,
  });
  assert.deepEqual((live.offers as Record<string, unknown>).price, '100.00');
});

test('event schema uses official external ticket URL without claiming checkout ownership', () => {
  const event = buildEventSchema({
    name: 'Example Card Show',
    url: 'https://acoolcollector.com/events/example',
    startDate: '2026-10-10T10:00:00-04:00',
    venueName: 'Example Convention Center',
    city: 'Baltimore',
    region: 'MD',
    countryCode: 'US',
    ticketUrl: 'https://tickets.example.com/example',
    ticketPriceCents: 2500,
  });
  assert.equal((event.offers as Record<string, unknown>).url, 'https://tickets.example.com/example');
});

test('vendor schema includes only supplied verified sameAs URLs and rating evidence', () => {
  const vendor = buildVendorSchema({
    name: 'Example Cards',
    url: 'https://acoolcollector.com/vendors/example-cards',
    verifiedSameAs: ['https://www.youtube.com/@examplecards'],
    aggregateRating: { ratingValue: 4.8, reviewCount: 12 },
  });
  assert.deepEqual(vendor.sameAs, ['https://www.youtube.com/@examplecards']);
  assert.equal((vendor.aggregateRating as Record<string, unknown>).reviewCount, 12);
});

test('site graph identifies organization, website, and application', () => {
  const graph = buildSiteGraph('https://acoolcollector.com');
  assert.equal(graph['@graph'].length, 3);
  assert.equal(graph['@graph'][0]['@type'], 'Organization');
  assert.equal(graph['@graph'][1]['@type'], 'WebSite');
  assert.equal(graph['@graph'][2]['@type'], 'SoftwareApplication');
});
