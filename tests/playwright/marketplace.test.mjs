/**
 * Marketplace Test Suite
 * Tests marketplace UI variations, product browsing, and checkout flow
 * Outputs: tests/outputs/marketplace/
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '../outputs/marketplace');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 Marketplace Test Suite\n');

  try {
    console.log('Step 1: Testing initial marketplace load (Amazon style)...');
    await page.goto('http://localhost:3000/marketplace');

    // Close zone modal if it appears
    try {
      await page.waitForSelector('button:has-text("Continue")', { timeout: 2000 });
      await page.click('button:has-text("Continue")');
      console.log('   Zone modal closed');
    } catch (e) {
      console.log('   No zone modal (already dismissed)');
    }

    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '01-marketplace-amazon.png'),
      fullPage: true
    });
    console.log('✓ Amazon-style layout screenshot saved');

    console.log('\nStep 2: Testing product detail page...');
    // Navigate directly to a product detail page
    await page.goto('http://localhost:3000/marketplace/product-1');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '02-product-detail.png'),
      fullPage: true
    });
    console.log('✓ Product detail screenshot saved');

    console.log('\nStep 3: Testing checkout modal...');
    await page.click('button:has-text("Buy Now")');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '03-checkout-modal.png'),
      fullPage: true
    });
    console.log('✓ Checkout modal screenshot saved');

    console.log('\nStep 4: Closing checkout modal and navigating back...');
    // Close the checkout modal by pressing Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    await page.goto('http://localhost:3000/marketplace');

    // Handle zone modal again if needed
    try {
      await page.waitForSelector('button:has-text("Continue")', { timeout: 1000 });
      await page.click('button:has-text("Continue")');
    } catch (e) {
      // Modal already dismissed
    }

    await page.waitForTimeout(2000);

    console.log('\nStep 5: Testing UI variations...');

    // Wait for any modals/overlays to close
    try {
      await page.waitForSelector('[data-slot="dialog-overlay"]', { state: 'hidden', timeout: 3000 });
    } catch (e) {
      console.log('   No overlay detected');
    }

    const uiStyles = [
      { name: 'ubereats', label: 'Visual Cards', description: 'Uber Eats style' },
      { name: 'pinterest', label: 'Image Wall', description: 'Pinterest style' },
      { name: 'minimalist', label: 'Minimalist', description: 'Minimalist style' },
      { name: 'proximity', label: 'Local Focus', description: 'Proximity style' }
    ];

    for (const [index, style] of uiStyles.entries()) {
      console.log(`   Testing ${style.label} style...`);

      // Click the Layout dropdown button with force to bypass any overlays
      await page.click('button:has-text("Layout")', { force: true });
      await page.waitForTimeout(500);

      // Click the specific style option
      await page.click(`text=${style.label}`);
      await page.waitForTimeout(1500);

      await page.screenshot({
        path: join(OUTPUT_DIR, `04-${index + 1}-${style.name}.png`),
        fullPage: true
      });
      console.log(`   ✓ ${style.label} screenshot saved`);
    }

    console.log('\n✅ All marketplace tests completed successfully!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
