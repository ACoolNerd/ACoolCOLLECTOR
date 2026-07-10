import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { ingestMasterInventory } from './utils/ACoolDATA_Ingestion.js';
import { lookupPrice, searchProducts } from './services/ACoolAPI_Pricing.js';
import authRouter from './services/ACoolAPI_Auth.js';
import referralRouter from './services/ACoolAPI_Referral.js';
import visionRouter from './services/ACoolAPI_Vision.js';
import marketplaceRouter from './services/ACoolAPI_Marketplace.js';
import cardShowRouter from './services/ACoolAPI_CardShow.js';
import discoveryRouter from './services/ACoolAPI_Discovery.js';
import metadataRouter from './services/ACoolAPI_Metadata.js';
import stitchRouter from './services/ACoolAPI_Stitch.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (configuredOrigins.length === 0) return callback(new Error('cors_origin_not_configured'));
    return callback(null, configuredOrigins.includes(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT || '12mb' }));

const INVENTORY_PATH = process.env.ACOOL_INVENTORY_PATH
  || path.join(__dirname, '../../../data/processed/ACoolINVENTORY_Master.csv');
const inventory = ingestMasterInventory(INVENTORY_PATH);

console.log(`[ACoolOMNI] Engine initialized with ${inventory.length} private inventory rows.`);

app.get('/', (_request, response) => {
  response.json({
    application: 'ACoolCOLLECTOR',
    engine: 'ACoolOMNI',
    operating_rule: 'Rights → Disclosure → Proof',
    status: 'running',
    documentation: '/health',
  });
});

app.get('/health', (_request, response) => {
  response.json({
    status: 'ok',
    engine: 'ACoolOMNI',
    timestamp: new Date().toISOString(),
    inventory_rows_loaded: inventory.length,
    integrations: {
      sports_cards_pro_configured: Boolean(process.env.SPORTSCARDSPRO_API_TOKEN),
      supabase_configured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      vision_configured: Boolean(process.env.GEMINI_API_KEY),
      quickbooks_configured: Boolean(process.env.INTUIT_CLIENT_ID && process.env.INTUIT_CLIENT_SECRET),
      google_maps_configured: Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.GOOGLE_MAPS_BROWSER_API_KEY),
      google_people_configured: Boolean(process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET),
      public_metadata_configured: Boolean(process.env.PUBLIC_SITE_URL?.startsWith('https://')),
      card_show_vendor_intelligence: 'schema_and_api_foundation',
      discovery_events_promotions_recommendations: 'schema_api_and_test_foundation',
      direct_event_ticket_purchase: 'disabled_external_checkout_only',
      public_promotions: 'disabled_until_legal_and_rules_approval',
      affiliate_programs: 'pending_provider_approval_by_default',
    },
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/referrals', referralRouter);
app.use('/api/v1/vision', visionRouter);
app.use('/api/v1/marketplace', marketplaceRouter);
app.use('/api/v1/card-show', cardShowRouter);
app.use('/api/v1/discovery', discoveryRouter);
app.use('/api/v1/metadata', metadataRouter);
app.use('/api/v1/stitch', stitchRouter);

app.get('/api/v1/inventory', (_request, response) => {
  response.json({
    count: inventory.length,
    assets: inventory.slice(0, 100),
    privacy_notice: 'This development endpoint must be protected or removed before production.',
  });
});

app.get('/api/v1/pricing/lookup/:id', async (request, response) => {
  try {
    return response.json(await lookupPrice(request.params.id));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'pricing_service_unavailable';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

app.get('/api/v1/pricing/search', async (request, response) => {
  try {
    const query = typeof request.query.q === 'string' ? request.query.q : '';
    return response.json(await searchProducts(query));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'pricing_search_unavailable';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'request_failed';
  if (message === 'cors_origin_not_configured') {
    return response.status(403).json({ error: message });
  }
  console.error('[ACoolOMNI] Unhandled request error:', message);
  return response.status(500).json({ error: 'internal_server_error' });
});

app.listen(PORT, () => {
  console.log(`[ACoolOMNI] Server listening on port ${PORT}.`);
});
