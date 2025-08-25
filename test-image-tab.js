const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await page.click('text=Image');
  await page.screenshot({ path: 'image-tab-test.png' });
  
  await browser.close();
})();