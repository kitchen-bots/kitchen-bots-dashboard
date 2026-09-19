import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        
        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: errors.append(str(exc)))
        
        print("Navigating to app...")
        await page.goto("http://localhost:5173")
        await page.wait_for_timeout(2000)
        
        print("Checking for errors...")
        if errors:
            print("Errors found:")
            for err in errors:
                print(f"- {err}")
        else:
            print("No console errors found!")
            
        print("Taking screenshot...")
        await page.screenshot(path="post_refactor.png")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
