import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        
        base_url = "http://localhost:5173"
        
        # Helper to visit and screenshot
        async def visit_and_capture(path, name):
            print(f"Testing {path} ...")
            await page.goto(f"{base_url}{path}")
            await page.wait_for_load_state("networkidle")
            # Wait an extra second for any animations to finish
            await page.wait_for_timeout(1000)
            
            artifact_dir = "/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189"
            screenshot_path = f"{artifact_dir}/screenshot_{name}.png"
            await page.screenshot(path=screenshot_path, full_page=True)
            print(f"Saved {screenshot_path}")

        # List of routes to test
        routes = [
            ("/admin", "admin_home"),
            ("/admin/products", "admin_products"),
            ("/admin/orders", "admin_orders"),
            ("/admin/leads", "admin_leads"),
            ("/admin/services", "admin_services"),
            ("/admin/settings", "admin_settings"),
            
            ("/dashboard", "customer_home"),
            ("/dashboard/products/new", "customer_add_product"),
            ("/dashboard/orders/new", "customer_add_order"),
            ("/dashboard/kitchen-status", "customer_kitchen_status"),
            ("/dashboard/settings", "customer_settings")
        ]
        
        for path, name in routes:
            try:
                await visit_and_capture(path, name)
            except Exception as e:
                print(f"Failed to test {path}: {e}")
                
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
