# Envia Ship

Modern shipping calculator and marketplace platform for ENVÍA de Guatemala.

## Features

### Shipping Calculator
- Real-time price calculation based on dimensions and weight
- Multiple service types (Standard, Express, International)
- Zone-to-zone shipping within Guatemala City
- Dimensional weight calculation
- Mobile-responsive interface

### Route Planner (Admin)
- **Intelligent Route Optimization**: Nearest Neighbor algorithm optimizes delivery routes for up to 25 stops
- **Road-Based Routing**: OSRM integration for actual road distances (automatic fallback to Haversine)
- **Address Autocomplete**: Guatemala-specific geocoding with OpenStreetMap Nominatim, auto-enhanced queries
- **CSV Import**: Bulk upload addresses from spreadsheet (batch geocoding with progress tracking)
- **CSV Export**: Download optimized routes as driver-friendly CSV files with full metrics
- **Value Demonstration**: Before/After comparison showing distance saved, time saved, and percentage improvement
- **Flexible Configuration**: Optional start/end points, round trip toggle
- **Real-Time Estimates**: Distance and time calculations between each stop using actual road routes
- **Visual Results**: Numbered stop sequence with turn-by-turn distances
- **Debug Logging**: Comprehensive console logging for geocoding diagnostics
- Access via `/admin/routes` in the admin dashboard

### Driver Assist (Admin)
- **AI-Powered Ticket Analysis**: Automatic extraction of delivery details using Gemini 2.5 Flash Vision API
  - Instant parsing of ENVÍA ticket PDFs and photos
  - Auto-extracts: ticket number, origin/destination addresses, recipient info, package details
  - Works with real AI or mock mode (13 realistic Guatemala City test tickets)
- **Drag-and-Drop Upload**: Intuitive interface with visual feedback and instant AI processing
- **Smart Navigation**: One-tap route opening with intelligent geocoding
  - Waze deep links on mobile, Google Maps on desktop
  - Live timer showing elapsed time since navigation started
  - Caches coordinates to avoid duplicate API calls
- **Multi-Ticket URL Sharing**: Share entire ticket queue via WhatsApp URL
  - Dispatcher can send optimized route directly to driver
  - Driver confirmation dialog before adding tickets
  - Automatic appending to existing queue
- **Ticket Management**: Complete CRUD with localStorage persistence (max 50 tickets)
  - Add/complete/delete tickets
  - Tickets persist across browser sessions
  - Completed tickets show total time with smooth animation
  - Live navigation timers for active deliveries
- **Mobile-First Design**: Responsive grid (1/2/3 columns), touch-friendly buttons (44px+), stacked card view
- **Testing Infrastructure**: 13 mock tickets covering Guatemala City zones 1-16
- Access via `/admin/driver-assist` (default landing page)

### Dispatcher Terminal (Admin)
- **Route Optimization**: Integrate route planner with driver assist workflow
  - Optimize multi-stop routes before sending to drivers
  - Visual before/after comparison showing route improvements
  - Detailed metrics: distance saved, time saved, percentage improvement
- **WhatsApp Integration**: One-click sharing to driver mobile apps
  - Multi-ticket URL generation with all route stops
  - Deep link support for instant ticket loading
  - QR code option for easy mobile scanning
- **Ticket List Management**: View and organize delivery tickets
  - Filter by status, zone, recipient
  - Bulk selection for route optimization
  - Real-time ticket updates
- **Driver Assignment**: (Coming soon) Assign optimized routes to specific drivers
- Access via `/admin/dispatch`

### Driver Tracking Map (Experimental - Admin)
- **Real-Time Location Monitoring**: Interactive map showing live driver positions in Guatemala City
  - MapLibre GL JS for smooth, hardware-accelerated mapping
  - 6 map style themes: Voyager (default), Positron, Dark Matter + no-labels variants
  - Style switcher dropdown for easy theme experimentation
- **Driver Visualization**: Color-coded markers with status-based styling
  - Active drivers: Green markers with pulse animation
  - Available drivers: Orange markers
  - Offline drivers: Gray markers
  - 20px markers with white border and shadow for visibility
- **Real-Time Simulation**: Smooth driver movement along delivery routes
  - 2.5-second position updates with linear interpolation
  - Drivers follow realistic paths between stops (45 seconds per segment)
  - Automatic route progression with stop completion tracking
- **Route Visualization**: Interactive route display for selected drivers
  - Orange route lines connecting stops
  - Numbered stop markers (green when completed, orange when pending)
  - Progressive disclosure: routes only shown when driver is clicked
- **Interactive Controls**: Full map manipulation and filtering
  - Click markers to select drivers and view route details
  - Status filters: Toggle Active/Available/Offline driver visibility
  - Zoom to selected driver (14x zoom level)
  - Reset view to fit all drivers
- **Status Dashboard**: Real-time statistics cards
  - Active drivers count with pulse indicator
  - Available drivers count
  - Offline drivers count
  - Total deliveries today (aggregate)
- **Driver Highlight Panel**: Selected driver details with route progress
  - Driver name and status badge
  - Visual progress bar (X/Y stops completed)
  - Next stop address display
  - "Route complete" state when all stops delivered
- **Responsive Design**: Optimized for desktop and mobile
  - Desktop: Fixed left sidebar (320px) with scrollable controls
  - Mobile: Full-screen map with swipeable bottom sheet (70vh)
  - Floating trigger button on mobile showing active count
- **Mock Data**: 4 realistic Guatemala City drivers for testing
  - 2 active drivers with 4-stop routes (Zona 1-16 coverage)
  - 1 available driver (idle at last delivery)
  - 1 offline driver (last known position)
  - Real Guatemala City coordinates centered at 14.6349°N, -90.5068°W
- **Technical Stack**:
  - MapLibre GL: Free, open-source WebGL mapping (no API keys)
  - CartoDB tiles: High-quality, reliable vector tiles
  - State management: Custom useDriverTracking hook with setInterval simulation
  - Position updates: Linear interpolation between route waypoints
- Access via `/admin/experiments/driver-tracking`

### Fleet Optimizer Simulation (Experimental - Admin)
- **Multi-Vehicle Route Optimization**: Clarke-Wright savings algorithm for capacity-constrained VRP
  - Automatic vehicle assignment based on package capacity
  - Route merging optimization to minimize total fleet distance
  - Support for multiple vehicle types (motorcycle, van, truck)
  - Depot-based routing with return-to-depot option
- **Real-Time Fleet Simulation**: Live execution of optimized routes with realistic vehicle movement
  - **Road-Following Movement**: Vehicles follow actual OSRM geometry using Turf.js geospatial library
    - Per-segment geometry slicing with `turf.lineSlice()`
    - Stop snapping to route geometry with `turf.nearestPointOnLine()`
    - Smooth interpolation along road coordinates (no straight-line movement)
  - **Smart Map Rendering**: Optimized layer management eliminates visual flashing
    - Stable route keys prevent unnecessary re-renders
    - Routes only update when assignments change (not every position update)
    - Vehicle markers update smoothly at 1-second intervals
  - **Auto-Fit Map Bounds**: Automatic zoom to show all active vehicles and routes on simulation start
- **Time Window Constraints**: Support for delivery time windows with validation
  - Hard time windows: Must be met (reject route if violated)
  - Soft time windows: Preferred with penalty function
  - WAITING vehicle status: Arrived early, waiting for time window to open
  - Real-time violation tracking and display
- **Variable Service Times**: Per-stop service duration configuration
  - Stop-specific service times (residential: 3min, commercial: 5min, warehouse: 15min)
  - Service type presets for common delivery types
  - Automatic ETA calculations with variable service durations
- **Dynamic Reoptimization**: Queue-based ticket insertion with automatic reoptimization
  - New tickets added to queue during simulation
  - Configurable reoptimization threshold (default: 5 tickets)
  - Optional auto-generation with realistic patterns
  - Seamless route updates for in-progress vehicles
- **Interactive Map Visualization**: MapLibre GL with real-time updates
  - Color-coded vehicle routes with utilization badges
  - Vehicle markers showing current status (idle, en route, servicing, waiting, returning, completed)
  - Route polylines following actual OSRM road geometry
  - Numbered stop markers with completion tracking
  - Depot marker with distinct styling
- **Comprehensive Metrics Dashboard**: Real-time simulation state monitoring
  - **Fleet Status**: Active, waiting, idle, and completed vehicle counts
  - **Delivery Progress**: Stops completed/remaining with progress bar
  - **Queue Status**: Queued tickets with threshold warnings
  - **Configuration Display**: Segment duration, service duration, reoptimization threshold
  - **Live Statistics**: Total distance, time, packages, utilization percentages
- **Graph-Based Analysis**: Visual route network and metrics
  - Interactive graph visualization with vehicle routes
  - Detailed route breakdown table with expandable stops
  - Fleet utilization charts and statistics
  - Before/after comparison for reoptimization events
- **Simulation Controls**: Full playback control and speed adjustment
  - Play/pause simulation
  - Speed control (1x, 2x, 5x, 10x)
  - Manual ticket generation
  - Reset simulation
  - Enable/disable auto-generation
- **Technical Stack**:
  - **Turf.js**: Geospatial operations for road-following movement (@turf/turf@^7.2.0)
  - **MapLibre GL**: Hardware-accelerated map rendering
  - **OSRM Integration**: Actual road distances and route geometry
  - **Clarke-Wright Algorithm**: Multi-vehicle VRP optimization
  - **State Management**: Custom useFleetSimulation hook with React state
  - **Position Updates**: Geometry-based interpolation at 1-second intervals
- **Test Data**: Guatemala City realistic scenarios
  - Depot: Zona 10 office location
  - 3 vehicles: Motorcycle (5 packages), Van (10 packages), Truck (20 packages)
  - 15+ stops distributed across Guatemala City zones
  - Actual Guatemala City coordinates and addresses
- **Known Limitations**:
  - Fleet utilization: Currently assigns most stops to single vehicle instead of balanced distribution
  - Route balancing: Clarke-Wright savings algorithm may create uneven vehicle workloads
  - Future work: Implement route balancing heuristics and load distribution constraints
- Access via `/admin/experiments/fleet-optimizer`

### Reports Dashboard (Admin)
- **Trip History Table**: Complete delivery analytics with advanced filtering
  - Sortable columns: driver, completed date, duration
  - Date range filtering with calendar picker
  - Driver filtering with dropdown selector
  - Real-time result counter
  - Expandable rows for full address display
- **Driver Performance Metrics**: Individual driver statistics cards
  - Total completed deliveries
  - Average delivery time
  - Fastest and slowest delivery times
  - Completion rate percentage
  - Color-coded performance indicators
- **Export Capabilities**: Multiple export formats with filtered results
  - **PDF Export**: Branded reports with ENVÍA styling, filter summary, and formatted tables
  - **CSV Export**: Spreadsheet-ready data for further analysis
  - Exports match current filters (date range, driver selection)
  - Download count indicator shows exactly what will export
- **Live Data**: Auto-refresh with manual refresh button
- Access via `/admin/reports`

### Marketplace
- **5 UI Variations**: Amazon-style, Uber Eats-style, Pinterest-style, Minimalist, Proximity-focused
- **70 Mock Products**: Food & Beverages, Pharmacy & Medical, General Retail
- **Zone-Based Shipping**: Instant shipping estimates integrated with calculator
- **Single Product Checkout**: Quick buy flow with form validation
- **Filtering & Sorting**: By category, price, rating, zone, stock availability
- **Product Details**: Image galleries, seller information, shipping breakdowns

### Loading States
- **Skeleton Screens**: LinkedIn/Facebook-style shimmer animations for all 11 pages
- **Development Delay**: `DevDelayWrapper` component adds 1-second delay in dev mode to make skeletons visible (instant in production)
- **Theme Compatible**: Works seamlessly in both light and dark themes using CSS variables
- **Build-Time Enforcement**: ESLint rules block builds if any page lacks proper loading states
- **Accessibility First**: ARIA labels, screen reader support, and `prefers-reduced-motion` fallback
- **Zero Layout Shift**: Dimension-matched skeletons prevent content jumping (CLS < 0.1)
- **Components**: Base `Skeleton` + 9 variants (Card, Table, Chart, Text, Avatar, Button, Image, Badge, Input)
- **How to See**: Navigate between pages in development - you'll see 1 second of skeleton animation before content loads

## Internationalization (i18n)

Envia Ship supports both **Spanish** and **English** with full internationalization powered by **next-intl**.

### Features
- **Language Switcher**: Globe icon with 3-letter language code (ENG/ESP) in top-right navigation
- **Cookie-Based Locale**: Pure cookie-based approach (no URL changes, no middleware required)
- **Cookie Persistence**: Language preference saved across sessions via `NEXT_LOCALE` cookie
- **Default Locale**: English (`en`) - easily configurable in `src/i18n/request.ts`
- **TypeScript Support**: Full autocomplete for translation keys via `global.d.ts`
- **Comprehensive Coverage**: All core pages, components, zones, services, and validation messages translated
- **500+ Translation Keys**: Organized by feature namespaces for easy maintenance

### Using Translations in Components

**Client Components:**
```typescript
"use client";
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

**Server Components:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('namespace');
  return <h1>{t('title')}</h1>;
}
```

### Translation Files
- **Location**: `/messages/en.json`, `/messages/es.json`
- **Structure**: Organized by feature (common, navigation, home, calculator, marketplace, contact, admin, etc.)
- **Editing**: Add new translations to both files with matching keys

### For Developers
To add new translations:
1. Add the English key to `/messages/en.json`
2. Add the Spanish translation to `/messages/es.json`
3. Use `t('your.key')` in components (autocomplete will help!)

## Tech Stack

- **Framework**: Next.js 15.5.7 with App Router and Turbopack
- **React**: 19.1.0
- **TypeScript**: 5+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Forms**: React Hook Form + Zod validation
- **Internationalization**: next-intl (Spanish/English)
- **Icons**: Lucide React
- **Data Export**: jsPDF (PDF generation), papaparse (CSV parsing/export)
- **Date Handling**: react-day-picker (calendar components)
- **Testing**: Playwright (automated screenshots)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit `http://localhost:3000` (automatically redirects to `/admin/driver-assist`)

## Project Structure

```
/app                    # Next.js App Router pages
  /admin                # Admin dashboard
    /routes             # Route planner page
    /driver-assist      # Driver assist page (default landing)
    /dispatch           # Dispatcher terminal with route optimization
    /reports            # Trip history and performance analytics
    /orders             # Order management
    /products           # Product management
  /api/admin
    /geocode            # Geocoding proxy API
    /analyze-ticket     # AI ticket analysis API
  /api/reports
    /trips              # Trip history data API
    /performance        # Driver performance metrics API
  /calculator           # Shipping calculator
  /marketplace          # Product marketplace
    /[productId]        # Product detail pages
  /contact              # Contact page
  page.tsx              # Root redirect to admin
  layout.tsx            # Root layout with providers
  globals.css           # Tailwind CSS with theme

/components
  /admin
    /routes             # Route planner components
      RouteBuilderForm.tsx        # Address entry & config
      RouteStopsList.tsx          # Stop management
      RouteStopCard.tsx           # Individual stop display
      OptimizedRouteView.tsx      # Results display with CSV export
      RouteComparisonCard.tsx     # Before/After comparison
      AddressAutocomplete.tsx     # Geocoding autocomplete with debug logging
      CSVImportButton.tsx         # CSV upload trigger
      CSVImportDialog.tsx         # Multi-step import wizard
    /driver-assist      # Driver assist components
      AddTicketCard.tsx           # Add ticket button card
      AddTicketDialog.tsx         # AI-powered upload dialog
      TicketCard.tsx              # Individual ticket display with live timer
      NavigationTimer.tsx         # Live elapsed time counter
      StackedTickets.tsx          # Stacked card preview
    /dispatch           # Dispatcher components
      TicketList.tsx              # Ticket selection and filtering
      RouteOptimizationResults.tsx # Before/After comparison with sharing
    /reports            # Reports dashboard components
      TripHistoryTable.tsx        # Sortable trip history table
      DriverPerformanceCards.tsx  # Individual driver metrics
      DateRangeFilter.tsx         # Calendar date picker
      DriverFilter.tsx            # Driver selection dropdown
  /calculator           # Calculator form components
  /marketplace          # Marketplace components (cards, modals, filters)
  /ui                   # shadcn/ui base components
  Header.tsx            # Global navigation
  Footer.tsx            # Global footer

/contexts
  ThemeContext.tsx          # Branding/theme state
  MarketplaceContext.tsx    # Marketplace state (zone, view, filters)

/lib
  /admin                # Admin utilities
    route-types.ts      # Route planner TypeScript types
    route-utils.ts      # Optimization algorithms & distance calculations
    osrm-client.ts      # OSRM road routing integration
    distance-cache.ts   # In-memory distance caching (1-hour expiry)
    csv-export.ts       # CSV export with driver-friendly format
    csv-parser.ts       # CSV import parsing & validation
    batch-geocode.ts    # Batch geocoding with progress tracking
    driver-assist-types.ts         # Driver assist TypeScript types
    driver-assist-storage.ts       # localStorage CRUD & geocoding cache
    driver-assist-geocoding.ts     # Geocoding service with caching
    driver-assist-navigation.ts    # Waze/Google Maps deep links
    mock-driver-assist.ts          # Mock trip data for reports testing
  /reports              # Reports utilities
    pdf-export.ts       # Branded PDF generation with jsPDF
    csv-export.ts       # CSV export for trip data
  /services             # API services
    ticket-analysis.ts  # AI ticket parsing with Gemini Vision
    mock-ticket-data.ts # 13 realistic Guatemala City test tickets
  /marketplace          # Marketplace logic and data
    product-data.ts     # Mock product generator
    shipping-integration.ts  # Bridge to calculator
    product-filters.ts  # Filter/sort utilities
    types.ts            # TypeScript definitions
  /validations          # Zod schemas
  shipping-calculator.ts   # Pricing engine
  themes.ts             # Brand configuration
```

## Design System

### Colors
- **Primary**: Orange (#FF8C00) - Buttons, accents, focus states
- **Secondary**: Navy (#1E3A5F) - Header, footer, text
- **Background**: White (#FFFFFF) - All card backgrounds

**Rule**: ONLY these three colors. No teal, no gradients, no semi-transparent backgrounds.

### Typography
- **Headings**: DM Sans (font-bold, font-semibold)
- **Body**: Inter
- **Code**: JetBrains Mono

### Spacing
- Sections: `py-12` (48px)
- Cards: `gap-4` (16px) or `gap-6` (24px)
- Condensed layout throughout

## Marketplace UI Variations

| Variation | Layout | Best For |
|-----------|--------|----------|
| **Amazon** | Dense grid + sidebar filters | Detail-oriented shoppers |
| **Uber Eats** | Grid + category tabs | Visual browsing, food products |
| **Pinterest** | Masonry grid + hover overlays | Image discovery |
| **Minimalist** | Spacious grid, huge images | Premium/lifestyle products |
| **Proximity** | Zone-grouped sections | Local delivery focus |

Switch between variations using the header dropdown when on `/marketplace` routes.

## Key Commands

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Building
npm run build            # Production build
npm start                # Run production server

# Linting
npm run lint             # ESLint

# Testing
node test-marketplace-simple.mjs  # Capture marketplace screenshots
```

## Configuration

### Required Files
- `postcss.config.mjs` - Tailwind CSS v4 (critical!)
- `next.config.ts` - Turbopack, image domains
- `components.json` - shadcn/ui configuration

### Environment
Create `.env.local` if needed for future API keys

## Marketplace Architecture

### State Management
- **MarketplaceContext**: Global state for zone selection, UI variation, filters
- **localStorage**: Persists zone, view preference, service type
- **React Hook Form**: Form state in checkout modal

### Data Flow
```
User selects zone
  ↓
Products enriched with shipping estimates
  ↓
Filter/sort applied
  ↓
ProductCard renders with calculated shipping
  ↓
Click product → Detail page
  ↓
Buy Now → Checkout modal with form validation
```

### Mock Data
- 70 products generated from templates
- Categories: Food (23), Medical (24), Retail (23)
- Images: placehold.co with brand colors
- Sellers: Random Guatemala-themed names
- Zones: Distributed across Zona 1-16

### Shipping Integration
Uses existing calculator (`/lib/shipping-calculator.ts`):
- Dimensional weight: (L × W × H) / 5000
- Base rate: Q15/kg
- Minimum: Q25
- Service multipliers: Standard (1×), Express (2×), International (3.5×)

## Route Planner Architecture

### Optimization Algorithm
**Nearest Neighbor (Greedy)**:
1. Start at defined start point (or first stop)
2. Find nearest unvisited stop from current position
3. Move to that stop, repeat until all stops visited
4. Optionally return to start point if round trip enabled

**Complexity**: O(n²) - Fast enough for 10-25 stops (<500ms)

**Trade-off**: 10-25% suboptimal vs. optimal solution, but instant results

### Value Demonstration
Shows **before vs. after comparison** to prove ROI:
- **Original Route**: Distance/time if visiting stops in entered order
- **Optimized Route**: Distance/time after algorithm reordering
- **Savings**: Distance saved (km + %), time saved (minutes)

### Distance Calculations
**OSRM (Open Source Routing Machine)**: Road-based routing (primary)
- Uses actual road networks for accurate distances
- Public demo server: `router.project-osrm.org`
- 2-second timeout with automatic fallback
- Caches results (1-hour expiry, LRU eviction)
- Free, no API key required

**Haversine Formula**: Straight-line distance (fallback)
- Used when OSRM unavailable or times out
- ~2-5% difference vs actual road distance
- Fast (<100ms for 25 stops)

### Geocoding
**OpenStreetMap Nominatim**:
- Free, no API key required
- Guatemala-specific filtering (`countrycodes=gt`)
- **Auto-query enhancement**: Appends "Guatemala" to searches without location context
- 500ms debounce to respect rate limits (1 req/sec)
- Top 5 results shown in dropdown with zone extraction
- Proxied through `/api/admin/geocode` to avoid CORS
- Comprehensive debug logging via `[Geocode]` console messages

### CSV Import/Export
**Import**: Bulk address upload
- Simple format: `address` (required), `notes` (optional)
- Batch geocoding with progress tracking
- 1-second delay between requests (Nominatim rate limit)
- Validation: max 25 stops, duplicate detection
- Error handling with detailed failure messages

**Export**: Driver-friendly CSV download
- Columns: Sequence, Address, Zone, Coordinates, Distance, Time, Notes
- Summary section with totals and savings metrics
- Filename: `route-optimized-YYYY-MM-DD-HHmm.csv`
- UTF-8 BOM for Excel compatibility

### Data Flow
```
User enters addresses OR imports CSV
  ↓
Autocomplete geocodes via Nominatim (enhanced queries)
  ↓
Stops added to list (up to 25)
  ↓
User clicks "Optimize Route"
  ↓
Build distance matrix (OSRM road routing with Haversine fallback)
  ↓
Run Nearest Neighbor algorithm (async, 2-5 seconds)
  ↓
Calculate original route metrics (for comparison)
  ↓
Display before/after comparison + optimized sequence
  ↓
Export CSV (optional)
```

## Common Issues

### Context Error
**Error**: `useMarketplace must be used within a MarketplaceProvider`

**Fix**: Ensure `app/layout.tsx` wraps entire app:
```tsx
<MarketplaceProvider>
  <Header />  {/* Needs context access! */}
  <main>{children}</main>
</MarketplaceProvider>
```

### Images Not Loading
**Cause**: Unsplash API unreliable (503 errors)

**Fix**: Use placehold.co in `/lib/marketplace/product-data.ts`

### Header Dropdowns Unreadable
**Cause**: Wrong styling (`bg-secondary/10`)

**Fix**: Use `bg-white text-secondary font-semibold` in ZoneSelector and UIStyleSwitcher

## Documentation

- **CLAUDE.md**: Project instructions (lightweight, <200 lines)
- **MARKETPLACE.md**: Quick reference for marketplace
- **CHANGELOG.md**: Version history
- **Code comments**: Explain why decisions were made

## Testing

Playwright scripts for automated screenshot capture:
```bash
node test-marketplace-simple.mjs
```

Generates:
- `marketplace-initial.png`
- `marketplace-product-detail.png`
- `marketplace-checkout.png`

## Deployment

### Prerequisites
- Node.js 18+ installed
- Git repository initialized
- Vercel account (free tier works)

### Environment Variables
No environment variables required for current deployment. All features use:
- Mock data for driver assist trip history
- localStorage for ticket persistence
- Client-side state management

**Future (when adding real backend)**:
- `TURSO_DATABASE_URL` - Database connection string
- `TURSO_AUTH_TOKEN` - Database authentication token
- `SESSION_SECRET` - Session encryption key
- `NEXT_PUBLIC_GEMINI_API_KEY` - Google AI API key (if using real AI)

### Vercel Deployment (Recommended)

**Initial Setup:**
1. Push code to GitHub/GitLab/Bitbucket
2. Visit [vercel.com](https://vercel.com) and sign in
3. Click "Add New Project"
4. Import your repository
5. Vercel auto-detects Next.js configuration
6. Click "Deploy" (no environment variables needed yet)

**Automatic Deployments:**
- Every `git push` to `main` triggers production deployment
- Pull requests get preview deployments automatically
- Build time: ~2-3 minutes with Turbopack

**Custom Domain (Optional):**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `envia-ship.com`)
3. Follow DNS configuration instructions
4. SSL certificates auto-generated

**Post-Deployment Verification:**
1. Visit `https://your-project.vercel.app`
2. Confirm redirect to `/admin/driver-assist`
3. Test navigation between admin pages
4. Verify language switcher (ENG/ESP)
5. Check reports dashboard with mock data
6. Test responsive design on mobile

### Build Optimization
- **Turbopack**: 5x faster builds than Webpack
- **Automatic code splitting**: Only loads needed JavaScript
- **Image optimization**: Next.js Image component handles WebP conversion
- **Font optimization**: Inline font CSS for zero layout shift
- **Tree shaking**: Unused code automatically removed

### Build Commands
```bash
# Local production build
npm run build
npm start

# Lint and format before deploy
npm run check  # Runs format + lint
```

### Troubleshooting

**Build Failures:**
- Check `npm run build` succeeds locally
- Verify all dependencies in `package.json`
- Review build logs in Vercel dashboard

**Styling Issues:**
- Ensure `postcss.config.mjs` exists (required for Tailwind v4)
- Clear Vercel build cache: Settings → Build & Development → Clear Cache

**Redirect Loop:**
- Check `middleware.ts` doesn't conflict with routes
- Verify `app/page.tsx` returns `null` (middleware handles redirect)

**Missing Fonts:**
- Fonts are self-hosted in `/public/fonts/`
- Verify files exist and are committed to git

**localStorage Not Working:**
- Expected - localStorage is client-side only
- Data persists per-device, not across devices
- Future: Migrate to database for cross-device sync

## Future Enhancements

### Route Planner
- [ ] Template management with localStorage persistence
- [ ] CSV export/import for bulk address upload
- [ ] Interactive map visualization (Leaflet.js)
- [ ] Drag-and-drop stop reordering
- [ ] 2-Opt algorithm for better optimization
- [ ] Real road distances via OSRM API
- [ ] Multi-vehicle route optimization
- [ ] Time window constraints

### Marketplace
- [ ] Shopping cart (multi-product checkout)
- [ ] Real payment integration
- [ ] Backend product database
- [ ] User accounts and order history
- [ ] Seller accounts
- [ ] Product reviews submission
- [ ] Real-time inventory updates
- [ ] Order tracking

## Contributing

1. Follow design system strictly (orange + navy only)
2. Use Tailwind classes exclusively (no inline styles)
3. Test responsive design
4. Add accessibility attributes
5. Write meaningful commit messages

## License

Private project - All rights reserved

---

Built with ❤️ for ENVÍA de Guatemala
