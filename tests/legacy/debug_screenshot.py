from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 800})
        
        page.goto('http://localhost:5173/login')
        time.sleep(3)
        page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/audit/s09_login_debug.png')
        print("Screenshot saved.")
        browser.close()

if __name__ == '__main__':
    run()
