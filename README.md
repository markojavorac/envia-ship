# Envia Ship

Modern shipping calculator and marketplace platform for ENVÍA de Guatemala.

## Features

### Shipping Calculator
- Real-time price calculation based on dimensions and weight
- Multiple service types (Standard, Express, International)
- Zone-to-zone shipping within Guatemala City
- Dimensional weight calculation
- Mobile-responsive interface

### Marketplace
- **5 UI Variations**: Amazon-style, Uber Eats-style, Pinterest-style, Minimalist, Proximity-focused
- **70 Mock Products**: Food & Beverages, Pharmacy & Medical, General Retail
- **Zone-Based Shipping**: Instant shipping estimates integrated with calculator
- **Single Product Checkout**: Quick buy flow with form validation
- **Filtering & Sorting**: By category, price, rating, zone, stock availability
- **Product Details**: Image galleries, seller information, shipping breakdowns

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
  /calculator           # Shipping calculator
  /marketplace          # Product marketplace
    /[productId]        # Product detail pages
  layout.tsx            # Root layout with providers
  globals.css           # Tailwind CSS with theme

/components
  /calculator           # Calculator form components
  /marketplace          # Marketplace components (cards, modals, filters)
  /ui                   # shadcn/ui base components
  Header.tsx            # Global navigation
  Footer.tsx            # Global footer

/contexts
  ThemeContext.tsx          # Branding/theme state
  MarketplaceContext.tsx    # Marketplace state (zone, view, filters)

/lib
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
