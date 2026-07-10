import { Router } from 'express';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';
import { computeRoute, getTimeZone, searchPlaces, validatePostalAddress } from './ACoolGoogleMaps.js';

const router = Router();
router.use(requireAuth);

router.get('/status', (_request, response) => {
  return response.json({
    maps_server_configured: Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY),
    maps_browser_configured: Boolean(process.env.GOOGLE_MAPS_BROWSER_API_KEY),
    people_sync_enabled: process.env.GOOGLE_PEOPLE_SYNC_ENABLED === 'true',
    calendar_sync_enabled: process.env.GOOGLE_CALENDAR_SYNC_ENABLED === 'true',
    disclosure: 'Google contact and calendar features require separate user consent. Maps data is used only for approved location features and required attribution.',
  });
});

router.post('/places/search', async (request: ACoolRequest, response) => {
  try {
    const payload = await searchPlaces({
      textQuery: String(request.body?.text_query ?? ''),
      includedType: request.body?.included_type,
      maxResultCount: request.body?.max_result_count,
      locationBias: request.body?.location_bias,
    });
    return response.json({
      ...payload,
      source: 'google_places_api',
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'places_search_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.post('/addresses/validate', async (request: ACoolRequest, response) => {
  try {
    const payload = await validatePostalAddress({
      addressLines: Array.isArray(request.body?.address_lines) ? request.body.address_lines : [],
      locality: request.body?.locality,
      administrativeArea: request.body?.administrative_area,
      postalCode: request.body?.postal_code,
      regionCode: String(request.body?.region_code ?? ''),
      enableUspsCass: request.body?.enable_usps_cass === true,
    });
    return response.json({
      ...payload,
      source: 'google_address_validation_api',
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'address_validation_failed';
    const status = message.includes('required') || message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.post('/routes/compute', async (request: ACoolRequest, response) => {
  if (request.header('x-acool-location-consent') !== 'granted') {
    return response.status(412).json({ error: 'location_processing_consent_required' });
  }

  try {
    const payload = await computeRoute({
      origin: request.body?.origin,
      destination: request.body?.destination,
      travelMode: request.body?.travel_mode,
      routingPreference: request.body?.routing_preference,
    });
    return response.json({
      ...payload,
      source: 'google_routes_api',
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'route_compute_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/timezone', async (request: ACoolRequest, response) => {
  if (request.header('x-acool-location-consent') !== 'granted') {
    return response.status(412).json({ error: 'location_processing_consent_required' });
  }

  try {
    const payload = await getTimeZone({
      latitude: Number(request.query.latitude),
      longitude: Number(request.query.longitude),
    });
    return response.json({
      ...payload,
      source: 'google_time_zone_api',
      retrieved_at: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'timezone_lookup_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

export default router;
