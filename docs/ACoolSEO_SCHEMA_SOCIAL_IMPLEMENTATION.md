# ACoolCOLLECTOR SEO, Schema.org, Open Graph, and Social Metadata

## Objective

Every public page must publish accurate, evidence-backed metadata that matches the visible page. Structured data is not a place to insert hidden claims, invented inventory, unsupported ratings, false availability, or unapproved affiliations.

## Canonical Page Types

| ACoolCOLLECTOR page | Schema.org type |
|---|---|
| Home | `Organization`, `WebSite`, `SoftwareApplication` |
| Search | `WebSite` with `SearchAction` |
| Approved collectible listing | `Product` with `Offer` |
| Set or checklist | `CollectionPage` and `ItemList` |
| Card show | `Event` with `Place`, `Organization`, and approved `Offer` |
| Vendor profile | `Store`, `LocalBusiness`, or `Organization` |
| Review page | `Review` and eligible `AggregateRating` |
| Article or guide | `Article` or `TechArticle` |
| FAQ page | `FAQPage` only when the questions and answers are visible |
| Breadcrumbs | `BreadcrumbList` |
| Mobile/web product | `SoftwareApplication` or `MobileApplication` |

## Product Rules

A `Product` page may include an `Offer` only when:

- the asset is approved and published;
- identity and ownership are verified;
- the price and currency are current;
- the page is publicly accessible;
- availability matches the actual inventory state;
- seller identity and return terms are correct;
- the image is authorized for public use.

Private, draft, reserved, sold, withdrawn, or rejected records must not emit an in-stock public offer.

## Event Rules

Every `Event` record must use:

- exact start and end date precision actually confirmed;
- local time and time-zone information;
- verified venue and address;
- current event status;
- organizer identity;
- official ticket destination;
- ticket price and availability only when verified;
- source and last verification time.

ACoolCOLLECTOR may describe an official external checkout, but must not imply it is the ticket seller unless a contract and integration establish that role.

## Vendor and Rating Rules

A vendor page may publish `AggregateRating` only when:

- the rating is based on eligible published reviews;
- the review count is nonzero;
- the displayed rating equals the structured value;
- moderation applies equally to positive and negative reviews;
- conflicts, incentives, and relationships are disclosed;
- the vendor has a response, correction, and appeal path;
- insufficient-evidence profiles display `Not Yet Rated` and omit `AggregateRating`.

Follower counts, likes, views, and subscribers do not become reputation ratings.

## Organization Graph

The home-page JSON-LD graph should contain stable identifiers:

```text
https://acoolcollector.com/#organization
https://acoolcollector.com/#website
https://acoolcollector.com/#application
```

Use the same identifiers wherever the organization, publisher, website, and application are referenced.

Do not add `sameAs` links until each public profile is verified as an official ACoolCOLLECTOR account.

## Open Graph and Social Metadata

Every indexable public page needs:

```html
<title>…</title>
<meta name="description" content="…">
<link rel="canonical" href="https://…">
<meta name="robots" content="index,follow,max-image-preview:large">
<meta property="og:title" content="…">
<meta property="og:type" content="website">
<meta property="og:url" content="https://…">
<meta property="og:image" content="https://…">
<meta property="og:image:alt" content="…">
<meta property="og:description" content="…">
<meta property="og:site_name" content="ACoolCOLLECTOR">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
```

The Open Graph protocol requires `og:title`, `og:type`, `og:image`, and `og:url`. Images must be public, stable, correctly sized, accessible to crawlers, and free of private card or user evidence.

## Social Image Standard

Create approved share images for:

- default site;
- card shows;
- vendor profiles;
- release radar;
- set checklists;
- deck goals;
- published product listings;
- public promotions;
- articles and reports.

Recommended working size: 1200 × 630 pixels. Keep critical text away from edges. Include visible ACoolCOLLECTOR branding and alt text.

## Technical SEO

Implement:

- HTTPS-only canonical URLs;
- one canonical per page;
- server-rendered or reliably prerendered metadata;
- XML sitemap indexes by content type;
- image sitemap entries for public authorized images;
- robots.txt with private and authenticated paths disallowed;
- normalized slugs;
- 301 redirects for replaced URLs;
- localized `hreflang` only after translated pages exist;
- pagination and filter canonicalization;
- noindex for search-result combinations that create low-value duplicates;
- structured-data validation in CI;
- broken-link and canonical tests;
- Core Web Vitals monitoring;
- Search Console verification and sitemap submission.

## Robots Baseline

Private areas must not rely on robots.txt for security. They still require authentication, authorization, RLS, and private storage.

Suggested public crawler directives:

```text
User-agent: *
Allow: /
Disallow: /app/
Disallow: /account/
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Sitemap: https://acoolcollector.com/sitemap-index.xml
```

## Metadata API

The ACoolOMNI endpoint:

```text
GET  /api/v1/metadata/site
POST /api/v1/metadata/build
```

returns approved metadata structures for the frontend.

The builder:

- enforces HTTPS URLs;
- escapes HTML attributes;
- withholds Product `Offer` data for unpublished items;
- accepts only verified public `sameAs` links;
- builds Event, Product, Vendor, Breadcrumb, Organization, WebSite, and SoftwareApplication structures;
- includes Open Graph and Twitter-compatible metadata.

## Validation Pipeline

For each public route:

1. render the route in CI;
2. parse title, description, canonical, robots, Open Graph, and JSON-LD;
3. validate required fields;
4. compare structured price, availability, dates, rating, and URL to visible data;
5. reject private URLs or signed-media URLs;
6. reject non-HTTPS canonical and image URLs;
7. reject rating markup when evidence is insufficient;
8. reject affiliation claims without an approved program record;
9. store validation result and timestamp;
10. prevent release on critical errors.

## Meta and Social Platform Boundary

Use Open Graph for share previews and official Meta APIs only when approved for a specific purpose.

Do not:

- scrape private Instagram or Facebook data;
- import private messages;
- infer vendor identity from hidden account information;
- upload customer contact lists without a documented lawful basis and consent;
- claim Meta verification, partnership, or endorsement without approval.

## Launch Gate

- structured data matches visible content;
- Google Rich Results and Schema validators show no critical errors;
- Open Graph previews render correctly;
- all public images are authorized;
- sitemap and robots files are deployed;
- private routes remain inaccessible without authorization;
- vendor ratings satisfy evidence policy;
- ticket and affiliate disclosures are visible;
- canonical and redirect tests pass;
- Search Console is verified;
- Ruth Review approves public claims.
