import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { ingestMasterInventory } from './utils/ACoolDATA_Ingestion.js';
import { lookupPrice } from './services/ACoolAPI_Pricing.js';
import authRouter from './services/ACoolAPI_Auth.js';
import visionRouter from './services/ACoolAPI_Vision.js';
import { fileURLToPath } from 'url';
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
// Standard ACoolOMNI Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
// Ingest Initial Data (The Seed)
const INVENTORY_PATH = path.join(__dirname, '../../../data/processed/ACoolINVENTORY_Master.csv');
const inventory = ingestMasterInventory(INVENTORY_PATH);
console.log(`[ACoolOMNI] Engine initialized. ${inventory.length} assets ingested into memory.`);
// --- API Endpoints ---
// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'Zero-Gravity', engine: 'ACoolOMNI', timestamp: new Date().toISOString() });
});
// Auth Microservice
app.use('/api/v1/auth', authRouter);
// Vision Microservice
app.use('/api/v1/vision', visionRouter);
// Inventory Lookup
app.get('/api/v1/inventory', (req, res) => {
    res.json({
        count: inventory.length,
        assets: inventory.slice(0, 100) // Truncate for initial sprint dev
    });
});
// Pricing Microservice
app.get('/api/v1/pricing/lookup/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const priceData = await lookupPrice(id);
        res.json(priceData);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.listen(PORT, () => {
    console.log(`[ACoolOMNI] Server manifesting at http://localhost:${PORT}`);
});
