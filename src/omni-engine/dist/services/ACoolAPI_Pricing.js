import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
const API_KEY = process.env.SPORTSCARDSPRO_API_KEY;
const BASE_URL = process.env.PRICECHARTING_BASE_URL;
// In-memory cache to respect rate limit (1 call per second)
const pricingCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
export const lookupPrice = async (id) => {
    const now = Date.now();
    const cached = pricingCache.get(id);
    if (cached && (now - cached.timestamp < CACHE_TTL)) {
        return {
            id,
            price: cached.price,
            status: 'CACHED',
            timestamp: new Date(cached.timestamp).toISOString(),
        };
    }
    try {
        console.log(`[ACoolOMNI] Fetching live price for ID: ${id}`);
        const response = await axios.get(`${BASE_URL}/api/product`, {
            params: {
                id: id,
                t: API_KEY
            }
        });
        const livePrice = response.data['loose-price'] || 0;
        pricingCache.set(id, { price: livePrice, timestamp: now });
        return {
            id,
            price: livePrice,
            status: 'LIVE',
            timestamp: new Date().toISOString(),
        };
    }
    catch (error) {
        console.error(`[ACoolOMNI] Error fetching pricing for ${id}:`, error.message);
        throw new Error('Pricing service unavailable');
    }
};
