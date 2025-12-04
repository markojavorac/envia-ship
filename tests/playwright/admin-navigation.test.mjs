/**
 * Admin Navigation Test Suite
 * Tests the admin header navigation, dark theme, and transitions
 * Outputs: tests/outputs/admin-navigation/
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '../outputs/admin-navigation');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 Admin Navigation Test Suite\n');

  try {
    console.log('Step 1: Testing user-facing header (Home page)...');
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '01-user-header-home.png'),
      fullPage: false
    });
    console.log('✓ User header screenshot saved');

    console.log('\nStep 2: Testing admin header (Dashboard)...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '02-admin-header-dashboard.png'),
      fullPage: false
    });
    console.log('✓ Admin dashboard header screenshot saved');

    console.log('\nStep 3: Testing admin header (Orders - active state)...');
    await page.goto('http://localhost:3000/admin/orders');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '03-admin-header-orders.png'),
      fullPage: false
    });
    console.log('✓ Admin orders header screenshot saved');

    console.log('\nStep 4: Testing admin header (Products - active state)...');
    await page.goto('http://localhost:3000/admin/products');
    await page.waitForTimeout(1500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '04-admin-header-products.png'),
      fullPage: false
    });
    console.log('✓ Admin products header screenshot saved');

    console.log('\nStep 5: Testing mobile menu (admin)...');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(1000);
    await page.click('button[aria-label="Toggle menu"]');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: join(OUTPUT_DIR, '05-mobile-menu-admin.png'),
      fullPage: true
    });
    console.log('✓ Mobile menu screenshot saved');

    console.log('\n✅ All admin navigation tests completed successfully!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
