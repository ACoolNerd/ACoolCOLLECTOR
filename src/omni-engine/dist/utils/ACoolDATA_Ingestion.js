import fs from 'fs';
export const ingestMasterInventory = (csvPath) => {
    if (!fs.existsSync(csvPath)) {
        console.error(`[ACoolOMNI] Error: Manifest not found at ${csvPath}`);
        return [];
    }
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    // id,product-name,console-name,price-in-pennies,include-string,condition-string,sku,notes,cost-basis-in-pennies,quantity,date-entered,date-purchased,grading-company,grading-cert-id,folder
    return lines.slice(1)
        .filter(line => line.trim() !== '')
        .map(line => {
        const parts = line.split(',');
        return {
            id: parts[0],
            productName: parts[1],
            consoleName: parts[2],
            priceInPennies: parseInt(parts[3]) || 0,
            includeString: parts[4],
            conditionString: parts[5],
            quantity: parseInt(parts[9]) || 0,
            dateEntered: parts[10],
        };
    });
};
