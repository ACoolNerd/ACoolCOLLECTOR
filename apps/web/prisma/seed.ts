const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create One Piece Category
  const category = await prisma.category.upsert({
    where: { slug: 'one-piece-tcg' },
    update: {},
    create: {
      slug: 'one-piece-tcg',
      name: 'One Piece Card Game'
    }
  });

  console.log(`Category created/found: ${category.name}`);

  // Create default items
  const itemsData = [
    {
      id: 'OP07-109',
      name: 'Monkey.D.Luffy Serial (/1000)',
      attributes: { set: 'OP-07 CS Event Pack', rarity: 'CS Promo', score: 9.2 }
    },
    {
      id: 'OP07-119',
      name: 'Portgas.D.Ace Serial (/1000)',
      attributes: { set: 'OP-07 Championship', rarity: 'Championship Prize', score: 9.0 }
    },
    {
      id: 'ST01-001',
      name: 'Monkey.D.Luffy Serial (/700)',
      attributes: { set: 'ST-01 Starter Deck CS', rarity: 'CS Winner Promo', score: 8.9 }
    }
  ];

  for (const item of itemsData) {
    const createdItem = await prisma.item.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        categoryId: category.id,
        name: item.name,
        attributes: item.attributes
      }
    });

    // Add initial market data
    await prisma.marketData.create({
      data: {
        itemId: createdItem.id,
        grade: 'PSA 10',
        price: item.id === 'OP07-109' ? 18000 : item.id === 'OP07-119' ? 8900 : 29993.75,
        source: 'PriceCharting'
      }
    });
  }

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
