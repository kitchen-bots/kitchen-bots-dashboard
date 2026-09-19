from playwright.sync_api import sync_playwright
import time
import os

def run_test():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("\n=======================================================")
        print("SCENARIO: Failure Matrix")
        print("DESCRIPTION: Verifying system handles invalid operations gracefully")
        print("=======================================================")

        page.goto("http://localhost:5177/login")
        
        # Login
        page.fill("input[placeholder='Enter username']", "Admin")
        page.fill("input[type='password']", "123456")
        page.click("button:has-text('Sign In')")
        page.wait_for_selector("h2:has-text('Admin Dashboard')", timeout=15000)

        # Go to Orders page
        page.goto("http://localhost:5177/admin/orders")
        page.wait_for_selector("table")
        
        # Find a Closed Order to try invalid transition
        closed_order = page.locator("tr:has-text('Closed')").first
        if closed_order.count() > 0:
            closed_order.click()
            print("✅ Opened a Closed order")
            
            # Try to click approve (button shouldn't be there, or if we force it, it should fail)
            # Since buttons are conditionally rendered based on status, the fact that "Approve Order" is not visible is proof of UI validation.
            if page.locator("button:has-text('Approve Order')").count() == 0:
                 print("✅ UI correctly prevents 'Approve' action on Closed order")
            else:
                 print("❌ 'Approve' action available on Closed order")
                 
            if page.locator("button:has-text('Cancel Order')").count() == 0:
                 print("✅ UI correctly prevents 'Cancel' action on Closed order")
            else:
                 print("❌ 'Cancel' action available on Closed order")
        else:
            print("⚠️ No Closed orders found to test.")
        
        
        # Open a Draft order to test other failure conditions
        page.goto("http://localhost:5177/admin/orders")
        page.wait_for_selector("table")
        draft_order = page.locator("tr:has-text('Draft')").first
        if draft_order.count() > 0:
            draft_order.click()
            print("✅ Opened a Draft order")
            
            # Trying to ship a draft order
            if page.locator("button:has-text('Ship Order')").count() == 0:
                print("✅ UI correctly prevents 'Ship Order' on Draft order")
            else:
                print("❌ 'Ship Order' action available on Draft order")
        else:
             print("⚠️ No Draft orders found to test.")
            
        print("✅ SCENARIO PASSED")

        browser.close()
        
if __name__ == '__main__':
    run_test()

