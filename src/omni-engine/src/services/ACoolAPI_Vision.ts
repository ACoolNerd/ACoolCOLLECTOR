import { Router } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Load DNA Prompt
const DNA_PATH = path.join(__dirname, '../../../../ACoolPROMPTS/ACoolVISION_Scanner_DNA.md');
const dnaPrompt = fs.existsSync(DNA_PATH) ? fs.readFileSync(DNA_PATH, 'utf8') : 'Extract card data.';

router.post('/scan', async (req, res) => {
  const { image } = req.body; // Expecting base64 string

  if (!image) {
    return res.status(400).json({ error: 'No image data manifested' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'ACoolOMNI Error: Vision API key not seeded' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      dnaPrompt,
      {
        inlineData: {
          data: image,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean JSON response (handle potential markdown backticks)
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    res.json({
      status: 'Zero-Gravity-Success',
      extractedData: data,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[ACoolOMNI] Vision Error:', error.message);
    res.status(500).json({ error: 'Vision sequence interrupted' });
  }
});

export default router;
