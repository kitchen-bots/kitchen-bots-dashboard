import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        page.on('console', lambda msg: print(f'BROWSER CONSOLE: {msg.text}'))
        page.on('pageerror', lambda err: print(f'BROWSER ERROR: {err.message}'))
        await page.goto('http://localhost:5173/login')
        await page.fill('input[type="text"]', 'Admin')
        await page.fill('input[type="password"]', '12345')
        await page.click('button[type="submit"]')
        await page.wait_for_timeout(1000)
        await page.goto('http://localhost:5173/admin/orders')
        await page.wait_for_timeout(2000)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
