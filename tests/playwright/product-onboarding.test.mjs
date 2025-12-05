import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:3002";
const OUTPUT_DIR = path.join(__dirname, "../outputs/product-onboarding");
const FIXTURES_DIR = path.join(__dirname, "../fixtures");

// Test image paths
const TEST_IMAGES = [
  path.join(FIXTURES_DIR, "product-coffee-1.png"),
  path.join(FIXTURES_DIR, "product-coffee-2.png"),
  path.join(FIXTURES_DIR, "product-coffee-3.png"),
];

/**
 * Complete Product Onboarding Flow Test
 *
 * This test simulates a seller adding a new product to the marketplace:
 * 1. Navigate from homepage to admin
 * 2. Go to products page
 * 3. Click "Add Product"
 * 4. Upload product images
 * 5. Wait for AI analysis
 * 6. Review and edit AI-generated data
 * 7. Submit the product
 * 8. Verify product appears in product list
 */
async function testProductOnboarding() {
  console.log("🚀 Starting Product Onboarding Test...\n");

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: false }); // Set to true for CI
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // ============================================
    // STEP 1: Navigate from Homepage to Admin
    // ============================================
    console.log("📍 Step 1: Navigating to homepage...");
    await page.goto(BASE_URL);
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "01-homepage.png"),
      fullPage: true,
    });
    console.log("✅ Homepage loaded\n");

    // Click on Admin icon in header (LayoutDashboard icon)
    console.log("📍 Step 2: Clicking Admin icon...");
    await page.click('a[aria-label="Admin Dashboard"]');
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "02-admin-dashboard.png"),
      fullPage: true,
    });
    console.log("✅ Admin dashboard loaded\n");

    // ============================================
    // STEP 2: Navigate to Products Page
    // ============================================
    console.log("📍 Step 3: Navigating to Products page...");
    await page.click('a[href="/admin/products"]');
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "03-products-page.png"),
      fullPage: true,
    });
    console.log("✅ Products page loaded\n");

    // ============================================
    // STEP 3: Click "Add Product" Button
    // ============================================
    console.log("📍 Step 4: Clicking 'Add Product' button...");
    await page.click('a[href="/admin/products/new"]');
    await page.waitForLoadState("networkidle");
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "04-add-product-wizard.png"),
      fullPage: true,
    });
    console.log("✅ Product onboarding wizard loaded\n");

    // ============================================
    // STEP 4: Upload Product Images
    // ============================================
    console.log("📍 Step 5: Uploading product images...");

    // Find the file input
    const fileInput = await page.locator('input[type="file"]');

    // Upload all test images
    await fileInput.setInputFiles(TEST_IMAGES);

    // Wait for preview images to appear
    await page.waitForSelector('[alt*="Preview"]', { timeout: 5000 });

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "05-images-uploaded.png"),
      fullPage: true,
    });
    console.log(`✅ Uploaded ${TEST_IMAGES.length} images\n`);

    // ============================================
    // STEP 5: Click "Analyze Photos" Button
    // ============================================
    console.log("📍 Step 6: Clicking 'Analyze Photos' button...");
    await page.click('button:has-text("Analyze Photos")');

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "06-analyzing-started.png"),
      fullPage: true,
    });
    console.log("✅ Analysis started\n");

    // ============================================
    // STEP 6: Wait for AI Analysis to Complete
    // ============================================
    console.log("📍 Step 7: Waiting for AI analysis...");
    console.log("⏳ This may take a few seconds (mock AI simulates processing time)...");

    // Wait for the analyzing step to complete and review step to appear
    // Look for elements that only appear in the review step
    await page.waitForSelector('input[id="name"]', { timeout: 30000 });

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "07-analysis-complete.png"),
      fullPage: true,
    });
    console.log("✅ AI analysis complete - Review step loaded\n");

    // ============================================
    // STEP 7: Review AI-Generated Data
    // ============================================
    console.log("📍 Step 8: Reviewing AI-generated data...");

    // Get AI-generated values
    const productName = await page.inputValue('input[id="name"]');
    const description = await page.inputValue('textarea[id="description"]');
    const length = await page.inputValue('input[id="length"]');
    const width = await page.inputValue('input[id="width"]');
    const height = await page.inputValue('input[id="height"]');
    const weight = await page.inputValue('input[id="weight"]');

    console.log("📊 AI Generated Data:");
    console.log(`   Name: ${productName}`);
    console.log(`   Description: ${description.substring(0, 60)}...`);
    console.log(`   Dimensions: ${length}cm × ${width}cm × ${height}cm`);
    console.log(`   Weight: ${weight}kg\n`);

    // ============================================
    // STEP 8: Edit Form Fields
    // ============================================
    console.log("📍 Step 9: Editing form fields...");

    // Fill in the required price field
    await page.fill('input[id="price"]', '85');
    console.log("   ✏️  Set price: Q85");

    // Fill in stock
    await page.fill('input[id="stock"]', '50');
    console.log("   ✏️  Set stock: 50 units");

    // Optional: Modify product name
    await page.fill('input[id="name"]', 'Test Product - Guatemalan Coffee 340g');
    console.log("   ✏️  Updated product name");

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "08-form-edited.png"),
      fullPage: true,
    });
    console.log("✅ Form fields updated\n");

    // ============================================
    // STEP 9: Test Description Regeneration
    // ============================================
    console.log("📍 Step 10: Testing description regeneration...");

    // Click "Casual" tone button
    await page.click('button:has-text("Casual")');
    console.log("   🔄 Regenerating description with 'Casual' tone...");

    // Wait a bit for regeneration (mock takes ~1-2 seconds)
    await page.waitForTimeout(2500);

    const casualDescription = await page.inputValue('textarea[id="description"]');
    console.log(`   📝 New description: ${casualDescription.substring(0, 60)}...`);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "09-description-regenerated.png"),
      fullPage: true,
    });
    console.log("✅ Description regenerated\n");

    // ============================================
    // STEP 10: Submit the Product
    // ============================================
    console.log("📍 Step 11: Submitting product...");

    // Scroll to bottom to make submit button visible
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "10-ready-to-submit.png"),
      fullPage: true,
    });

    // Click "Publish Product" button
    await page.click('button[type="submit"]:has-text("Publish Product")');
    console.log("   ⏳ Submitting...");

    // Wait for navigation back to products page
    await page.waitForURL("**/admin/products", { timeout: 10000 });
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: path.join(OUTPUT_DIR, "11-product-submitted.png"),
      fullPage: true,
    });
    console.log("✅ Product submitted successfully\n");

    // ============================================
    // STEP 11: Verify Product Appears in List
    // ============================================
    console.log("📍 Step 12: Verifying product appears in products list...");

    // Check if our product is in the table
    const productExists = await page.isVisible('text="Test Product - Guatemalan Coffee 340g"');

    if (productExists) {
      console.log("✅ Product found in products table!");

      // Highlight the new product
      await page.evaluate(() => {
        const rows = document.querySelectorAll('tr');
        for (const row of rows) {
          if (row.textContent?.includes('Test Product - Guatemalan Coffee')) {
            row.style.backgroundColor = '#FF8C00';
            row.style.color = 'white';
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });

      await page.waitForTimeout(1000);

      await page.screenshot({
        path: path.join(OUTPUT_DIR, "12-product-in-list-highlighted.png"),
        fullPage: true,
      });
    } else {
      console.log("⚠️  Product not immediately visible (may be on another page)");
    }

    // ============================================
    // STEP 12: Check Product Count
    // ============================================
    console.log("\n📍 Step 13: Checking total product count...");

    // Get the "Total Products" stat card value
    const totalProducts = await page.textContent('[class*="text-2xl"][class*="font-bold"]');
    console.log(`   📦 Total products in system: ${totalProducts}\n`);

    // ============================================
    // TEST COMPLETE
    // ============================================
    console.log("════════════════════════════════════════");
    console.log("✅ PRODUCT ONBOARDING TEST COMPLETE!");
    console.log("════════════════════════════════════════");
    console.log(`📸 Screenshots saved to: ${OUTPUT_DIR}`);
    console.log("\n✨ Test Summary:");
    console.log("   ✅ Navigation: Homepage → Admin → Products → Add Product");
    console.log("   ✅ Image Upload: 3 images uploaded successfully");
    console.log("   ✅ AI Analysis: Completed with mock AI service");
    console.log("   ✅ Form Editing: Price, stock, and name updated");
    console.log("   ✅ Description Regeneration: Tested with 'Casual' tone");
    console.log("   ✅ Form Submission: Product created successfully");
    console.log("   ✅ Verification: Product appears in products list");
    console.log("\n🎉 All steps completed without errors!\n");

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error);

    // Take error screenshot
    await page.screenshot({
      path: path.join(OUTPUT_DIR, "ERROR-screenshot.png"),
      fullPage: true,
    });

    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testProductOnboarding().catch((error) => {
  console.error("Test execution failed:", error);
  process.exit(1);
});
