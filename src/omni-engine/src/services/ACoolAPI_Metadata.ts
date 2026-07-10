import { Router } from 'express';
import {
  buildBreadcrumbSchema,
  buildEventSchema,
  buildProductSchema,
  buildSiteGraph,
  buildSocialMetaTags,
  buildVendorSchema,
} from './ACoolStructuredData.js';

const router = Router();

const configuredBaseUrl = () => {
  const value = process.env.PUBLIC_SITE_URL || process.env.APP_BASE_URL;
  if (!value || !value.startsWith('https://')) {
    throw new Error('public_site_url_not_configured');
  }
  return value.replace(/\/$/, '');
};

router.get('/site', (_request, response) => {
  try {
    const base = configuredBaseUrl();
    return response.json({
      social_tags: buildSocialMetaTags({
        title: 'ACoolCOLLECTOR — Cards today. Legacy tomorrow.',
        description: 'The AI-native collector operating system for cards, collectibles, card shows, vendors, pricing evidence, collection goals, deck goals, and commerce.',
        canonicalUrl: base,
        imageUrl: `${base}/social/acoolcollector-default.png`,
        imageAlt: 'ACoolCOLLECTOR collector operating system',
      }),
      json_ld: buildSiteGraph(base),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'metadata_unavailable';
    return response.status(503).json({ error: message });
  }
});

router.post('/build', (request, response) => {
  try {
    const { kind, data, breadcrumbs } = request.body ?? {};
    if (!kind || typeof data !== 'object' || data === null) {
      return response.status(400).json({ error: 'metadata_kind_and_data_required' });
    }

    let jsonLd: unknown;
    if (kind === 'product') jsonLd = buildProductSchema(data);
    else if (kind === 'event') jsonLd = buildEventSchema(data);
    else if (kind === 'vendor') jsonLd = buildVendorSchema(data);
    else return response.status(400).json({ error: 'unsupported_metadata_kind' });

    return response.json({
      json_ld: jsonLd,
      breadcrumbs: Array.isArray(breadcrumbs) ? buildBreadcrumbSchema(breadcrumbs) : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'metadata_build_failed';
    return response.status(400).json({ error: message });
  }
});

export default router;
