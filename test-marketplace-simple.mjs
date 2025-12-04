import { chromium } from '@playwright/test';

async function captureMarketplace() {
  console.log('🚀 Starting simple marketplace capture...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  try {
    // Navigate to marketplace
    console.log('📍 Navigating to marketplace...');
    await page.goto('http://localhost:3000/marketplace', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Check if zone modal is present
    const modalVisible = await page.locator('[role="dialog"]').isVisible().catch(() => false);

    if (modalVisible) {
      console.log('🗺️  Zone modal detected - setting zone...');
      // Click the select trigger inside the dialog
      await page.locator('[role="dialog"] [role="combobox"]').click();
      await page.waitForTimeout(500);
      // Select Zona 10
      await page.locator('[role="option"]').filter({ hasText: 'Zona 10' }).click();
      await page.waitForTimeout(500);
      // Click continue button
      await page.locator('[role="dialog"] button').filter({ hasText: 'Continue' }).click();
      await page.waitForTimeout(2000);
    }

    // Capture initial page
    console.log('📸 Capturing marketplace page...');
    await page.screenshot({ path: 'marketplace-initial.png', fullPage: true });

    // Check page elements
    console.log('\n🔍 Checking page elements...');
    const productCards = await page.locator('[class*="border-primary"]').count();
    console.log(`   ✓ Found ${productCards} product-related elements`);

    // Try to find and click first product
    console.log('\n📦 Navigating to product detail...');
    const productLink = page.locator('a[href^="/marketplace/product-"]').first();
    if (await productLink.isVisible()) {
      await productLink.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'marketplace-product-detail.png', fullPage: true });
      console.log('   ✓ Product detail page captured');

      // Try to open checkout modal
      console.log('\n🛒 Opening checkout modal...');
      const buyButton = page.locator('button').filter({ hasText: 'Buy Now' });
      if (await buyButton.isVisible()) {
        await buyButton.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: 'marketplace-checkout.png' });
        console.log('   ✓ Checkout modal captured');
      }
    }

    console.log('\n✅ Simple capture completed!');
    console.log('\n📁 Screenshots saved:');
    console.log('  - marketplace-initial.png');
    console.log('  - marketplace-product-detail.png');
    console.log('  - marketplace-checkout.png');

    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will remain open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    await page.screenshot({ path: 'marketplace-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

captureMarketplace();
