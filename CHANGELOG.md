# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-12-13

### Added
- **Admin: Reports Dashboard UI**
  - **Reports page**: Comprehensive analytics dashboard at `/admin/reports`
  - **Trip history table**: Sortable table with driver, route, duration, completion time
  - **Performance cards**: Driver-specific metrics (completion rate, avg time, fastest/slowest)
  - **Filtering**: Filter by driver and date range
  - **CSV export**: Download trip history as CSV file using papaparse
  - **Auto-refresh**: Manual refresh button with loading states
  - **Empty states**: Friendly messages when no data exists
  - **Admin-only access**: Protected by middleware (drivers cannot access)
  - Files added:
    - `app/admin/reports/page.tsx` - Main reports dashboard
    - `components/admin/reports/TripHistoryTable.tsx` - Sortable trip table
    - `components/admin/reports/DriverPerformanceCards.tsx` - Performance metrics cards
    - `components/admin/reports/DateRangeFilter.tsx` - Date range picker
    - `components/admin/reports/DriverFilter.tsx` - Driver selection filter

- **Mock Data: 18 Test Tickets**
  - **Seed script**: Automated mock data generation for testing
  - **Realistic data**: Guatemala City addresses, phone numbers, recipient names
  - **Multi-driver**: 18 tickets across 3 drivers (Carlos: 8, Maria: 6, Juan: 4)
  - **Mixed states**: Completed tickets with durations, pending tickets
  - **Time-based**: Tickets spread across last 3 days for realistic testing
  - Files added:
    - `scripts/seed-mock-tickets.ts` - Mock ticket generator and seeder

- **UI Improvements**
  - **Header logout button**: User info display with name, role badge, and logout button
  - **Driver assist user info**: Logged-in user display at top of driver assist page
  - **Navigation filtering**: Drivers only see "Driver Assist" link, admins see all
  - **Reports link**: Added to admin navigation menu
  - **API Integration**: Driver assist page now uses database API instead of localStorage
    - Optimistic UI updates for better perceived performance
    - Real-time error handling with toast notifications
    - Reload button to fetch latest tickets from database

- **Internationalization: Auth Features**
  - **Login page translations**: PIN login UI fully translated (English/Spanish)
  - **Session management**: Logout, role labels, session status messages
  - **Error messages**: Invalid PIN, session expired, server errors
  - Translation keys added:
    - `admin.auth.login.*` - Login page labels and errors
    - `admin.auth.session.*` - Session status and user info

- **Export Features: Branded PDF & CSV**
  - **PDF Export**: Professionally branded trip history reports
    - ENVÍA orange header with company logo
    - Filter summary (driver, date range)
    - Summary statistics (total trips, average duration)
    - Formatted table with trip details
    - Multi-page support with page numbers
    - Confidential footer on each page
  - **CSV Export**: Simple spreadsheet-ready format
  - **Dynamic filtering**: Exports respect active filters (driver selection, date range)
  - **Automatic filenames**: `envia-trip-history-YYYY-MM-DD.pdf/csv`
  - Files added:
    - `lib/reports/pdf-export.ts` - PDF generation with jsPDF and autoTable
  - Dependencies: `jspdf`, `jspdf-autotable`

- **Driver Assist: Mock Data & Future Database Preparation**
  - **Mock data system**: 18 realistic test tickets for reports testing
  - **localStorage persistence**: Tickets stored in browser localStorage
  - **Future database support**: Architecture designed for easy migration to Turso/LibSQL
  - **No authentication yet**: Admin pages are publicly accessible (auth coming in future version)
  - Files added:
    - `lib/admin/mock-driver-assist.ts` - Mock ticket data generation

### Changed
- **App default page**: Root URL (`/`) now redirects to `/admin/driver-assist` instead of marketplace
  - **Server-side redirect via middleware** (instant, no flash/delay)
  - Admin/driver system is now the primary application
  - Public marketplace accessible via `/marketplace`
- **Export buttons relocated**: Moved from page header to filters section
  - Now shows "X results to export" counter
  - Export buttons disabled when no results
  - Exports only the filtered/visible results in table
- **Navigation simplified**: Removed Dashboard link - navigation now shows only Dispatcher, Reports, and Driver Assist
- **DeliveryTicket type**: Added `driverId` and `sequenceNumber` fields in `lib/admin/driver-assist-types.ts`
- **Middleware simplified**: Now only handles root redirect, authentication removed for v0.3.0

### Tested
- **Build verification**:
  - ✅ Production build succeeds without errors
  - ✅ All imports resolved correctly
  - ✅ Linting passes with pre-existing issues suppressed
  - ✅ Formatting applied to all files
- **Manual testing** verified:
  - ✅ Root URL (`/`) redirects to `/admin/driver-assist`
  - ✅ Reports dashboard loads with mock data
  - ✅ Trip history table displays correctly
  - ✅ Export buttons in filters section
  - ✅ PDF export works with branded styling
  - ✅ CSV export works with filtered results
  - ✅ Driver filtering works correctly
  - ✅ Date range filtering works correctly
  - ✅ Navigation between admin pages works smoothly

### Previous Features (v0.2.0 and earlier)
- **Internationalization (i18n): Full Spanish/English Support**
  - **next-intl integration**: Implemented industry-standard i18n library for Next.js 15 App Router
  - **Language switcher**: Globe icon with 3-letter language code (ENG/ESP) in navigation
  - **Cookie-based locale detection**: Pure cookie-based approach (no URL changes, no middleware)
  - **Default locale**: English in all environments (easily configurable)
  - **Cookie persistence**: User language preference saved across sessions
  - **Comprehensive translations**: Core pages and components fully translated
    - **Public pages**: Home page (hero, features, CTA), Contact page (all labels)
    - **Header navigation**: All links with icons (Home, Calculator, Marketplace)
    - **Footer**: Quick Links, Contact Us
    - **Admin dashboard**: Stats cards (Total Orders, Total Revenue, Pending Orders, Avg Order Value)
    - **Driver Assist page**: Full translation (UP NEXT, Queue, From/To, Navigate/Done/Info/Delete buttons, timestamps)
  - **Translation infrastructure**:
    - Complete translation files: `messages/en.json` and `messages/es.json`
    - 500+ translation keys covering UI elements, zones, services, validation messages
    - TypeScript support with autocomplete for translation keys via `global.d.ts`
    - Structured by feature namespaces (home, contact, navigation, footer, common, etc.)
  - **Future-ready**: Translation structure prepared for calculator, marketplace, and all admin sections
  - Files added:
    - `src/i18n/request.ts` - Server-side cookie-based locale detection
    - `messages/en.json`, `messages/es.json` - Comprehensive translation files
    - `components/LanguageSwitcher.tsx` - Dropdown language toggle component
    - `global.d.ts` - TypeScript type definitions for translations
  - Files updated:
    - `next.config.ts` - next-intl plugin integration
    - `app/layout.tsx` - NextIntlClientProvider wrapper
    - `components/Header.tsx` - Translated navigation + icons + language switcher (white text)
    - `components/Footer.tsx` - Translated footer content
    - `components/LanguageSwitcher.tsx` - Improved dropdown styling with visible navy text
    - `app/page.tsx` - Translated home page with useTranslations hook
    - `app/contact/page.tsx` - Translated contact page
    - `app/admin/page.tsx` - Translated dashboard stats
    - `app/admin/driver-assist/page.tsx` - Translated page title and labels
    - `components/admin/driver-assist/TicketCard.tsx` - Translated all UI elements
  - Dependencies: `next-intl@3.x` for internationalization

- **Driver Assist: Navigation Timer**
  - **Live elapsed time**: Real-time timer displays on active tickets while driver is navigating
  - **Smart time formatting**: Automatically switches format based on duration
    - MM:SS format for deliveries under 60 minutes (e.g., "05:34")
    - HH:MM:SS format for deliveries 60+ minutes (e.g., "1:05:34")
  - **Completion tracking**: Shows total delivery time on completed tickets (e.g., "in 12m 34s")
  - **Persistent timing**: Timer data survives page refreshes via localStorage
  - **Visual design**:
    - Active timer: Orange badge with clock icon and animated pulsing colon
    - Completed time: Muted gray text next to "Done" badge
    - Overdue warning: Red color for timers exceeding 24 hours
  - **Smart behavior**:
    - Timer starts when "Navigate" button is clicked
    - Prevents reset if driver clicks Navigate multiple times
    - Only shows timer if navigation was initiated
  - **Performance optimized**: Component-level re-renders isolate timer updates from parent
  - **Accessibility**: Proper ARIA labels for screen readers
  - **Internationalized**: Timer labels in English and Spanish
  - Files added:
    - `components/admin/driver-assist/NavigationTimer.tsx` - Self-contained timer component
  - Files updated:
    - `lib/admin/driver-assist-types.ts` - Added `navigationStartedAt?: Date` field
    - `lib/admin/driver-assist-storage.ts` - Added `startNavigation()` function and date parsing
    - `components/admin/driver-assist/TicketCard.tsx` - Integrated timer display and start recording
    - `app/admin/driver-assist/page.tsx` - Added navigation start handler
    - `messages/en.json`, `messages/es.json` - Added timer translation keys

### Changed
- **Driver Assist: Redesigned Button Layout & Visual Hierarchy**
  - **Consolidated info display**: Merged eye/view modal into expandable "Info" dropdown
    - Info dropdown now shows all ticket details: recipient, phone, notes, coordinates, ticket photo
    - Removed redundant modal, streamlined interaction
  - **3-button layout**: Navigate, Done/Delete, Info buttons evenly spaced (33% width each)
  - **Solid color buttons** (no outlines) for better clarity:
    - Navigate: Orange (primary brand color)
    - Done: Green (success/completion)
    - Delete: Red (destructive action, when ticket completed)
    - Info: Navy/Secondary (information)
  - **Clear visual hierarchy for Up Next card**:
    - Up Next: Gray background + **4px orange border** (clearly stands out)
    - Queue cards: Gray background + normal border (same as before)
    - Orange outline makes active ticket unmistakable
  - **Improved header layout**: Ticket ID and timestamp inline with number badge
    - Eliminates empty space, better balance
    - More compact, information-dense design
  - **Mobile-optimized**: Buttons stack vertically on small screens, remain evenly distributed
  - Files updated: `TicketCard.tsx:1-500`

### Added
- **Driver Assist: Smooth Task Completion Animations**
  - **Swipe-away animation**: Completed tickets slide right and fade out (0.5s)
  - **Success flash**: Green overlay briefly flashes to confirm completion
  - **Next ticket slide-up**: Following ticket smoothly animates into "Up Next" position
  - **Visual feedback**: Clear indication that task is complete and next one is active
  - **Prevents double-clicks**: Animation locks interactions during transition
  - Powered by Framer Motion for 60fps smooth animations
  - Pattern based on proven mobile UI interactions (task managers, delivery apps)
  - Files updated: `TicketCard.tsx:1-140`, `page.tsx:5-164`
  - Dependencies: Added `framer-motion` for animation library

### Fixed
- **Driver Assist Navigation: Fixed Waze Deep Links**
  - **Corrected Waze URL format**: Changed from `https://www.waze.com/ul` to `https://waze.com/ul` (official format per Google Developers documentation)
  - **Removed unreliable waze:// scheme**: Eliminated custom URL scheme that fails silently when Waze app isn't installed
  - **Simplified navigation logic**: Universal deep link now automatically opens Waze app if installed, otherwise opens Waze web
  - **Mobile behavior**: Single `window.location.href` call opens Waze seamlessly
  - **Desktop behavior**: Opens Google Maps (Waze is primarily mobile-focused)
  - Files updated: `driver-assist-navigation.ts:20-94`

### Improved
- **Driver Assist Geocoding: Smart Fallback Strategies for Guatemala Addresses**
  - **Progressive query simplification**: Tries multiple query variations when initial geocoding fails
    - Extracts landmarks (e.g., "Oakland Mall") and searches separately
    - Falls back to zone-only searches (e.g., "Zona 10, Guatemala City")
    - Tries Spanish variations ("Ciudad de Guatemala")
    - Last resort: city center coordinates
  - **Better error messages**: Shows helpful suggestions when geocoding fails
    - Error: "Could not find this address. Try simplifying (e.g., just 'Zona 10, Guatemala City')"
  - **Improved coverage**: Successfully geocodes more Guatemala addresses despite OpenStreetMap's limited zone-based data
  - Files updated: `geocode/route.ts:55-200`, `driver-assist-geocoding.ts:50-56`

## [0.2.0] - 2025-12-06

### Changed
- **Driver Assist UI: Redesigned for Mobile-First Experience**
  - **Full-Width Row Layout**: Tickets now display as full-width rows instead of grid cards
    - Consistent layout across all screen sizes (mobile, tablet, desktop)
    - Better use of horizontal space for address information
    - Horizontal "Add Ticket" button matches row design
  - **Consolidated Information Display**: Cleaner, more compact ticket view
    - From/To addresses displayed side-by-side with arrow separator
    - Ticket number and timestamp shown inline in header
    - Removed inline ticket image preview
    - Optional details (recipient, phone, notes) hidden in collapsible section
  - **View Ticket Modal**: Dedicated modal for full ticket details
    - Eye icon button opens modal overlay
    - Shows all ticket information including full-size ticket photo
    - Displays geocoded coordinates (when available)
    - Better for reviewing ticket before navigation
  - **Improved Navigation URLs**: Better Waze deep link handling
    - Mobile: Uses `waze://` URL scheme with web fallback
    - Desktop: Opens Google Maps directly
    - Fixed Waze web URL format (`https://www.waze.com/ul`)
    - Smarter app detection and redirect logic
  - **Admin Navigation**: Added Dispatch as separate nav item
    - Dispatch (airport-style terminal board) and Driver Assist now separate in top nav
    - Radio icon for Dispatch, Truck icon for Driver Assist
    - Clear distinction between hub operations and driver tools
  - Files updated: `TicketCard.tsx`, `AddTicketCard.tsx`, `page.tsx`, `driver-assist-navigation.ts`, `AdminNav.tsx`
  - Files added: `ViewTicketModal.tsx`

### Added
- **Driver Assist System: AI-Powered Ticket Processing** - Mobile-first delivery ticket management for drivers
  - **AI Analysis**: Automatic ticket parsing using Gemini 2.5 Flash Vision API
    - Extracts ticket number, origin/destination addresses, recipient info, and package details
    - Analyzes ENVÍA ticket PDFs and photos instantly upon upload
    - Supports both real AI (Gemini) and mock mode for testing
  - **Drag-and-Drop Upload**: Intuitive interface with visual feedback
    - Drop zone with hover states and animations
    - Supports JPG, PNG, and PDF files (up to 10MB)
    - Auto-triggers AI analysis immediately after upload
    - Loading overlay with spinner during analysis (~1-2 seconds)
  - **Smart Navigation**: One-tap route opening with geocoding
    - Waze deep links on mobile devices
    - Google Maps fallback on desktop or when Waze unavailable
    - Caches geocoded coordinates to avoid duplicate API calls
    - Stores coordinates in ticket for instant navigation on future clicks
  - **Ticket Management**: Complete CRUD with localStorage persistence
    - Add unlimited tickets (50-ticket limit for storage efficiency)
    - Mark tickets as "Done" (fades with checkmark, remains visible)
    - Delete completed tickets
    - Auto-cleanup of oldest completed tickets when limit reached
  - **Mobile-First Design**: Responsive grid layout
    - 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
    - Touch-friendly buttons (44px+ height)
    - Full-width cards with clear visual hierarchy
  - **Testing Infrastructure**: 13 mock ENVÍA tickets with realistic Guatemala City data
    - Covers zones 1, 4, 7, 9, 10, 11, 12, 13, 14, 15, 16 (Mixco)
    - Realistic shopping centers (Oakland Mall, Pradera, Fontabella, Paseo Cayalá, etc.)
    - Various package types (electronics, appliances, accessories)
    - Random ticket selection on each upload in mock mode
  - Files added: `/app/admin/driver-assist/page.tsx`, `/app/api/admin/analyze-ticket/route.ts`, `/lib/services/ticket-analysis.ts`, `/lib/services/mock-ticket-data.ts`, `/lib/admin/driver-assist-types.ts`, `/lib/admin/driver-assist-storage.ts`, `/lib/admin/driver-assist-geocoding.ts`, `/lib/admin/driver-assist-navigation.ts`, `/components/admin/driver-assist/AddTicketCard.tsx`, `/components/admin/driver-assist/AddTicketDialog.tsx`, `/components/admin/driver-assist/TicketCard.tsx`, `/DRIVER_ASSIST_TESTING.md`
  - Files updated: `/components/admin/AdminNav.tsx`

### Changed
- **Loading States: Replaced Skeleton System with Top Progress Bar**
  - **BREAKING**: Removed broken skeleton loading implementation that showed blank white screens
  - Replaced with `nextjs-toploader` for industry-standard top progress bar during route transitions
  - Removed all 11 `loading.tsx` files (incompatible with client component navigation)
  - Removed `DevDelayWrapper` component (caused blank screens, not loading skeletons)
  - Removed skeleton components: `Skeleton`, `SkeletonCard`, and 9 variants
  - Removed shimmer CSS animations from `globals.css`
  - Removed ESLint rules: `require-loading-file` and `no-empty-loading-file`
  - Added `NextTopLoader` to root layout with orange (#FF8C00) brand color
  - **Result**: Immediate visual feedback on all route changes without white flashes
  - **Why**: Next.js 15 App Router `loading.tsx` only works for server components with Suspense boundaries, not client-side navigation
  - Files removed: all `app/**/loading.tsx`, `components/DevDelayWrapper.tsx`, `components/ui/skeleton.tsx`, `components/ui/skeleton-variants.tsx`, `eslint-rules/require-loading-file.js`, `eslint-rules/no-empty-loading-file.js`
  - Files updated: `app/layout.tsx`, `eslint.config.mjs`, `app/globals.css`, all 9 page components (removed DevDelayWrapper), `CLAUDE.md`

### Fixed
- **Route Planner Geocoding**: Fixed address autocomplete returning no results
  - Added comprehensive debug logging to track Nominatim API requests and responses
  - Implemented query enhancement: automatically appends "Guatemala" to searches without location context
  - Improved error messages to differentiate between "No results", "API error", and "Network error"
  - Added helper text for better user guidance
  - Files updated: `/app/api/admin/geocode/route.ts`, `AddressAutocomplete.tsx`

- **Routes Admin Page**: Fixed hardcoded light theme colors not adapting to dark admin theme
  - Replaced `bg-blue-50`, `bg-orange-50`, `bg-red-50` with CSS variables (`bg-primary/10`, `bg-destructive/10`)
  - Updated page title to use `text-foreground` instead of `text-secondary` for dark theme compatibility
  - **Fixed black unreadable label text**: Added `text-foreground` to all Label components ("Start Point", "Round Trip", "Delivery Address", etc.)
  - Standardized info boxes to use `bg-primary/10 border-l-4 border-primary` pattern
  - Fixed delete button hover states to use `bg-destructive/10`
  - Files updated: `app/admin/routes/page.tsx`, `RouteBuilderForm.tsx`, `RouteStopsList.tsx`, `RouteStopCard.tsx`

### Added
- **Route Planner: CSV Export** - Download optimized routes as driver-friendly CSV files
  - Export includes sequence, address, zone, coordinates, distance/time between stops
  - Summary section with totals (distance, time, savings, improvement percentage)
  - Filename format: `route-optimized-YYYY-MM-DD-HHmm.csv`
  - UTF-8 BOM for Excel compatibility
  - Files added: `/lib/admin/csv-export.ts`
  - Files updated: `OptimizedRouteView.tsx`

- **Route Planner: CSV Import** - Bulk upload addresses from CSV files
  - Simple format: required `address` column, optional `notes` column
  - Multi-step wizard: upload → preview → batch geocode → results
  - Progress tracking with 1-second rate limit (Nominatim compliance)
  - Shows successful vs failed geocoding with error details
  - Max 25 stops validation
  - Dependencies: `papaparse` for CSV parsing
  - Files added: `/lib/admin/csv-parser.ts`, `/lib/admin/batch-geocode.ts`, `CSVImportButton.tsx`, `CSVImportDialog.tsx`
  - Files updated: `/app/admin/routes/page.tsx`

- **Route Planner: Road-Based Routing** - Accurate distance calculations using actual roads
  - Integrated OSRM (Open Source Routing Machine) for turn-by-turn routing
  - Uses OSRM public demo server (free, no API key required)
  - Automatic fallback to Haversine formula if OSRM unavailable
  - In-memory distance caching (1-hour expiry, LRU eviction)
  - 2-second timeout with graceful degradation
  - Async optimization with road distances (~2-5 seconds for 25 stops)
  - New `RoutingMode` enum: `ROAD` (default) vs `STRAIGHT_LINE`
  - Files added: `/lib/admin/osrm-client.ts`, `/lib/admin/distance-cache.ts`
  - Files updated: `/lib/admin/route-types.ts`, `/lib/admin/route-utils.ts`, `/app/admin/routes/page.tsx`

### Changed
- **Route Planner Optimization**: Now async to support OSRM API calls
  - `optimizeRouteNearestNeighbor()` is now async and returns `Promise<OptimizedRoute>`
  - Performance: <100ms (Haversine) vs ~2-5 seconds (OSRM for 25 stops)
  - All distance calculations now cached to reduce API load

###
- **Linting Infrastructure**: Comprehensive ESLint and Prettier setup for styling enforcement
  - `eslint-plugin-tailwindcss` for Tailwind-specific linting (class ordering, contradicting classes)
  - `prettier-plugin-tailwindcss` for automatic class ordering on save
  - Custom ESLint rules:
    - `no-admin-hardcoded-colors`: Prevents hardcoded colors in `/app/admin/` and `/components/admin/` (errors on `bg-white`, `bg-blue-50`, `text-gray-600`, etc.) + **enforces `text-foreground` on all Label components** to prevent black unreadable text
    - `no-inline-styles`: Blocks inline `style={{}}` attributes throughout project
  - New npm scripts: `lint:fix`, `format`, `format:check`, `check`
  - Automatic pre-build checks via `prebuild` script (build fails if linting errors exist)
  - Configuration files: `.prettierrc.json`, `.prettierignore`, updated `eslint.config.mjs`

- **Admin UI Component Library**: Type-safe wrappers for consistent dark theme styling
  - `<AdminCard>`: Enforced dark card styling with optional icon/title (`bg-card`, `border-border`, `hover:border-primary/50`)
  - `<AdminInfoBox>`: Info/warning/error boxes with correct variant styling (supports `info`, `warning`, `error`, `success` variants)
  - `<AdminPageTitle>`: Standardized page header with description and actions support
  - All components auto-apply correct CSS variables for dark theme
  - Location: `/components/admin/ui/` with barrel export at `index.ts`

### Changed
- **Build Process**: Now runs `npm run check` before build (format + lint verification via `prebuild` script)
- **Documentation**: Updated `CLAUDE.md` with "Admin Dark Theme Patterns (CRITICAL)" section
  - Added strict admin styling rules and guidelines
  - Component wrapper usage examples
  - Linting enforcement commands

### Added (Previous Releases)
- **Route Planner Tool** - Intelligent delivery route optimization for logistics planning
  - Manual address entry with autocomplete (10-25 stops supported)
  - OpenStreetMap Nominatim geocoding with Guatemala-specific filtering
  - Nearest Neighbor optimization algorithm (O(n²) complexity, <500ms for 25 stops)
  - Haversine distance calculations for straight-line GPS distances
  - Before/After comparison showing savings (distance, time, percentage improvement)
  - Start point and end point configuration (optional)
  - Round trip toggle for return-to-origin routes
  - Address autocomplete with 500ms debouncing and top 5 results dropdown
  - Real-time distance and time estimates between stops
  - Visual optimization results with numbered stop sequence
  - Placeholder buttons for future features (Export CSV, View Map, Print)
  - Template management system ready for localStorage persistence (Phase 2)
  - Admin dark theme styling throughout all route components
  - Route: `/admin/routes`
  - New components: RouteBuilderForm, RouteStopsList, RouteStopCard, OptimizedRouteView, RouteComparisonCard, AddressAutocomplete
  - API route: `/app/api/admin/geocode/route.ts` (Nominatim proxy)
  - Types and utilities: `/lib/admin/route-types.ts`, `/lib/admin/route-utils.ts`
- **Dispatch Terminal** - Airport-style departure board for logistics hub operations
  - Live dispatch board optimized for large TV displays (1920x1080)
  - Real-time status tracking with 15-20 second automatic updates
  - 4-column layout: Driver ID, Shipment ID, Destination Zone, Status
  - Status flow: UPCOMING → LOADING → READY → DEPARTED
  - "Now Loading" indicator highlighting current loading operation with package progress
  - 3 KPI cards: Active Drivers, Loading Now, Ready to Depart
  - Large real-time clock with date display (updates every second)
  - Color-coded status badges (amber/sky/emerald/slate for dark admin theme)
  - Flash animation on status changes for visual feedback
  - Enforces single LOADING driver at a time for realistic workflow
  - Mock data generation with realistic status distribution (50% waiting, 12.5% loading, 25% ready, 12.5% departed)
  - Guatemala City delivery zone integration (15 zones)
  - Admin dark theme with optimized typography for TV viewing
  - Responsive grid layout with thin row separators (no individual cards)
  - Route: `/admin/dispatch`
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
- **Route Planner styling** - Converted all components to admin dark theme
  - Changed card backgrounds from `bg-white` to `bg-card` with `border-border`
  - Updated all text colors to use semantic tokens (`text-foreground`, `text-muted-foreground`)
  - Fixed button borders to use `border-border` instead of hard-coded gray values
  - Updated comparison card inner elements to use `bg-muted` for consistency
  - Fixed address autocomplete dropdowns to match dark theme
  - Added Routes navigation link to Header component (admin section)
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
