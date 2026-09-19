import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={'width': 1280, 'height': 800})
        page = await context.new_page()
        
        # Go to admin dashboard
        await page.goto('http://localhost:5173/admin', wait_until='networkidle')
        await page.wait_for_timeout(2000)
        
        await page.screenshot(path='screenshot_admin_layout_current.png', full_page=True)
        print("Screenshot saved to screenshot_admin_layout_current.png")
        
        # Execute script to check scrolling
        scroll_info = await page.evaluate('''() => {
            const leftCol = document.querySelector('.lg\\\\:col-span-8');
            const rightCol = document.querySelector('.lg\\\\:col-span-4');
            const main = document.querySelector('main');
            
            return {
                mainScroll: main ? {
                    scrollHeight: main.scrollHeight,
                    clientHeight: main.clientHeight,
                    overflowY: window.getComputedStyle(main).overflowY
                } : null,
                leftColScroll: leftCol ? {
                    scrollHeight: leftCol.scrollHeight,
                    clientHeight: leftCol.clientHeight,
                    overflowY: window.getComputedStyle(leftCol).overflowY
                } : null,
                rightColScroll: rightCol ? {
                    scrollHeight: rightCol.scrollHeight,
                    clientHeight: rightCol.clientHeight,
                    overflowY: window.getComputedStyle(rightCol).overflowY
                } : null
            };
        }''')
        print(scroll_info)
        
        await browser.close()

asyncio.run(run())
