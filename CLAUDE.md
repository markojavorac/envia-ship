# Envia Ship - Project Documentation

## Project Overview

Envia Ship is a modern shipping calculator web application for ENVÍA de Guatemala, built with Next.js 15.5+ using the App Router and React 19. The application features a modern, condensed design system powered by shadcn/ui components, with a focus on efficient use of space and professional aesthetics.

## Tech Stack

- **Framework**: Next.js 15.5+ with App Router and Turbopack
- **React**: 19.1+
- **TypeScript**: 5+ with strict mode enabled
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Hosting**: Vercel

## Development Commands

```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production with Turbopack
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Project Structure

```
/app
  - layout.tsx           # Root layout with fonts, theme, and marketplace providers
  - globals.css          # Tailwind CSS v4 with theme inline
  - page.tsx             # Home page with hero, features, CTA
  - icon.tsx             # Dynamic favicon using Next.js icon route
  /calculator
    - page.tsx           # Calculator page with form
  /marketplace
    - page.tsx           # Marketplace with 5 UI variations
    /[productId]
      - page.tsx         # Product detail page with shipping estimates

/components
  - Header.tsx           # Navigation with zone/UI switchers (marketplace)
  - Footer.tsx           # Footer with 3-column layout
  /calculator
    - ShippingCalculatorForm.tsx  # Main calculator form
    - PricingResultsCard.tsx      # Results display
  /marketplace
    - ProductCard.tsx              # Product card with 5 variants
    - ProductGrid.tsx              # Grid/masonry layout manager
    - ZoneModal.tsx                # First-visit zone selection
    - ZoneSelector.tsx             # Header zone dropdown
    - UIStyleSwitcher.tsx          # Header UI variation switcher
    - FilterSidebar.tsx            # Amazon-style filters
    - CategoryTabs.tsx             # Uber Eats-style tabs
    - ProductSearch.tsx            # Search bar
    - SortDropdown.tsx             # Sort options
    - ShippingEstimateBadge.tsx    # Shipping cost display
    - QuickCheckoutModal.tsx       # Single product checkout
    - ProductImageGallery.tsx      # Image viewer
  /ui                    # shadcn/ui components

/contexts
  - ThemeContext.tsx       # React Context for theming
  - MarketplaceContext.tsx # Zone, view, filters state (global)

/lib
  - types.ts             # TypeScript interfaces and enums
  - themes.ts            # Envia Guatemala theme configuration
  - utils.ts             # Utility functions (cn, etc.)
  - shipping-calculator.ts  # Pricing calculation engine
  /marketplace
    - types.ts                 # Product, MarketplaceView types
    - product-data.ts          # 70 mock products generator
    - product-filters.ts       # Filter/search/sort utilities
    - shipping-integration.ts  # Bridge to calculator
    - storage.ts               # localStorage helpers
  /validations
    - shipping-schema.ts   # Zod shipping validation
    - checkout-schema.ts   # Zod checkout validation

/public
  - envia-logo.png       # Envia brand logo
```

## Core Architecture

### Modern Design System

The application follows a **modern, condensed, shadcn/ui-first** design philosophy:

#### Design Principles

1. **Modern & Sleek**: Contemporary UI with clean lines and professional styling
2. **Condensed Layout**: Reduced whitespace for efficient use of space
   - Section padding: `py-12` (not py-20)
   - Card spacing: `gap-4` or `gap-6` (not gap-8)
   - Compact hero sections
3. **shadcn/ui First**: Exclusive use of shadcn/ui components, **NEVER use inline styles**
4. **Strict Color Palette**: **ONLY** Orange (#FF8C00) and Navy (#1E3A5F) + White
   - **NO teal, NO accent colors, NO gradients**
   - All colors via Tailwind classes only
   - Orange for primary actions, focus states, and accents
   - Navy for header, footer, and text
   - White for card backgrounds (no beige/cream backgrounds)
5. **Simplified Navigation**: Only show pages that actually exist
6. **Mobile-First**: Responsive design prioritizing mobile experience
7. **Bold Typography**: Navigation (font-bold), Headings (font-bold 700), Labels (font-semibold 600)

#### Spacing Scale

Consistent spacing throughout the application:
- Between sections: `py-12` (48px)
- Between cards: `gap-4` (16px) or `gap-6` (24px)
- Card padding: `p-4` (16px) or `p-6` (24px)
- Text margins: `mb-4` (16px)

#### Typography Scale

- **H1**: `text-2xl md:text-3xl lg:text-5xl font-bold leading-tight`
- **H2**: `text-2xl md:text-3xl font-bold leading-tight`
- **H3**: `text-lg font-semibold`
- **Body**: `text-base` (16px)
- **Small**: `text-sm` (14px)
- **Tiny**: `text-xs` (12px)

### Typography System

Modern Google Fonts configured in `app/layout.tsx`:
- **Inter**: Primary sans-serif font for body text
- **DM Sans**: Heading font for titles and emphasis
- **JetBrains Mono**: Modern monospace font for code

Font CSS variables in `app/globals.css`:
```css
--font-sans: var(--font-inter);
--font-heading: var(--font-dm-sans);
--font-mono: var(--font-jetbrains-mono);
```

Usage:
- Default: `font-sans` (Inter)
- Headings: `font-heading` (DM Sans)
- Code: `font-mono` (JetBrains Mono)

### Theme System

The application uses Envia Guatemala branding with React Context and CSS variables:

#### Theme Configuration (`lib/themes.ts`)

```typescript
export const theme: Theme = {
  name: "envia-guatemala",
  displayName: "ENVÍA de Guatemala",
  companyName: "ENVÍA",
  tagline: "Comprehensive Logistics Solutions",  // English only
  colors: {
    primary: "#FF8C00",    // Orange - ONLY primary accent color
    secondary: "#1E3A5F",  // Navy Blue - headers, footers, text
    background: "#ffffff", // White - all card backgrounds
    text: "#0f172a",      // Dark gray for body text
  },
  phone: "2303-7676",
  email: "info@envia.com.gt",
};
```

**IMPORTANT**: No teal/accent color in theme. Removed for brand consistency.

#### CSS Variables (`app/globals.css`)

**Tailwind CSS v4 Format** - HSL values wrapped in `hsl()` at `:root`:

```css
:root {
  --primary: hsl(33 100% 50%);      /* #FF8C00 Orange */
  --primary-foreground: hsl(0 0% 100%);
  --secondary: hsl(214 52% 24%);    /* #1E3A5F Navy */
  --secondary-foreground: hsl(0 0% 100%);
  --background: hsl(0 0% 100%);     /* White */
  --foreground: hsl(222.2 84% 4.9%);
  /* NO --accent variable */
}

@theme inline {
  --color-primary: var(--primary);
  --color-secondary: var(--secondary);
  --color-background: var(--background);
  /* ... reference with var() */
}

/* Remove ugly number input spinners */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}
```

#### Usage - Tailwind Classes ONLY

**DO** - Use Tailwind classes:
```tsx
<div className="bg-primary text-primary-foreground">
<Button className="bg-secondary">Click me</Button>
<div className="border-primary/20">
```

**DON'T** - Use inline styles:
```tsx
// ❌ NEVER DO THIS
<div style={{ backgroundColor: theme.colors.primary }}>
<div style={{ color: theme.colors.accent }}>
```

### Component Architecture

#### Header (`components/Header.tsx`)
- Sticky header: `bg-secondary` (solid navy, no backdrop blur)
- **NO border** between header and content
- Envia logo (120px width)
- **Navigation links**: Home, Calculator, Marketplace
- **Simple text links** (NOT NavigationMenu component):
  - Desktop: `font-bold text-white hover:text-primary`
  - Mobile: Clean hamburger menu, NO duplicate logo, NO border lines between items
- **Marketplace Controls** (conditionally rendered on `/marketplace` routes):
  - **ZoneSelector**: White dropdown (`bg-white text-secondary font-semibold`)
  - **UIStyleSwitcher**: White dropdown (matches ZoneSelector styling exactly)
  - Both visible only when `pathname?.startsWith("/marketplace")`
  - Desktop only (hidden on mobile)
- "Get Quote" CTA button (orange)
- Height: `h-14`
- **Seamless navigation** - blends perfectly with navy header

#### Footer (`components/Footer.tsx`)
- **Navy background**: `bg-secondary` (matches header)
- **3 columns**: Company (with logo + copyright), Quick Links, Contact
- Envia logo (100px width)
- **Copyright integrated** in Company column (no separate bottom bar)
- Bold white headings: `font-bold text-white`
- White text with opacity: `text-white/80`
- Location: "Guatemala City, Guatemala"
- Padding: `py-8`
- All links: `hover:text-primary` (orange on hover)

#### Home Page (`app/page.tsx`)
- **Hero Section**:
  - Centered Envia logo (200-250px responsive)
  - Reduced padding: `py-12 md:py-16`
  - Tagline as main heading (English: "Comprehensive Logistics Solutions")
  - **Solid buttons** (no outlines/gradients):
    - Primary: `bg-primary text-white font-bold`
    - Secondary: `bg-white text-primary font-bold`

- **Features Section**:
  - 3 feature cards (Fast Delivery, On-Time Guarantee, Insured Shipping)
  - **White backgrounds**: `bg-white border-2 border-primary/30`
  - **Bold titles**: `font-bold text-primary`
  - **Solid orange icon backgrounds**: `bg-primary` with white icons
  - Padding: `py-12`

- **CTA Section**:
  - Solid orange background: `bg-primary`
  - Single "Get Started" button (white bg, orange text)
  - Padding: `py-12`

#### Calculator Page (`app/calculator/page.tsx`)
- Navy intro section with title: "Shipping Calculator" (English)
- Single-column layout: `max-w-3xl`
- Quick guide cards with orange accents
- Separator components for visual organization
- Padding: `py-8`
- Info section inline with form

#### ShippingCalculatorForm (`components/calculator/ShippingCalculatorForm.tsx`)
- **All cards**: `bg-white border-2 border-primary/30` (no beige/cream)
- **Bold section titles**: `font-bold text-primary`
- Main card header: Orange icon `bg-primary`, `font-bold` title
- Compact spacing: `space-y-4`
- **Input fields**:
  - White backgrounds: `bg-white`
  - Orange focus states: `focus-visible:border-primary focus-visible:ring-primary/20`
  - **NO number spinners** (hidden with CSS)
  - Shortened labels: "L (cm)", "W (cm)", "H (cm)"
- **Select dropdowns**:
  - Full width: `w-full`
  - White background with orange focus
  - Modern shadcn/ui styling
- **Service Type ToggleGroup**:
  - 3-column grid layout
  - Individual buttons: `border-2 border-gray-200 bg-white`
  - Selected state: `bg-primary text-white border-primary`
  - Hover: `hover:border-primary/50`
- Submit button: `bg-primary text-white font-semibold`

#### PricingResultsCard (`components/calculator/PricingResultsCard.tsx`)
- **White background**: `bg-white border-2 border-primary/30`
- **Bold title**: `font-bold text-primary`
- Prominent price display: `text-5xl font-bold text-primary`
- Badge component for currency
- Separator components for divisions
- Empty state: `border-2 border-dashed`

### Business Logic

#### Shipping Calculator (`lib/shipping-calculator.ts`)

**Pricing Constants**:
- Base rate: Q15 per kg
- Minimum charge: Q25
- Dimensional weight divisor: 5000

**Service Multipliers**:
- Express: 2× (1-2 day delivery)
- Standard: 1× (3-5 day delivery)
- International: 3.5× (5-10 day delivery)

**Calculations**:
```typescript
dimensionalWeight = (L × W × H) / 5000
chargeableWeight = max(actualWeight, dimensionalWeight)
basePrice = chargeableWeight × Q15
totalPrice = max(basePrice × serviceMultiplier, Q25)
```

#### Validation (`lib/validations/shipping-schema.ts`)

Zod schema with constraints:
- Length, Width, Height: 1-200 cm
- Weight: 0.1-100 kg
- Future date validation for scheduled delivery
- Required fields: dimensions, weight, zones, service type

#### Location System (`lib/types.ts`)

Guatemala City zones:
- Zona 1 (Centro Histórico)
- Zona 4 (Business Area)
- Zona 9 (Residential)
- Zona 10 (Business District)
- Zona 11-16 (Various neighborhoods)

### Styling System

#### Tailwind CSS v4 (`app/globals.css`)

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-inter);
  --font-heading: var(--font-dm-sans);
  --font-mono: var(--font-jetbrains-mono);

  /* shadcn/ui color variables */
  --primary: 33 100% 50%;      /* Orange */
  --secondary: 214 52% 24%;    /* Navy */
  --accent: 186 38% 63%;       /* Teal */
  /* ... */
}

/* Direct CSS - NO @layer base with @apply */
* {
  border-color: hsl(var(--border));
}

body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

**IMPORTANT**: Tailwind CSS v4 does NOT support `@layer base` with `@apply` directives. Use direct CSS instead.

#### PostCSS Configuration (`postcss.config.mjs`)

**REQUIRED** for Tailwind CSS v4:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

#### Utility Functions (`lib/utils.ts`)

```typescript
import { cn } from "@/lib/utils";

// Merges Tailwind classes intelligently
<div className={cn("base-class", condition && "conditional-class")} />
```

### Modern Card Patterns

**IMPORTANT**: All cards must have **white backgrounds** (`bg-white`), NO beige/cream (`bg-primary/5`).

Standard card patterns used throughout:

**Feature Cards**:
```tsx
<Card className="bg-white border-2 border-primary/30 hover:shadow-lg hover:scale-105">
  <CardHeader className="pb-3">
    {/* Solid orange icon background with white icon */}
    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-md">
      <Icon className="h-7 w-7 text-white" />
    </div>
    <CardTitle className="text-lg text-primary font-bold">{title}</CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <p className="text-sm text-gray-600">{description}</p>
  </CardContent>
</Card>
```

**Form Section Cards**:
```tsx
<Card className="bg-white border-2 border-primary/30">
  <CardHeader className="pb-3">
    <Label className="text-sm font-semibold text-primary">{sectionTitle}</Label>
  </CardHeader>
  <CardContent className="p-4 pt-0">
    {/* Form inputs */}
  </CardContent>
</Card>
```

**Results Cards**:
```tsx
<Card className="bg-white border-2 border-primary/30">
  <CardHeader className="pb-3">
    <CardTitle className="flex items-center gap-2 text-lg text-primary font-bold">
      <Icon className="h-5 w-5" />
      {title}
    </CardTitle>
  </CardHeader>
  <CardContent className="p-4 pt-0">
    {/* Large prominent display */}
  </CardContent>
</Card>
```

**Empty States**:
```tsx
<Card className="border-2 border-dashed">
  {/* Icon and message */}
</Card>
```

### Dynamic Favicon (`app/icon.tsx`)

Uses Next.js icon route to generate a favicon with brand initials in Envia orange.

## Configuration Files

### `next.config.ts`
- Turbopack enabled by default
- Image remote patterns configured

### `tsconfig.json`
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Next.js plugin configured

### `components.json`
- shadcn/ui configuration
- New York style
- Lucide icons
- CSS variables enabled
- Components in `components/ui`

### `postcss.config.mjs`
- **CRITICAL**: Required for Tailwind CSS v4
- Must include `@tailwindcss/postcss` plugin

---

## Marketplace Feature

### Overview

The marketplace is a complete product browsing and purchasing system that allows ENVÍA's clients (restaurants, pharmacies, retail stores) to list products publicly. Users can browse products, see instant shipping estimates to their zone, and complete single-product purchases.

**Key Features:**
- 5 switchable UI variations (Amazon, Uber Eats, Pinterest, Minimalist, Proximity)
- 70 mock products across 3 categories
- Zone-based shipping price integration
- Single product instant checkout (no cart)
- Filtering, sorting, and search
- Responsive design for all variations

### The 5 UI Variations

#### 1. **Amazon-Style** (Classic E-commerce)
- **Layout**: Dense 3-4 column grid with left sidebar filters
- **Cards**: Text-heavy, ratings, short descriptions
- **Filters**: Left sidebar (category, price, zone, rating, stock)
- **Sorting**: Top bar dropdown
- **Use Case**: Users who want detailed info and robust filtering

#### 2. **Uber Eats-Style** (Visual Browse)
- **Layout**: 2-3 column grid with sticky category tabs
- **Cards**: Large 16:9 images, delivery time focus
- **Navigation**: Horizontal category tabs with icons
- **Hover**: Scale + shadow effects
- **Use Case**: Food-focused browsing, visual discovery

#### 3. **Pinterest-Style** (Masonry Discovery)
- **Layout**: CSS columns masonry grid (variable height)
- **Cards**: Image-first, minimal text initially
- **Interaction**: Hover overlay slides up with details
- **Use Case**: Visual discovery, image-heavy products

#### 4. **Minimalist/Apple-Style** (Premium Clean)
- **Layout**: Spacious 2-3 column grid with maximum whitespace
- **Cards**: Huge 1:1 images (400-500px), product name + price only
- **Buttons**: Outline style "View Details"
- **Borders**: None - subtle shadows only
- **Use Case**: Premium products, lifestyle brands

#### 5. **Proximity/Local-Style** (Zone-Focused)
- **Layout**: Zone-grouped sections (user's zone first, then nearby)
- **Cards**: Location badges prominent, delivery time emphasized
- **Grouping**: "Available in Zona 10" → "Nearby Zones"
- **Use Case**: Local delivery focus, same-zone priority

### Architecture

#### State Management

**MarketplaceContext** (`/contexts/MarketplaceContext.tsx`):
- **CRITICAL**: Wrapped at root layout level (`app/layout.tsx`)
- **Why**: Header components (ZoneSelector, UIStyleSwitcher) need context access
- **State**:
  - `userZone`: Selected delivery zone
  - `currentView`: Active UI variation (amazon, ubereats, etc.)
  - `serviceType`: Shipping service (standard, express, international)
  - `filterState`: Category, price range, ratings, search query
  - `sortOption`: Sort method (price, rating, newest, nearest)

**localStorage Keys**:
- `envia_user_delivery_zone`: Persisted zone selection
- `envia_marketplace_view`: Persisted UI variation
- `envia_service_type`: Persisted service preference
- `envia_zone_set_date`: Timestamp of zone selection

#### Mock Data System

**Product Generation** (`/lib/marketplace/product-data.ts`):
- Generates 70 products across 3 categories
- **Categories**:
  - Food & Beverages (23 products)
  - Pharmacy & Medical (24 products)
  - General Retail (23 products)
- **Product Templates**: Predefined product types with price/weight/dimensions ranges
- **Images**: Uses `placehold.co` with brand colors (orange/navy)
- **Sellers**: Random Guatemala-themed names ("Casa de María", "Tienda Central")
- **Zones**: Distributed across Zona 1-16

**Image Strategy**:
```typescript
// IMPORTANT: Do NOT use Unsplash (fails with 503 errors)
// Use placehold.co with brand colors
https://placehold.co/400x400/FF8C00/FFFFFF/png?text=Food      // Orange bg
https://placehold.co/400x400/1E3A5F/FFFFFF/png?text=Medical   // Navy bg
https://placehold.co/400x400/FF8C00/1E3A5F/png?text=Retail    // Orange bg, navy text
```

#### Shipping Integration

**Bridge to Calculator** (`/lib/marketplace/shipping-integration.ts`):
- Uses existing `calculateShippingPrice()` from `/lib/shipping-calculator.ts`
- Calculates shipping for each product based on:
  - Product dimensions (L × W × H)
  - Product weight
  - Origin zone → Delivery zone
  - Service type multiplier

**Key Functions**:
```typescript
// Calculate shipping for single product
calculateProductShipping(product, userZone, serviceType) → ShippingEstimate

// Batch enrich all products with shipping
enrichProductsWithShipping(products, userZone, serviceType) → ProductWithShipping[]
```

**Default Service**: Standard (1× multiplier, 3-5 day delivery)

### Component Architecture

#### Header Integration

**ZoneSelector** (`components/marketplace/ZoneSelector.tsx`):
- White background (`bg-white`) with navy text (`text-secondary`)
- Semibold font (`font-semibold`)
- Icon: MapPin
- Shows selected zone or "Set Zone"
- **CRITICAL**: Must have `bg-white` - NOT `bg-secondary/10` (causes unreadable text)

**UIStyleSwitcher** (`components/marketplace/UIStyleSwitcher.tsx`):
- Same styling as ZoneSelector (white bg, navy text, semibold)
- Icon: Layout
- Shows current view label
- Dropdown includes view description
- **CRITICAL**: Must match ZoneSelector styling exactly

**Common Mistake to Avoid**:
```typescript
// ❌ BAD - Creates unreadable semi-transparent background
className="bg-secondary/10 text-white border-white/20"

// ✅ GOOD - Clean, readable, matches design system
className="bg-white text-secondary border-2 border-white hover:bg-white/90 font-semibold"
```

#### ProductCard Variants

**ProductCard** (`components/marketplace/ProductCard.tsx`):
- Single component with `variant` prop
- Renders completely different layouts based on variation
- All variants must follow design system:
  - White card backgrounds (`bg-white border-2 border-primary/30`)
  - Orange accents for buttons/badges (`bg-primary`)
  - Navy text (`text-secondary`)
  - Semibold/bold typography

**Variant-Specific Features**:
- **Amazon**: Dense info, stock badge, rating stars
- **Uber Eats**: Large images, delivery time badge, hover scale
- **Pinterest**: Minimal initial, full overlay on hover
- **Minimalist**: Huge images, name + price only, spacious
- **Proximity**: Zone badges, "Delivers today!" for same-zone

#### Product Detail Page

**Page** (`app/marketplace/[productId]/page.tsx`):
- Image gallery with thumbnails (3 images per product)
- Seller info card (name, rating, verified badge, origin zone)
- Shipping estimate badge with breakdown
- Product details table (weight, dimensions, category, origin)
- Tags display
- "Buy Now" button opens QuickCheckoutModal

**Checkout Flow** (`components/marketplace/QuickCheckoutModal.tsx`):
- Single product only (no cart)
- Form fields:
  - Quantity (stock-limited)
  - Delivery zone (pre-filled from context)
  - Delivery address
  - Full name, phone, email (optional)
  - Order notes (optional)
- Order summary:
  - Product total (price × quantity)
  - Shipping cost (from calculator)
  - Grand total
- Zod validation (`/lib/validations/checkout-schema.ts`)
- Mock order confirmation (no real backend)

### Filtering and Sorting

**Filter Options** (`/lib/marketplace/product-filters.ts`):
- **Search**: Text search across product names and descriptions
- **Category**: Food/Beverages, Pharmacy/Medical, General Retail
- **Price Range**: Slider with min/max (dynamically calculated)
- **Rating**: Minimum star rating filter
- **Zone**: Filter by origin zone
- **In Stock**: Toggle to show only available items

**Sort Options**:
- **Relevance**: Default, prioritizes featured products
- **Price**: Low to high, High to low
- **Rating**: Highest rated first
- **Newest**: Most recently added
- **Nearest**: Closest origin zone to user's zone

### User Flow

#### First Visit
1. Navigate to `/marketplace`
2. **ZoneModal** appears automatically (first visit only)
3. User selects delivery zone from dropdown
4. Zone saved to localStorage
5. Products load with shipping estimates
6. Modal doesn't show again (unless localStorage cleared)

#### Browsing
1. Products displayed in default view (Amazon-style on first load)
2. User can switch UI variations via header dropdown
3. Layout transforms without page reload
4. Filter sidebar / category tabs / search available (depending on view)
5. Shipping estimates shown on all cards

#### Purchasing
1. Click product card → Navigate to `/marketplace/[productId]`
2. View full product details, images, seller info
3. See shipping breakdown
4. Click "Buy Now" → QuickCheckoutModal opens
5. Fill form (quantity, address, contact)
6. Review order summary with shipping
7. Click "Place Order" → Mock confirmation
8. **Note**: No cart, no multi-product checkout, no real payment

### Design System Compliance

**Critical Rules for Marketplace**:
- ✅ **ALL card backgrounds**: `bg-white border-2 border-primary/30`
- ✅ **Header dropdowns**: `bg-white text-secondary font-semibold` (NOT semi-transparent)
- ✅ **Primary buttons**: `bg-primary text-white font-semibold`
- ✅ **Orange accents**: Badges, focus states, icons
- ✅ **Navy text**: Headings, labels, body text
- ✅ **Bold typography**: All headings, navigation, labels
- ✅ **No gradients**: Solid colors only
- ✅ **No teal**: Orange + Navy + White ONLY

**Image Placeholders**:
- ❌ **NEVER use Unsplash**: Service unreliable, causes 503 errors
- ✅ **ALWAYS use placehold.co**: Reliable, customizable, supports brand colors
- ✅ **Include category in filename**: Easy to distinguish products

### Troubleshooting

#### Context Errors
**Error**: `useMarketplace must be used within a MarketplaceProvider`

**Cause**: Component trying to use context outside provider scope

**Solution**: Ensure `MarketplaceProvider` wraps entire app in `app/layout.tsx`:
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <MarketplaceProvider>  {/* CRITICAL: Must wrap Header */}
            <Header />
            <main>{children}</main>
            <Footer />
          </MarketplaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**DO NOT** wrap individual pages - context must be global for Header access.

#### Image Loading Failures
**Error**: Upstream image response failed, images showing broken/corrupt

**Cause 1**: Using Unsplash API (unreliable, rate-limited)
- **Fix**: Switch to `placehold.co` in `/lib/marketplace/product-data.ts`

**Cause 2**: Next.js Image optimization failing
- **Fix**: Add `unoptimized` prop to Image component OR configure `next.config.ts` remote patterns

**Cause 3**: DNS resolution failing for placeholder service
- **Fix**: Verify internet connection, try alternative service (e.g., `placehold.co`, `dummyimage.com`)

#### Header Dropdowns Unreadable
**Error**: Zone selector and UI switcher have blue semi-transparent background, text unreadable

**Cause**: Using `bg-secondary/10 text-white border-white/20` (wrong styling)

**Fix**: Change to `bg-white text-secondary border-2 border-white font-semibold`
- Both components must match this styling exactly
- Located in:
  - `/components/marketplace/ZoneSelector.tsx`
  - `/components/marketplace/UIStyleSwitcher.tsx`

#### UI Variation Not Switching
**Error**: Clicking UI switcher doesn't change layout

**Cause**: MarketplaceContext state not updating OR ProductGrid not responding to view changes

**Debug**:
1. Check browser console for context errors
2. Verify `currentView` state updates in React DevTools
3. Ensure marketplace page reads `currentView` from context
4. Check conditional rendering logic in marketplace page

### Testing

**Playwright Tests** (`test-marketplace-simple.mjs`):
- Navigates to marketplace
- Handles zone modal (selects Zona 10)
- Captures full-page screenshot
- Clicks first product, navigates to detail
- Captures product detail screenshot
- Opens checkout modal
- Captures checkout screenshot

**Run Tests**:
```bash
node test-marketplace-simple.mjs
```

**Screenshots Generated**:
- `marketplace-initial.png`: Full marketplace grid
- `marketplace-product-detail.png`: Product detail page
- `marketplace-checkout.png`: Checkout modal open

### Future Enhancements

**Not Yet Implemented** (out of MVP scope):
- Shopping cart (multi-product checkout)
- Real payment integration
- Backend product database
- Seller accounts and product management
- User accounts and order history
- Product reviews and ratings submission
- Advanced filtering (by tags, sellers, etc.)
- Pagination or infinite scroll
- Wishlist / favorites
- Product comparison
- Real-time inventory updates
- Order tracking

---

## Key Constraints and Best Practices

### DO:
- ✅ Use Tailwind classes for ALL styling (`bg-primary`, `text-primary-foreground`)
- ✅ **STRICT COLORS**: Only orange (#FF8C00), navy (#1E3A5F), and white
- ✅ **WHITE card backgrounds** (`bg-white border-2 border-primary/30`)
- ✅ **BOLD typography**: Navigation (font-bold), headings (font-bold 700), labels (font-semibold 600)
- ✅ **Orange focus states**: All inputs/selects use `focus-visible:border-primary focus-visible:ring-primary/20`
- ✅ Use shadcn/ui components exclusively (Button, Card, Separator, etc.)
- ✅ Keep spacing condensed (`py-12`, `gap-4`, `space-y-4`)
- ✅ Add Envia logo to new pages (use Next.js Image component)
- ✅ Use semantic HTML for accessibility
- ✅ Use `cn()` utility for conditional classes
- ✅ Test responsive behavior on mobile and desktop
- ✅ Use ToggleGroup for mutually exclusive options (with solid borders)
- ✅ Use Separator for visual divisions
- ✅ **English language only** - no Spanish text

### DON'T:
- ❌ **NEVER EVER use inline styles** (`style={{ ... }}`)
- ❌ **NEVER use teal/accent colors** (#7EBEC5) - REMOVED from brand
- ❌ **NEVER use gradients** (no `linear-gradient`, no `bg-gradient-to-*`)
- ❌ **NEVER use outline button variants** with teal - use solid buttons only
- ❌ **NEVER use beige/cream backgrounds** (`bg-primary/5`, `bg-primary/10`) - WHITE ONLY
- ❌ **NEVER use transparent backgrounds** on inputs/selects - solid white only
- ❌ **NEVER use NavigationMenu component** - use simple text links with bold font
- ❌ **NEVER add borders** between header and content, or between mobile menu items
- ❌ Use `@layer base` with `@apply` in globals.css (Tailwind v4 incompatible)
- ❌ Add excessive padding/spacing (use condensed scale)
- ❌ Create navigation links to non-existent pages
- ❌ Hardcode colors (use Tailwind classes)
- ❌ Forget PostCSS configuration (required for Tailwind v4)
- ❌ Skip accessibility attributes (ARIA labels, semantic HTML)
- ❌ Use Spanish text (English only)

## Adding New Pages

1. Create page in `/app` directory (e.g., `app/services/page.tsx`)
2. Add route to Header navigation links (update both navigationLinks arrays)
3. Add route to Footer Quick Links
4. Use Envia logo via `<Image src="/envia-logo.png" ... />`
5. Use condensed spacing: `py-12`, `gap-6`
6. Use shadcn/ui components only
7. Follow mobile-first responsive design
8. Add metadata for SEO

## Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

Components are added to `/components/ui`.

**Already installed**:
- button, input, label, select, card
- radio-group, calendar, popover
- navigation-menu, toggle-group, separator, badge, tabs

## Troubleshooting

### Styling Not Applied
- ✅ Check `postcss.config.mjs` exists with `@tailwindcss/postcss` plugin
- ✅ Remove `node_modules`, `.next`, `package-lock.json` and reinstall
- ✅ Ensure no `@layer base` with `@apply` in globals.css
- ✅ Restart dev server

### Font Errors
- ✅ Check `app/layout.tsx` has correct font imports (Inter, DM_Sans, JetBrains_Mono)
- ✅ Check `className` uses correct variable names (inter.variable, dmSans.variable, jetbrainsMono.variable)
- ✅ Check `app/globals.css` has correct `@theme inline` font variables

### Navigation Issues
- ✅ Only 2 links in Header: Home (`/`), Calculator (`/calculator`)
- ✅ Remove links to non-existent pages

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Vercel auto-detects Next.js configuration
3. Environment variables (if needed) set in Vercel dashboard
4. Automatic deployments on push to main branch

### Build Optimization
- Turbopack enabled for faster builds
- Automatic code splitting
- Image optimization
- Font optimization with next/font

## Performance Considerations

- Server Components by default (use `"use client"` only when needed)
- Automatic code splitting per route
- Image optimization with Next.js Image
- Font optimization with next/font
- Tailwind CSS (no CSS-in-JS overhead)

## Accessibility

- Semantic HTML used throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Color contrast meets WCAG standards
- Focus indicators on interactive elements

## Project Evolution

**Recent Updates** (December 2025):

### Marketplace Feature (NEW)
- **Complete product browsing system** with 5 switchable UI variations
- **70 mock products** across Food/Beverages, Pharmacy/Medical, General Retail
- **Zone-based shipping integration** with existing calculator
- **Single product checkout** with Zod validation
- **Global MarketplaceContext** wrapped at root layout for Header access
- **Header controls**: ZoneSelector and UIStyleSwitcher with proper white backgrounds
- **Image system**: placehold.co with brand colors (orange/navy)
- **Filtering & sorting**: Category, price, rating, zone, stock, search
- **Responsive design**: All 5 variations mobile-optimized
- **Critical fixes**:
  - Fixed context provider scope (must wrap entire app)
  - Fixed header dropdown styling (white bg, navy text, semibold)
  - Fixed image loading (switched from Unsplash to placehold.co)

### Design System Updates
- **Theme Standardization**: Removed all teal/accent colors, strict orange + navy only
- **CSS Variable Fix**: Corrected Tailwind v4 HSL format with `hsl()` wrapper
- **Navigation Redesign**: Bold text links, removed NavigationMenu component, no borders
- **Footer Update**: Navy background with integrated copyright text
- **Form Modernization**:
  - Removed ugly number input spinners
  - White card backgrounds throughout (no beige/cream)
  - Orange focus states on all inputs/selects
  - Modern ToggleGroup styling for service selection
  - Full-width dropdowns with proper shadcn/ui styling
- **Typography**: Bold navigation/headings, semibold labels, consistent font weights
- **Language**: All English (removed Spanish)
- **Inline Styles**: Removed ALL inline `style={{}}` props
- **Design Consistency**: Solid orange icon backgrounds, white cards, no gradients

**Current Version**: Unreleased (Marketplace MVP + Modern UI/UX)
- Complete marketplace with 5 UI variations
- Modern, condensed design system
- shadcn/ui components exclusively
- Strict two-color palette (orange + navy)
- Professional, bold typography
- Clean, modern form elements
- Zone-based shipping calculator integration

**Previous Version**: 0.1.0 (Initial MVP)
- Basic shipping calculator
- Theme system with teal accent
- Form validation

## Support

For issues or questions:
- Review this documentation (especially "Recent Updates" section above)
- Review Next.js documentation: https://nextjs.org/docs
- Review shadcn/ui documentation: https://ui.shadcn.com
- Review Tailwind CSS v4 documentation: https://tailwindcss.com

## License

Private project - All rights reserved
