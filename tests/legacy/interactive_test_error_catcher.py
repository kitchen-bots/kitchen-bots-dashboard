from playwright.sync_api import sync_playwright

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        page.on("console", lambda msg: print(f"Browser console: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser page error: {err}"))

        print("Navigating to app...")
        page.goto("http://localhost:5177/login")
        
        # Login
        page.fill("input[placeholder='Enter username']", "Admin")
        page.fill("input[type='password']", "123456")
        page.click("button:has-text('Sign In')")
        page.wait_for_selector("h2:has-text('Admin Dashboard')", timeout=15000)
        
        # Create quote
        page.goto("http://localhost:5177/admin/quotes/new")
        page.wait_for_selector("h1:has-text('Create Quote')")
        
        page.fill("input[name='companyName']", "Test Company")
        page.fill("input[name='contactPerson']", "John Doe")
        page.fill("input[name='email']", "john@test.com")
        page.fill("input[name='phone']", "1234567890")
        
        page.click("button:has-text('Create Quote')")
        
        # Wait a bit for potential error overlays
        page.wait_for_timeout(2000)
        
        try:
            page.wait_for_selector("span:has-text('Draft')", timeout=5000)
            print("Quote created successfully!")
        except Exception as e:
            print("Failed waiting for Draft status")
            print(e)
            
        browser.close()

if __name__ == "__main__":
    run_test()
