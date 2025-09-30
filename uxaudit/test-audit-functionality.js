const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    
    console.log('Entering test URL...');
    await page.fill('input[type="url"]', 'https://example.com');
    
    console.log('Clicking audit button...');
    await page.click('text=Start AI Audit');
    
    console.log('Waiting for analysis to complete...');
    // Wait for the report to load (up to 60 seconds)
    await page.waitForTimeout(60000);
    
    console.log('Taking screenshot of the report...');
    await page.screenshot({ path: 'test-report-with-screenshot.png', fullPage: true });
    
    console.log('Test completed! Check test-report-with-screenshot.png');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
})();