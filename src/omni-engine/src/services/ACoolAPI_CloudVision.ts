import { Router } from 'express';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';
import { getGoogleAccessToken } from './ACoolGoogleAccessToken.js';

const router = Router();
const supportedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const normalizeVisionRequest = (body: Record<string, unknown>) => {
  const imageBase64 = typeof body.image_base64 === 'string' ? body.image_base64.trim() : '';
  if (!imageBase64) throw new Error('image_base64_required');
  const mimeType = typeof body.mime_type === 'string' ? body.mime_type.trim().toLowerCase() : 'image/jpeg';
  if (!supportedMimeTypes.has(mimeType)) throw new Error('unsupported_image_type');
  const estimatedBytes = Math.floor((imageBase64.length * 3) / 4);
  if (estimatedBytes > 10 * 1024 * 1024) throw new Error('image_too_large');
  return { imageBase64, mimeType };
};

router.use(requireAuth);

router.post('/analyze', async (request: ACoolRequest, response) => {
  try {
    const { imageBase64, mimeType } = normalizeVisionRequest(request.body ?? {});
    const token = await getGoogleAccessToken();
    const cloudResponse = await fetch('https://vision.googleapis.com/v1/images:annotate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [
            { type: 'TEXT_DETECTION', maxResults: 20 },
            { type: 'LABEL_DETECTION', maxResults: 20 },
            { type: 'LOGO_DETECTION', maxResults: 10 },
            { type: 'SAFE_SEARCH_DETECTION' },
          ],
        }],
      }),
      signal: AbortSignal.timeout(25_000),
    });
    const result = await cloudResponse.json() as {
      responses?: Array<{
        textAnnotations?: Array<{ description?: string; confidence?: number }>;
        labelAnnotations?: Array<{ description?: string; score?: number }>;
        logoAnnotations?: Array<{ description?: string; score?: number }>;
        safeSearchAnnotation?: Record<string, unknown>;
        error?: { message?: string };
      }>;
      error?: { message?: string };
    };
    const first = result.responses?.[0];
    if (!cloudResponse.ok || first?.error) {
      throw new Error(first?.error?.message || result.error?.message || `google_vision_failed_${cloudResponse.status}`);
    }
    return response.json({
      mime_type: mimeType,
      full_text: first?.textAnnotations?.[0]?.description ?? null,
      labels: (first?.labelAnnotations ?? []).map((item) => ({ label: item.description, confidence: item.score ?? null })),
      logos: (first?.logoAnnotations ?? []).map((item) => ({ label: item.description, confidence: item.score ?? null })),
      safe_search: first?.safeSearchAnnotation ?? null,
      analyzed_at: new Date().toISOString(),
      verification_status: 'candidate_only',
      disclosure: 'Cloud Vision output assists identification and OCR; it is not proof of authenticity, grade, ownership, or certification.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'cloud_vision_failed';
    const status = message.startsWith('image_') || message.startsWith('unsupported_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

export default router;
