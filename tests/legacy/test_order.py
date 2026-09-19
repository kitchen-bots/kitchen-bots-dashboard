import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context()
        page = await context.new_page()
        
        print("Navigating to login...")
        await page.goto('http://localhost:5173/login')
        await page.fill('input[type="text"]', 'Admin')
        await page.fill('input[type="password"]', '12345')
        await page.click('button:has-text("Sign in")')
        
        print("Waiting for navigation to admin...")
        await page.wait_for_timeout(2000)
        
        print("Navigating to /admin/orders...")
        await page.goto('http://localhost:5173/admin/orders', wait_until='networkidle')
        await page.wait_for_timeout(1000)
        
        await page.screenshot(path='audit/30_orders_page.png')
        
        print("Looking for Add Order button...")
        add_btn = page.locator("text=New Order").first
        if await add_btn.is_visible():
            print("Clicking New Order...")
            await add_btn.click()
            await page.wait_for_timeout(2000)
            await page.screenshot(path='audit/31_add_order.png')
            
            try:
                # Click the first product "Add" button
                add_product_btn = page.locator("text=Add").first
                if await add_product_btn.is_visible():
                    await add_product_btn.click()
                    await page.wait_for_timeout(500)
                    
                    # Check out button
                    checkout_btn = page.locator("text=Proceed to Checkout").first
                    await checkout_btn.click()
                    await page.wait_for_timeout(1000)
                    await page.screenshot(path='audit/32_checkout.png')
                    
                    # Wait for any API delay
                    await page.wait_for_timeout(2000)
                    await page.screenshot(path='audit/33_after_checkout.png')
                else:
                    print("No products available to add")
            except Exception as e:
                print(f"Error during order creation: {e}")
        else:
            print("New Order button not found.")
                
        await browser.close()

asyncio.run(main())
