const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Testing Case Study Matching in Report...');
    
    // Navigate to homepage
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    console.log('📝 Entering FinTech test URL...');
    await page.fill('input[type="url"]', 'https://stripe.com');
    
    console.log('🔍 Starting audit...');
    await page.click('text=Start AI Audit');
    
    // Wait for loading state
    await page.waitForSelector('text=Analyzing', { timeout: 10000 });
    console.log('⏳ Analysis in progress...');
    
    // Wait for completion (or timeout after 30 seconds)
    try {
      await page.waitForSelector('text=Relevant Case Studies', { timeout: 45000 });
      console.log('✅ Report generated successfully!');
      
      // Scroll to case studies section
      await page.evaluate(() => {
        const caseStudiesSection = document.querySelector('text=Relevant Case Studies')?.closest('div');
        if (caseStudiesSection) {
          caseStudiesSection.scrollIntoView({ behavior: 'smooth' });
        }
      });
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'case-study-demo.png', fullPage: true });
      console.log('📸 Screenshot saved: case-study-demo.png');
      
    } catch (error) {
      console.log('⏰ Timeout waiting for completion, taking current screenshot...');
      await page.screenshot({ path: 'case-study-demo-loading.png', fullPage: true });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'case-study-demo-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed!');
  }
})();