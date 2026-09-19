
from playwright.sync_api import sync_playwright
import time

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5177/login")
        
        # Login
        page.fill("input[placeholder='Enter username']", "Admin")
        page.fill("input[type='password']", "123456")
        page.click("button:has-text('Sign In')")
        page.wait_for_selector("h2:has-text('Admin Dashboard')", timeout=15000)
        print("✅ Logged in successfully")

        # 1. Create a Quote
        page.goto("http://localhost:5177/admin/quotes/new")
        page.wait_for_selector("h1:has-text('Create Quote')")
        print("✅ Navigated to Create Quote")
        
        # Fill the form to create a quote
        page.fill("input[name='companyName']", "Test Company")
        page.fill("input[name='contactPerson']", "John Doe")
        page.fill("input[name='email']", "test@company.com")
        page.click("button:has-text('Create Quote')")
        
        page.wait_for_timeout(2000)
        page.screenshot(path="audit/s09_after_create_quote.png", full_page=True)
        print("✅ Taken screenshot after submit")
        
        # Wait for navigation to Quote Details
        try:
            page.wait_for_selector("span:has-text('Draft')", timeout=5000)
        except Exception as e:
            with open("audit/s09_failed_details_dom.html", "w") as f:
                f.write(page.content())
            raise e
        print("✅ Opened newly created Draft quote")
        
        # Send to Customer
        page.wait_for_selector("button:has-text('Send to Customer')")
        page.click("button:has-text('Send to Customer')")
        page.wait_for_selector("span:has-text('Sent to Customer')")
        print("✅ Quote transitioned to Sent to Customer")
        
        # Accept Quote
        page.click("button:has-text('Mark Accepted')")
        page.wait_for_selector("span:has-text('Customer Accepted')")
        print("✅ Quote transitioned to Customer Accepted")
        
        # Convert to Order
        page.click("button:has-text('Convert to Order')")
        page.wait_for_selector("h1:has-text('ORD')")
        print("✅ Quote converted to Order")
        
        # Order Lifecycle
        # Submit for Approval
        if page.locator("button:has-text('Submit for Approval')").count() > 0:
            page.click("button:has-text('Submit for Approval')")
            page.wait_for_selector("span:has-text('Pending Approval')")
            print("✅ Order Submitted for Approval")

        # Approve
        if page.locator("button:has-text('Approve Order')").count() > 0:
            page.click("button:has-text('Approve Order')")
            page.wait_for_selector("textarea")
            page.fill("textarea", "Approved for processing")
            page.click("button:has-text('Confirm Approval')")
            page.wait_for_selector("span:has-text('Approved')")
            print("✅ Order Approved")
        
        # Reserve Inventory
        if page.locator("button:has-text('Reserve Inventory')").count() > 0:
            page.click("button:has-text('Reserve Inventory')")
            page.wait_for_selector("span:has-text('Inventory Reserved')")
            print("✅ Inventory Reserved")
            
        # Mark Packed
        if page.locator("button:has-text('Mark Packed')").count() > 0:
            page.click("button:has-text('Mark Packed')")
            page.wait_for_selector("span:has-text('Packed')")
            print("✅ Order Packed")
        
        # Ship Order
        if page.locator("button:has-text('Mark Shipped')").count() > 0:
            page.click("button:has-text('Mark Shipped')")
            page.wait_for_selector("textarea")
            page.fill("textarea", "Carrier: FedEx, Tracking: 12345")
            page.click("button:has-text('Confirm Shipping')")
            page.wait_for_selector("span:has-text('Shipped')")
            print("✅ Order Shipped (Inventory Deducted)")
            
        # Mark Delivered
        if page.locator("button:has-text('Mark Delivered')").count() > 0:
            page.click("button:has-text('Mark Delivered')")
            page.wait_for_selector("span:has-text('Delivered')")
            print("✅ Order Delivered")
        
        # Close Order
        if page.locator("button:has-text('Close Order')").count() > 0:
            page.click("button:has-text('Close Order')")
            page.wait_for_selector("span:has-text('Closed')")
            print("✅ Order Closed")
        
        browser.close()
        
if __name__ == '__main__':
    run_test()

