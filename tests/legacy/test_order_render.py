from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.on("console", lambda msg: print(f"Browser console: {msg.type}: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Browser error: {err}"))
    
    page.goto("http://localhost:5177/login")
    page.fill("input[placeholder='Enter username']", "Admin")
    page.fill("input[type='password']", "123456")
    page.click("button:has-text('Sign In')")
    page.wait_for_selector("h2:has-text('Admin Dashboard')", timeout=15000)

    page.goto("http://localhost:5177/admin/quotes/new")
    page.fill("input[name='companyName']", "Test Company")
    page.fill("input[name='contactPerson']", "John Doe")
    page.fill("input[name='email']", "test@company.com")
    page.click("button:has-text('Create Quote')")
    
    page.wait_for_selector("span:has-text('Draft')", timeout=5000)
    page.click("button:has-text('Send to Customer')")
    page.wait_for_selector("span:has-text('Sent to Customer')")
    
    page.click("button:has-text('Mark Accepted')")
    page.wait_for_selector("span:has-text('Customer Accepted')")
    
    page.click("button:has-text('Convert to Order')")
    
    try:
        page.wait_for_selector("h1:has-text('ORD')", timeout=10000)
        print("Success!")
    except Exception as e:
        print("Failed to find ORD.")
        print("Body content:")
        print(page.content())
    browser.close()
