import { Router } from 'express';

const router = Router();

// Simulated Global Marketplace Data
let marketplaceListings = [
  { id: 'm1', productName: 'Shohei Ohtani #PP-25', seller: 'Vendor_Alpha', price: 1949, condition: 'Near Mint' },
  { id: 'm2', productName: 'Charizard [1st Edition]', seller: 'Collector_Z', price: 500000, condition: 'Mint' },
  { id: 'm3', productName: 'Patrick Mahomes II Downtown', seller: 'PacificRIPZ', price: 83600, condition: 'PSA 10' }
];

router.get('/listings', (req, res) => {
  res.json({
    status: 'Zero-Gravity-Market',
    count: marketplaceListings.length,
    listings: marketplaceListings
  });
});

router.post('/list', (req, res) => {
  const { asset, sellerId } = req.body;
  
  if (!asset) {
    return res.status(400).json({ error: 'No asset DNA provided for listing' });
  }

  const newListing = {
    id: `m-${Date.now()}`,
    productName: asset.productName,
    seller: sellerId || 'Anonymous_Collector',
    price: asset.priceInPennies,
    condition: asset.conditionString
  };

  marketplaceListings.unshift(newListing);

  res.json({
    message: 'Asset successfully manifested in global marketplace',
    listing: newListing
  });
});

export default router;
