import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;
try {
  prisma = new PrismaClient();
} catch (e) {
  console.log("Prisma client failed to initialize, running in fallback mode");
}

const SERIAL_CARDS = [
  {
    id: 'OP07-109',
    name: 'Monkey.D.Luffy Serial (/1000)',
    set: 'OP-07 CS Event Pack',
    score: 9.2,
    raw: 2380.39,
    psa9: 15500.00,
    psa10: 18000.00,
    bgs10: 23400.00,
    blackLabel: 117000.00,
    activeAsk: 27999.00,
    seller: 'eBay (cs_cards_us)',
    link: 'https://www.ebay.com/sch/i.html?_nkw=OP07-109+Luffy+Serial',
    buyTarget: 15500.00
  },
  {
    id: 'OP07-119',
    name: 'Portgas.D.Ace Serial (/1000)',
    set: 'OP-07 Championship',
    score: 9.0,
    raw: 2919.73,
    psa9: 7500.00,
    psa10: 8900.00,
    bgs10: 11570.00,
    blackLabel: 57850.00,
    activeAsk: 9950.00,
    seller: 'Double Infinity / TCGplayer',
    link: 'https://www.tcgplayer.com/product/550212/one-piece-card-game-championship-promos-portgasdace-serial-number-card',
    buyTarget: 2920.00
  },
  {
    id: 'ST01-001',
    name: 'Monkey.D.Luffy Serial (/700)',
    set: 'ST-01 Starter Deck CS',
    score: 8.9,
    raw: 30900.00,
    psa9: 25000.00,
    psa10: 29993.75,
    bgs10: 38992.00,
    blackLabel: 194960.00,
    activeAsk: 100000.00,
    seller: 'TCGplayer / SNKRDUNK',
    link: 'https://www.tcgplayer.com/product/506929/one-piece-card-game-championship-promos-monkeydluffy-serial-number-card',
    buyTarget: 25000.00
  }
];

const SEALED_BOXES = [
  { set: 'OP-01', name: 'Romance Dawn (Blue Bottom - Wave 1)', tier: 'Grail', buyTarget: 5000, currentPrice: 5500, roi12m: 45, status: 'Low Risk / Grail' },
  { set: 'OP-01', name: 'Romance Dawn (White Bottom - Reprint)', tier: 'Core', buyTarget: 1100, currentPrice: 1300, roi12m: 30, status: 'Medium Risk' },
  { set: 'OP-02', name: 'Paramount War Box', tier: 'Core', buyTarget: 300, currentPrice: 350, roi12m: 25, status: 'Low Risk' }
];

export async function GET() {
  if (prisma) {
    try {
      // Attempt to fetch items from the database
      const items = await prisma.item.findMany({
        include: { marketData: true }
      });
      if (items.length > 0) {
        return NextResponse.json({ source: 'database', cards: items, boxes: SEALED_BOXES });
      }
    } catch (e) {
      console.error("Database connection failed, falling back to static JSON", e.message);
    }
  }

  return NextResponse.json({
    source: 'fallback_json',
    cards: SERIAL_CARDS,
    boxes: SEALED_BOXES
  });
}
