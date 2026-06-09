import fs from 'fs';
import path from 'path';

export interface CardAsset {
  id: string;
  'product-name': string;
  'console-name': string;
  'price-in-pennies': number;
  'include-string': string;
  'condition-string': string;
  quantity: number;
  'date-entered': string;
  photo_url: string;
}

export const ingestMasterInventory = (csvPath: string): CardAsset[] => {
  if (!fs.existsSync(csvPath)) {
    console.error(`[ACoolOMNI] Error: Manifest not found at ${csvPath}`);
    return [];
  }

  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n');

  // id,product-name,console-name,price-in-pennies,include-string,condition-string,sku,notes,cost-basis-in-pennies,quantity,date-entered,date-purchased,grading-company,grading-cert-id,folder
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const parts = line.split(',');
      return {
        id: parts[0],
        'product-name': parts[1],
        'console-name': parts[2],
        'price-in-pennies': parseInt(parts[3]) || 0,
        'include-string': parts[4],
        'condition-string': parts[5],
        quantity: parseInt(parts[9]) || 0,
        'date-entered': parts[10],
        photo_url: 'https://photos.google.com/share/placeholder', // DNA Placeholder
      };
    });
};
