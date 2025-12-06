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
  - Caches coordinates to avoid duplicate API calls
- **Ticket Management**: Complete CRUD with localStorage persistence (max 50 tickets)
  - Add/complete/delete tickets
  - Tickets persist across browser sessions
  - Completed tickets fade but remain visible
- **Mobile-First Design**: Responsive grid (1/2/3 columns), touch-friendly buttons (44px+)
- **Testing Infrastructure**: 13 mock tickets covering Guatemala City zones 1-16
- Access via `/admin/driver-assist` in the admin dashboard

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

## Tech Stack

- **Framework**: Next.js 15.5.7 with App Router and Turbopack
- **React**: 19.1.0
- **TypeScript**: 5+
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
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

Visit `http://localhost:3000`

## Project Structure

```
/app                    # Next.js App Router pages
  /admin                # Admin dashboard
    /routes             # Route planner page
    /driver-assist      # Driver assist page
    /dispatch           # Dispatch terminal
    /orders             # Order management
    /products           # Product management
  /api/admin
    /geocode            # Geocoding proxy API
    /analyze-ticket     # AI ticket analysis API
  /calculator           # Shipping calculator
  /marketplace          # Product marketplace
    /[productId]        # Product detail pages
  /contact              # Contact page
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
      TicketCard.tsx              # Individual ticket display
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

### Vercel (Recommended)
1. Connect repository
2. Auto-detects Next.js
3. Automatic deployments on push

### Build Optimization
- Turbopack for faster builds
- Automatic code splitting
- Image optimization
- Font optimization

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
