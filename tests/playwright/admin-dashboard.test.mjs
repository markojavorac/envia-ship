/**
 * Admin Dashboard Test Suite
 * Tests the admin dashboard analytics, charts, and stats
 * Outputs: tests/outputs/admin-dashboard/
 */

import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, '../outputs/admin-dashboard');

// Ensure output directory exists
mkdirSync(OUTPUT_DIR, { recursive: true });

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🧪 Admin Dashboard Test Suite\n');

  try {
    console.log('Step 1: Testing analytics dashboard...');
    await page.goto('http://localhost:3000/admin');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '01-analytics-dashboard.png'),
      fullPage: true
    });
    console.log('✓ Analytics dashboard screenshot saved');

    console.log('\nStep 2: Testing orders page...');
    await page.goto('http://localhost:3000/admin/orders');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '02-orders-table.png'),
      fullPage: true
    });
    console.log('✓ Orders table screenshot saved');

    console.log('\nStep 3: Testing order detail modal...');
    await page.click('button:has-text("View")');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '03-order-detail.png'),
      fullPage: true
    });
    console.log('✓ Order detail modal screenshot saved');

    console.log('\nStep 4: Testing products page...');
    await page.goto('http://localhost:3000/admin/products');
    await page.waitForTimeout(2000);
    await page.screenshot({
      path: join(OUTPUT_DIR, '04-products-table.png'),
      fullPage: true
    });
    console.log('✓ Products table screenshot saved');

    console.log('\n✅ All admin dashboard tests completed successfully!');
    console.log(`📁 Screenshots saved to: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
})();
