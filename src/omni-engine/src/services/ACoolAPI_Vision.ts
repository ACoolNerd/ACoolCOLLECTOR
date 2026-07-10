import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

const DNA_PATH = path.join(__dirname, '../../../../ACoolPROMPTS/ACoolVISION_Scanner_DNA.md');
const dnaPrompt = fs.existsSync(DNA_PATH)
  ? fs.readFileSync(DNA_PATH, 'utf8')
  : 'Extract possible collectible identity fields from the image.';

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const maxImageBytes = Number(process.env.GEMINI_MAX_IMAGE_BYTES || 8 * 1024 * 1024);

const normalizeBase64 = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  const comma = trimmed.indexOf(',');
  const raw = trimmed.startsWith('data:') && comma >= 0 ? trimmed.slice(comma + 1) : trimmed;
  if (!raw || !/^[A-Za-z0-9+/=\r\n]+$/.test(raw)) return null;
  return raw.replace(/\s+/g, '');
};

router.post('/scan', requireAuth, async (request: ACoolRequest, response) => {
  const { imageBase64, image, mimeType = 'image/jpeg', capturePurpose = 'collection_intake' } = request.body ?? {};
  const normalizedImage = normalizeBase64(imageBase64 ?? image);

  if (!normalizedImage) {
    return response.status(400).json({ error: 'valid_base64_image_required' });
  }
  if (!allowedMimeTypes.has(mimeType)) {
    return response.status(400).json({ error: 'unsupported_image_type' });
  }

  const estimatedBytes = Math.floor((normalizedImage.length * 3) / 4);
  if (!Number.isFinite(estimatedBytes) || estimatedBytes <= 0 || estimatedBytes > maxImageBytes) {
    return response.status(413).json({ error: 'image_size_out_of_range' });
  }

  if (request.header('x-acool-ai-media-consent') !== 'granted') {
    return response.status(412).json({
      error: 'ai_media_processing_consent_required',
      disclosure: 'Image analysis proposes candidate fields only and is not proof of authenticity, ownership, certification, or grade.',
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_VISION_MODEL;
  if (!apiKey || !modelName) {
    return response.status(503).json({ error: 'vision_service_not_configured' });
  }

  const extractionInstruction = `
${dnaPrompt}

Return JSON only. The result is a candidate extraction, never a verified identity or official grade.
Use this shape:
{
  "record_type": "card_recognition_candidate",
  "overall_confidence": 0,
  "fields": {
    "category": {"value": null, "confidence": 0, "evidence": ""},
    "franchise": {"value": null, "confidence": 0, "evidence": ""},
    "player_or_character": {"value": null, "confidence": 0, "evidence": ""},
    "manufacturer": {"value": null, "confidence": 0, "evidence": ""},
    "year": {"value": null, "confidence": 0, "evidence": ""},
    "set_name": {"value": null, "confidence": 0, "evidence": ""},
    "item_number": {"value": null, "confidence": 0, "evidence": ""},
    "parallel_or_variant": {"value": null, "confidence": 0, "evidence": ""},
    "language_code": {"value": null, "confidence": 0, "evidence": ""},
    "grading_company": {"value": null, "confidence": 0, "evidence": ""},
    "grade_label": {"value": null, "confidence": 0, "evidence": ""},
    "certification_number": {"value": null, "confidence": 0, "evidence": ""},
    "serial_number": {"value": null, "confidence": 0, "evidence": ""},
    "asking_price_text": {"value": null, "confidence": 0, "evidence": ""}
  },
  "provider_match_queries": [],
  "warnings": [],
  "review_status": "manual_review_required"
}
If the image is insufficient, say so in warnings and use review_status "insufficient_image".
Do not invent unreadable values.
Capture purpose: ${String(capturePurpose).slice(0, 80)}.
`;

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await model.generateContent([
      extractionInstruction,
      { inlineData: { data: normalizedImage, mimeType } },
    ]);
    const text = result.response.text().trim();
    const candidate = JSON.parse(text);

    return response.json({
      status: 'candidate_extracted',
      candidate,
      verified: false,
      capture_purpose: String(capturePurpose).slice(0, 80),
      model: modelName,
      timestamp: new Date().toISOString(),
      disclosure: 'This AI result requires user or authorized reviewer confirmation and is not proof of authenticity, ownership, certification, or official grade.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'vision_processing_failed';
    console.error('[ACoolOMNI] Vision processing failed:', message);
    return response.status(502).json({ error: 'vision_processing_failed' });
  }
});

export default router;
