import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Launch with headless=False so the user can see it!
        browser = await p.chromium.launch(headless=False, slow_mo=700) 
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        
        print("Starting live visual test for user...")
        
        # 1. Login
        await page.goto('http://localhost:5173/login', wait_until='networkidle')
        await page.wait_for_timeout(1000)
        await page.fill('input[type="text"]', 'Admin')
        await page.fill('input[type="password"]', '12345')
        await page.click('button:has-text("Sign in")')
        
        # Wait for dashboard to load
        await page.wait_for_timeout(3000)
        
        # 2. Admin Dashboard View
        print("Viewing Admin Dashboard...")
        await page.evaluate("window.scrollBy(0, 800)")
        await page.wait_for_timeout(1000)
        await page.evaluate("window.scrollBy(0, -800)")
        
        # 3. Products Page
        print("Navigating to Products...")
        await page.click('a[href="/admin/products"]')
        await page.wait_for_timeout(2000)
        
        # 4. Orders Page
        print("Navigating to Orders...")
        await page.click('a[href="/admin/orders"]')
        await page.wait_for_timeout(2000)
        
        # 5. Create Order
        print("Creating an Order...")
        await page.click('a:has-text("Create Order")')
        await page.wait_for_timeout(2000)
        
        await page.fill('input[placeholder="e.g. John Doe"]', 'Live Test User')
        await page.fill('input[type="tel"]', '9876543210')
        await page.fill('input[type="email"]', 'test@example.com')
        await page.fill('textarea[placeholder="Enter complete shipping address..."]', '123 Test St, Mumbai, India')
        
        await page.click('button:has-text("Add Item")')
        await page.wait_for_timeout(1000)
        
        # Submit Order (handle alert)
        page.on("dialog", lambda dialog: dialog.accept())
        await page.click('button:has-text("Confirm Order")')
        await page.wait_for_timeout(3000)
        
        # 6. Check Leads
        print("Navigating to Leads...")
        await page.click('a[href="/admin/leads"]')
        await page.wait_for_timeout(2000)
        
        # 7. Check Services
        print("Navigating to Services...")
        await page.click('a[href="/admin/services"]')
        await page.wait_for_timeout(2000)
        
        print("Live test complete! Closing browser...")
        await browser.close()

asyncio.run(run())
