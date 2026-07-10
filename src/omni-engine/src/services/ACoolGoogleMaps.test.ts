import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizePlaceFieldMask, validateCoordinate } from './ACoolGoogleMaps.js';

test('coordinate validation accepts valid latitude and longitude', () => {
  assert.deepEqual(validateCoordinate({ latitude: 39.2904, longitude: -76.6122 }), {
    latitude: 39.2904,
    longitude: -76.6122,
  });
});

test('coordinate validation rejects out-of-range values', () => {
  assert.throws(() => validateCoordinate({ latitude: 91, longitude: 0 }), /invalid_latitude/);
  assert.throws(() => validateCoordinate({ latitude: 0, longitude: -181 }), /invalid_longitude/);
});

test('place field mask removes unapproved fields and prefixes accepted fields', () => {
  const mask = normalizePlaceFieldMask('id,displayName,reviews,formattedAddress');
  assert.equal(mask, 'places.id,places.displayName,places.formattedAddress');
  assert.equal(mask.includes('reviews'), false);
});

test('empty field mask falls back to minimum useful fields', () => {
  const mask = normalizePlaceFieldMask('reviews,photos');
  assert.match(mask, /places\.id/);
  assert.match(mask, /places\.displayName/);
});
