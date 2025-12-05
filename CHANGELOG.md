# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **AI-Powered Product Onboarding** - Revolutionary seller onboarding experience
  - 3-step wizard: Upload Photos → AI Analysis → Review & Publish
  - Gemini 2.5 Flash vision AI analyzes 1-5 product images
  - Auto-generates: product name, description (3 tones), dimensions, weight, category, tags
  - Confidence indicators for AI estimations with warnings for low-confidence fields
  - 3 description tones: Casual, Professional, Technical (regenerate with one click)
  - Price suggestions based on category and market analysis
  - Inline editing for all fields with real-time validation
  - Mock AI mode for testing without API calls (`NEXT_PUBLIC_USE_MOCK_AI=true`)
  - Reduces onboarding time from 15 minutes to 30 seconds
  - Add Product button on /admin/products page
  - New route: `/admin/products/new` with complete wizard UI
  - Admin dark theme styling throughout wizard components
- **Admin Dashboard** - Complete merchant back office for marketplace operations
  - Dark theme with orange/navy brand colors preserved
  - Context-aware navigation: Header transforms between user-facing and admin modes
  - Three main sections: Dashboard, Orders, Products (accessible via Header navigation)
  - AdminContext provider for centralized state management (225 mock orders)
- **Admin Navigation System** - Smart header that adapts to admin context
  - User mode: Home, Calculator, Marketplace links + Admin dashboard icon
  - Admin mode: Dashboard, Orders, Products links (with icons) + Store icon to return
  - Active page highlighting with orange accent color
  - "IT Help" button in admin mode (replaces "Contact" button)
  - Dark theme header styling for admin routes (slate-800 background)
  - Mobile-responsive with adaptive menu
- **Analytics Dashboard** (`/admin`)
  - 4 stats cards: Total Orders, Revenue, Pending Count, Avg Order Value
  - Revenue Over Time area chart (90-day weekly trends)
  - Orders by Category donut chart with center total
  - Orders by Zone bar chart with delivery distribution
  - Top 10 Products horizontal bar chart by units sold
  - All charts built with shadcn/ui + Recharts
- **Order Management** (`/admin/orders`)
  - TanStack Table with sorting, filtering, pagination (20 per page)
  - Status filter tabs (All, Pending, Confirmed, Shipped, Delivered)
  - Global search by customer name or order ID
  - Order detail sheet with full order information
  - Status update functionality with in-memory persistence
  - Color-coded status badges (pending=orange, confirmed=blue, shipped=purple, delivered=green)
- **Product Management** (`/admin/products`)
  - TanStack Table with inline editing capabilities
  - Edit product name, price, stock, and category
  - Category and stock level filters
  - Global search across products
  - Color-coded stock indicators (red <10, orange <30, green ≥30)
  - Pagination (50 products per page)
- **Mock Data Generation**
  - 200-250 realistic mock orders with proper distributions
  - Status distribution: 10% pending, 15% confirmed, 30% shipped, 45% delivered
  - Date weighting: 60% orders in last 30 days, 40% older
  - Realistic customer names, phone numbers, addresses (Guatemalan patterns)
  - Order totals ranging Q10-500 with shipping costs
- Complete marketplace feature with 5 switchable UI variations
  - Amazon-style: Dense grid with left sidebar filters
  - Uber Eats-style: Visual browsing with category tabs
  - Pinterest-style: Masonry grid with hover overlays
  - Minimalist/Apple-style: Spacious grid with huge images
  - Proximity/Local-style: Zone-grouped sections
- 70 mock products across 3 categories (Food, Medical, Retail)
- Zone-based shipping price integration
- Product detail pages with image galleries and seller information
- Single product instant checkout flow with form validation
- Filtering and sorting by category, price, rating, zone, stock
- First-visit zone selection modal with localStorage persistence
- Marketplace control bar with zone and layout selectors
- **Organized Testing Infrastructure** (`tests/` directory)
  - Playwright test suites for admin dashboard, navigation, and marketplace
  - Auto-organized output folders (`tests/outputs/`) with overwrite-on-rerun behavior
  - Test documentation in `tests/README.md`
  - 3 comprehensive test suites: admin-dashboard, admin-navigation, marketplace
- Comprehensive documentation (README.md, MARKETPLACE.md, CHANGELOG.md, tests/README.md)
- Contact page with business information
- Documentation guidelines in CLAUDE.md for when to update docs

### Fixed
- **Admin dark theme architecture** - Implemented proper Tailwind v4 color token overrides
  - Added `[data-theme="admin"]` CSS variable scope in globals.css
  - Override both base CSS variables (`--background`, `--foreground`, etc.) and Tailwind v4 color tokens (`--color-background`, `--color-foreground`, etc.)
  - Ensures dark theme persists across all admin pages and components
  - Fixed Header component dark theme by applying explicit HSL colors for admin routes
  - Verified via Playwright automated testing with visual confirmation
- MarketplaceContext provider scope (now wraps entire app at root layout)
- Marketplace control bar positioning (now below hero, aligned with content)
- Header dropdown styling (white background with navy text, proper borders)
- UI style switcher text cutoff (now shows "Layout" instead of truncated view name)
- Navigation links alignment (centered in header)
- Dropdown z-index issues (z-[100] to prevent cutoff)
- Duplicate zone information display in marketplace hero
- Image loading system (switched from Unsplash to placehold.co for reliability)
- Design system compliance (strict orange + navy only, removed all teal/accent colors)

### Enhanced
- **Orders by Category Chart** - Improved data visualization with custom left-side legend
  - Legend positioned vertically on left side (desktop) or above chart (mobile)
  - Displays category names, order counts, and percentages for improved data accessibility
  - Chart enlarged and more prominent with optimized spacing and minimal margins
  - Maintains industrial aesthetic with 4px border radius, tight spacing, and muted colors
  - Research-backed color palette: Orange (33°), Teal (195°), Purple (275°) for maximum distinction
  - Fixed color indicators using actual HSL values instead of CSS variables for proper rendering
- **Admin Layout** - Footer removed from admin pages
  - Footer now only displays on user-facing pages (Home, Calculator, Marketplace, Contact)
  - Admin dashboard maintains clean, focused interface without company information footer

### Changed
- **Testing Infrastructure** - Reorganized Playwright tests for better maintainability
  - Moved all test scripts from root to `tests/playwright/` directory
  - Created organized output structure in `tests/outputs/` with test-specific folders
  - Implemented overwrite-on-rerun system (keeps only latest screenshots)
  - Removed AdminNav component (redundant, navigation now in Header)
  - Cleaned up 20+ old test files from root directory
- Updated CLAUDE.md to be lightweight (<200 lines) with only high-level project instructions
- Moved detailed implementation documentation to README.md
- Refactored marketplace components to use consistent design patterns
- Improved mobile responsiveness across all UI variations
- Simplified marketplace hero section (removed large centered design)
- Header CTA button changed from "Get Quote" to "Contact"
- Marketplace header simplified to navy text on white background

## [0.2.0] - 2025-12-04

### Added
- Complete marketplace system
- Global MarketplaceContext for state management
- Mock product data generator
- Shipping calculator integration for marketplace
- Product filtering and sorting utilities
- Zone modal for first-time visitors
- Checkout form with Zod validation

### Changed
- Header now includes marketplace-specific controls
- Root layout updated to include MarketplaceProvider
- Navigation expanded to include Marketplace link

## [0.1.0] - 2025-12-03

### Added
- Initial project setup with Next.js 15.5.7
- Shipping calculator with real-time price calculation
- Zone-to-zone shipping within Guatemala City
- Multiple service types (Standard, Express, International)
- Dimensional weight calculation
- React Hook Form + Zod validation
- Theme system with React Context
- shadcn/ui component integration
- Mobile-responsive design
- Dynamic favicon

### Design System
- Established color palette (Orange #FF8C00, Navy #1E3A5F, White)
- Typography system (Inter, DM Sans, JetBrains Mono)
- Condensed spacing scale
- Bold typography for headings and navigation
- Orange focus states for form inputs

### Components
- Header with navigation and CTA button
- Footer with 3-column layout
- ShippingCalculatorForm
- PricingResultsCard
- Home page with hero, features, and CTA sections

### Infrastructure
- Tailwind CSS v4 with CSS variables
- PostCSS configuration
- TypeScript with strict mode
- ESLint configuration
- Vercel deployment optimization

---

## Notes

### Version Format
- **Major** (X.0.0): Breaking changes, major feature releases
- **Minor** (0.X.0): New features, backwards-compatible
- **Patch** (0.0.X): Bug fixes, small improvements

### Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Deprecated**: Soon-to-be removed features
- **Removed**: Removed features
- **Fixed**: Bug fixes
- **Security**: Security fixes
