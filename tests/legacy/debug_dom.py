from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        page.goto('http://localhost:5175/login')
        page.wait_for_selector('body', timeout=5000)
        
        inputs = page.query_selector_all('input')
        for inp in inputs:
            print(f"Input: type={inp.get_attribute('type')} placeholder={inp.get_attribute('placeholder')}")
        
        print("\nHeadings:")
        headings = page.query_selector_all('h1, h2, h3')
        for h in headings:
            print(f"Heading: {h.inner_text()}")
            
        print("\nButtons:")
        buttons = page.query_selector_all('button')
        for b in buttons:
            print(f"Button: {b.inner_text()}")
            
        browser.close()

if __name__ == '__main__':
    run()
