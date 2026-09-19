const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.new_page();
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="text"]', 'Admin');
  await page.fill('input[type="password"]', '12345');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  await page.goto('http://localhost:5173/admin/orders');
  await page.waitForTimeout(2000);
  await browser.close();
})();
