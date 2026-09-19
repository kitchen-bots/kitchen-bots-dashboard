from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1280, "height": 800})
    
    page.goto('http://localhost:5174/admin')
    time.sleep(2)
    page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/screenshot_admin.png')
    
    page.goto('http://localhost:5174/admin/products')
    time.sleep(2)
    page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/screenshot_products.png')

    page.goto('http://localhost:5174/admin/leads')
    time.sleep(2)
    page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/screenshot_leads.png')

    page.goto('http://localhost:5174/admin/services')
    time.sleep(2)
    page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/screenshot_services.png')

    page.goto('http://localhost:5174/admin/settings')
    time.sleep(2)
    page.screenshot(path='/Users/user/.gemini/antigravity/brain/044ced8a-5582-414d-bb21-debc95a22189/screenshot_settings.png')

    browser.close()
