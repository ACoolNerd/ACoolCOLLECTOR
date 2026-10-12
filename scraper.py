import asyncio
from playwright.async_api import async_playwright
import urllib.parse

async def scrape_ebay_sold_listings(search_query: str, limit: int = 5):
    """
    Manifests the absolute truth of the market by scraping actual SOLD listings on eBay.
    """
    encoded_query = urllib.parse.quote(search_query)
    # LH_Sold=1 and LH_Complete=1 ensures we only look at items that actually sold, not just asks.
    ebay_url = f"https://www.ebay.com/sch/i.html?_nkw={encoded_query}&LH_Sold=1&LH_Complete=1"
    
    results = []
    
    print(f"👑 ACool AI: Deploying Playwright Snippers to eBay for [{search_query}]...")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Spoof user agent to prevent blocking
        await page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"})
        
        await page.goto(ebay_url, wait_until="domcontentloaded")
        
        # Target the listing cards
        listings = await page.query_selector_all("div.s-item__info")
        
        for listing in listings[:limit]:
            try:
                # Extract title
                title_el = await listing.query_selector("div.s-item__title span")
                title = await title_el.inner_text() if title_el else "Unknown"
                
                # Extract sold price
                price_el = await listing.query_selector("span.s-item__price span.POSITIVE")
                price_text = await price_el.inner_text() if price_el else "$0.00"
                
                # Clean the price string to a float
                clean_price = float(price_text.replace("$", "").replace(",", "").split(" ")[0])
                
                if clean_price > 0 and "Shop on eBay" not in title:
                    results.append({"title": title, "sold_price": clean_price})
            except Exception as e:
                continue
                
        await browser.close()
        
    return results

if __name__ == "__main__":
    # Test the manifestation
    asyncio.run(scrape_ebay_sold_listings("OP07-119 Portgas D. Ace PSA 10"))