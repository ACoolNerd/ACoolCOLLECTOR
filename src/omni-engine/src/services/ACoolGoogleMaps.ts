export type Coordinate = { latitude: number; longitude: number };

const allowedPlaceFields = new Set([
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.websiteUri',
  'places.nationalPhoneNumber',
  'places.googleMapsUri',
  'places.primaryType',
  'places.businessStatus',
]);

const googleApiKey = () => {
  const key = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!key) throw new Error('google_maps_server_not_configured');
  return key;
};

export const validateCoordinate = (value: unknown): Coordinate => {
  if (!value || typeof value !== 'object') throw new Error('invalid_coordinate');
  const latitude = Number((value as Record<string, unknown>).latitude);
  const longitude = Number((value as Record<string, unknown>).longitude);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) throw new Error('invalid_latitude');
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) throw new Error('invalid_longitude');
  return { latitude, longitude };
};

export const normalizePlaceFieldMask = (configured?: string): string => {
  const requested = (configured || process.env.GOOGLE_PLACES_FIELD_MASK || '')
    .split(',')
    .map((field) => field.trim())
    .filter(Boolean)
    .map((field) => field.startsWith('places.') ? field : `places.${field}`);
  const accepted = requested.filter((field) => allowedPlaceFields.has(field));
  if (!accepted.length) {
    return 'places.id,places.displayName,places.formattedAddress,places.location,places.googleMapsUri';
  }
  return [...new Set(accepted)].join(',');
};

const googleJson = async (url: string, init: RequestInit) => {
  const response = await fetch(url, init);
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const code = payload?.error?.status || payload?.status || `google_api_${response.status}`;
    throw new Error(String(code).toLowerCase());
  }
  return payload;
};

export const searchPlaces = async (input: {
  textQuery: string;
  locationBias?: { center: Coordinate; radiusMeters: number };
  includedType?: string;
  maxResultCount?: number;
}) => {
  const textQuery = input.textQuery.trim().slice(0, 250);
  if (textQuery.length < 2) throw new Error('invalid_place_query');
  const maxResultCount = Math.min(Math.max(Number(input.maxResultCount || 10), 1), 20);

  const body: Record<string, unknown> = { textQuery, maxResultCount };
  if (input.includedType) body.includedType = input.includedType.slice(0, 80);
  if (input.locationBias) {
    const center = validateCoordinate(input.locationBias.center);
    const radius = Math.min(Math.max(Number(input.locationBias.radiusMeters || 50000), 100), 50000);
    body.locationBias = { circle: { center, radius } };
  }

  return googleJson('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleApiKey(),
      'X-Goog-FieldMask': normalizePlaceFieldMask(),
    },
    body: JSON.stringify(body),
  });
};

export const validatePostalAddress = async (input: {
  addressLines: string[];
  locality?: string;
  administrativeArea?: string;
  postalCode?: string;
  regionCode: string;
  enableUspsCass?: boolean;
}) => {
  const addressLines = input.addressLines
    .filter((line) => typeof line === 'string' && line.trim())
    .map((line) => line.trim().slice(0, 200))
    .slice(0, 3);
  if (!addressLines.length) throw new Error('address_lines_required');
  const regionCode = input.regionCode.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(regionCode)) throw new Error('invalid_region_code');

  return googleJson('https://addressvalidation.googleapis.com/v1:validateAddress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleApiKey(),
    },
    body: JSON.stringify({
      address: {
        regionCode,
        addressLines,
        locality: input.locality?.trim().slice(0, 120),
        administrativeArea: input.administrativeArea?.trim().slice(0, 120),
        postalCode: input.postalCode?.trim().slice(0, 20),
      },
      enableUspsCass: input.enableUspsCass === true && regionCode === 'US',
    }),
  });
};

export const computeRoute = async (input: {
  origin: Coordinate;
  destination: Coordinate;
  travelMode?: 'DRIVE' | 'WALK' | 'BICYCLE' | 'TRANSIT';
  routingPreference?: 'TRAFFIC_AWARE' | 'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_UNAWARE';
}) => {
  const origin = validateCoordinate(input.origin);
  const destination = validateCoordinate(input.destination);
  const travelMode = input.travelMode || 'DRIVE';
  const routingPreference = input.routingPreference || (travelMode === 'DRIVE' ? 'TRAFFIC_AWARE' : undefined);

  return googleJson('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': googleApiKey(),
      'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.localizedValues',
    },
    body: JSON.stringify({
      origin: { location: { latLng: origin } },
      destination: { location: { latLng: destination } },
      travelMode,
      ...(routingPreference ? { routingPreference } : {}),
      computeAlternativeRoutes: false,
      languageCode: 'en-US',
      units: 'IMPERIAL',
    }),
  });
};

export const getTimeZone = async (coordinate: Coordinate, timestamp = Math.floor(Date.now() / 1000)) => {
  const { latitude, longitude } = validateCoordinate(coordinate);
  const url = new URL('https://maps.googleapis.com/maps/api/timezone/json');
  url.searchParams.set('location', `${latitude},${longitude}`);
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('key', googleApiKey());
  return googleJson(url.toString(), { method: 'GET' });
};
