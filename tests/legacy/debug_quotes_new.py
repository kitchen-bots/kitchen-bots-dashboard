import time
from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5177/login")
        page.fill("input[placeholder='Enter username']", "Admin")
        page.fill("input[type='password']", "123456")
        page.click("button:has-text('Sign In')")
        page.wait_for_selector("h2:has-text('Admin Dashboard')", timeout=15000)
        
        page.goto("http://localhost:5177/admin/quotes/new")
        time.sleep(3)
        page.screenshot(path="audit/s09_quotes_new_debug.png", full_page=True)
        print("Screenshot saved to audit/s09_quotes_new_debug.png")
        
        # also dump the DOM to see the h2 text
        html = page.content()
        with open("audit/s09_quotes_new_dom.html", "w") as f:
            f.write(html)
        print("DOM saved to audit/s09_quotes_new_dom.html")
        browser.close()

if __name__ == "__main__":
    run()
