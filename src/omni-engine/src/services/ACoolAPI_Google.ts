import { Router } from 'express';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';
import {
  computeRoute,
  computeRouteMatrix,
  getStreetViewMetadata,
  getTimeZone,
  searchPlaces,
  validatePostalAddress,
} from './ACoolGoogleMaps.js';

const router = Router();
router.use(requireAuth);

const locationConsentGranted = (request: ACoolRequest) => request.header('x-acool-location-consent') === 'granted';

router.get('/status', (_request, response) => {
  return response.json({
    maps_server_configured: Boolean(process.env.GOOGLE_MAPS_SERVER_API_KEY),
    maps_browser_configured: Boolean(process.env.GOOGLE_MAPS_BROWSER_API_KEY),
    navigation_enabled: process.env.GOOGLE_NAVIGATION_ENABLED === 'true',
    street_view_enabled: process.env.GOOGLE_STREET_VIEW_ENABLED === 'true',
    people_sync_enabled: process.env.GOOGLE_PEOPLE_SYNC_ENABLED === 'true',
    calendar_sync_enabled: process.env.GOOGLE_CALENDAR_SYNC_ENABLED === 'true',
    disclosure: 'Contacts, calendar, microphone, background location, and precise location require separate consent. Maps data is used only for approved features and required attribution.',
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
      relationship_disclosure: 'Google place data does not establish an ACool affiliation or current event participation.',
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
  if (!locationConsentGranted(request)) {
    return response.status(412).json({ error: 'location_processing_consent_required' });
  }

  try {
    const payload = await computeRoute({
      origin: request.body?.origin,
      destination: request.body?.destination,
      travelMode: request.body?.travel_mode,
      routingPreference: request.body?.routing_preference,
      languageCode: request.body?.language_code,
      units: request.body?.units,
      avoidTolls: request.body?.avoid_tolls === true,
      avoidHighways: request.body?.avoid_highways === true,
      avoidFerries: request.body?.avoid_ferries === true,
    });
    return response.json({
      ...payload,
      source: 'google_routes_api',
      retrieved_at: new Date().toISOString(),
      live_navigation_policy: 'Use the native Google Navigation SDK for live turn-by-turn guidance. AI may summarize but may not invent route instructions.',
      accessibility_policy: 'Every visual route must have an ordered text alternative suitable for TalkBack and VoiceOver.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'route_compute_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.post('/routes/matrix', async (request: ACoolRequest, response) => {
  if (!locationConsentGranted(request)) {
    return response.status(412).json({ error: 'location_processing_consent_required' });
  }

  try {
    const payload = await computeRouteMatrix({
      origins: Array.isArray(request.body?.origins) ? request.body.origins : [],
      destinations: Array.isArray(request.body?.destinations) ? request.body.destinations : [],
      travelMode: request.body?.travel_mode,
    });
    return response.json({
      results: payload,
      source: 'google_routes_matrix_api',
      retrieved_at: new Date().toISOString(),
      maximum_origins: 10,
      maximum_destinations: 10,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'route_matrix_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/street-view/metadata', async (request: ACoolRequest, response) => {
  if (!locationConsentGranted(request)) {
    return response.status(412).json({ error: 'location_processing_consent_required' });
  }
  if (process.env.GOOGLE_STREET_VIEW_ENABLED !== 'true') {
    return response.status(503).json({ error: 'street_view_not_enabled' });
  }

  try {
    const payload = await getStreetViewMetadata({
      coordinate: {
        latitude: Number(request.query.latitude),
        longitude: Number(request.query.longitude),
      },
      radiusMeters: Number(request.query.radius_meters || 50),
      source: request.query.source === 'outdoor' ? 'outdoor' : 'default',
    });
    return response.json({
      ...payload,
      source_api: 'google_street_view_static_metadata',
      retrieved_at: new Date().toISOString(),
      disclosure: 'Street View imagery may be historical or user-contributed and does not prove current venue, vendor, or event status.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'street_view_metadata_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/timezone', async (request: ACoolRequest, response) => {
  if (!locationConsentGranted(request)) {
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
