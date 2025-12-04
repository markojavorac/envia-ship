# Testing Infrastructure

Organized Playwright test suites for Envia Ship application.

## Directory Structure

```
tests/
├── playwright/              # Test scripts
│   ├── admin-dashboard.test.mjs
│   ├── admin-navigation.test.mjs
│   └── marketplace.test.mjs
└── outputs/                 # Test screenshots (auto-generated)
    ├── admin-dashboard/
    ├── admin-navigation/
    ├── marketplace/
    └── ui-variations/
```

## Running Tests

Make sure your development server is running on `http://localhost:3000`:

```bash
npm run dev
```

Then run individual test suites:

```bash
# Test admin dashboard (analytics, charts, tables)
node tests/playwright/admin-dashboard.test.mjs

# Test admin navigation (header, dark theme, transitions)
node tests/playwright/admin-navigation.test.mjs

# Test marketplace (UI variations, products, checkout)
node tests/playwright/marketplace.test.mjs
```

## Output Management

- Screenshots are saved to `tests/outputs/{test-suite-name}/`
- Each test run **overwrites** previous screenshots (keeps only latest)
- Naming convention: `01-descriptive-name.png`, `02-next-step.png`, etc.

## Test Suites

### Admin Dashboard (`admin-dashboard.test.mjs`)
Tests the merchant admin dashboard functionality:
- Analytics dashboard with charts and stats
- Orders table with filtering and sorting
- Order detail modal
- Products table with inline editing

**Outputs:** `tests/outputs/admin-dashboard/`

### Admin Navigation (`admin-navigation.test.mjs`)
Tests the admin header navigation and theme switching:
- User-facing header (light theme)
- Admin header (dark theme)
- Active page highlighting
- Mobile menu responsiveness

**Outputs:** `tests/outputs/admin-navigation/`

### Marketplace (`marketplace.test.mjs`)
Tests the customer-facing marketplace:
- Initial marketplace load (Amazon-style default)
- Product detail page
- Checkout modal
- All 5 UI variations (Amazon, Uber Eats, Pinterest, Minimalist, Proximity)

**Outputs:** `tests/outputs/marketplace/`

## Adding New Tests

1. Create new test file in `tests/playwright/`
2. Use consistent naming: `feature-name.test.mjs`
3. Create corresponding output directory in `tests/outputs/`
4. Follow existing test structure with clear step logging
5. Update this README with test description

## Tips

- Use `headless: false` for debugging (see browser)
- Adjust `waitForTimeout` values if tests fail due to slow loading
- Screenshots are taken with `fullPage: true` by default
- Check `tests/outputs/` for visual verification after test runs
