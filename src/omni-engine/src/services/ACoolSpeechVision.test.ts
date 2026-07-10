import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSpeechRequest } from './ACoolAPI_Speech.js';
import { normalizeVisionRequest } from './ACoolAPI_CloudVision.js';

const fakeImage = Buffer.from('acoolcollector').toString('base64');

test('speech request requires exactly one input mode', () => {
  assert.throws(() => normalizeSpeechRequest({}), /provide_exactly_one/);
  assert.throws(() => normalizeSpeechRequest({ text: 'hello', ssml: '<speak>hello</speak>' }), /provide_exactly_one/);
});

test('speech request normalizes safe defaults', () => {
  const request = normalizeSpeechRequest({ text: 'Read my show plan.' });
  assert.deepEqual(request.input, { text: 'Read my show plan.' });
  assert.equal(request.voice.languageCode, 'en-US');
  assert.equal(request.audioConfig.audioEncoding, 'MP3');
});

test('speech request rejects unsupported encoding', () => {
  assert.throws(() => normalizeSpeechRequest({ text: 'hello', audio_encoding: 'RAW' }), /unsupported_audio_encoding/);
});

test('vision request validates image and mime type', () => {
  const request = normalizeVisionRequest({ image_base64: fakeImage, mime_type: 'image/png' });
  assert.equal(request.imageBase64, fakeImage);
  assert.equal(request.mimeType, 'image/png');
  assert.throws(() => normalizeVisionRequest({ image_base64: fakeImage, mime_type: 'image/svg+xml' }), /unsupported_image_type/);
});
