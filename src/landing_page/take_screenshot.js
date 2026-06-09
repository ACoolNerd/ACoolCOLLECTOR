const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log('[HOWARD Help] Initiating Headless QA for CCC Genesis Landing Page...');
  
  // Launch the browser
  const browser = await puppeteer.launch({ 
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport to a desktop size
  await page.setViewport({ width: 1440, height: 900 });
  
  // Construct the absolute file URL
  const filePath = 'file://' + path.resolve(__dirname, 'index.html');
  console.log(`[HOWARD Help] Navigating to: ${filePath}`);
  
  await page.goto(filePath, { waitUntil: 'networkidle0' });
  
  // Take initial state screenshot
  const initialPath = path.resolve(__dirname, 'CCC_Genesis_Initial.png');
  await page.screenshot({ path: initialPath, fullPage: true });
  console.log(`[HOWARD Help] Initial state captured: ${initialPath}`);
  
  // Simulate user interaction: Click the "Contribute $100" button
  console.log('[HOWARD Help] Simulating Fiserv Escrow contribution click...');
  await page.click('#fund-btn');
  
  // Wait a moment for DOM updates
  await new Promise(r => setTimeout(r, 500));
  
  // Take final state screenshot
  const finalPath = path.resolve(__dirname, 'CCC_Genesis_Funded.png');
  await page.screenshot({ path: finalPath, fullPage: true });
  console.log(`[HOWARD Help] Funded state captured: ${finalPath}`);
  
  await browser.close();
  console.log('[HOWARD Help] QA Complete. Screenshots generated successfully.');
})();
