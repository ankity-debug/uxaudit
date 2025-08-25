const playwright = require('playwright');
const fs = require('fs');

async function testUpdatedLayout() {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Fill in the audit form
    await page.fill('input[placeholder*="https://example.com"]', 'https://stripe.com');
    
    // Click the audit button
    await page.click('button:has-text("Start AI Audit")');
    
    // Wait for the audit to complete
    await page.waitForTimeout(15000);
    
    // Take screenshot of the audit report
    await page.screenshot({ path: 'audit-report-updated.png', fullPage: true });
    
    // Check if there's a deep dive button and click it
    try {
      await page.waitForSelector('button:has-text("Deep Dive")', { timeout: 5000 });
      await page.click('button:has-text("Deep Dive")');
      await page.waitForTimeout(3000);
      
      // Take screenshot of the deep dive report
      await page.screenshot({ path: 'deep-dive-updated.png', fullPage: true });
      
      console.log('✅ Screenshots captured successfully!');
    } catch (e) {
      console.log('⚠️  Deep dive not available, taking current page screenshot');
      await page.screenshot({ path: 'current-report-updated.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testUpdatedLayout();