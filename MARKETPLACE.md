# Marketplace Quick Reference

## Quick Start

```bash
# View marketplace
http://localhost:3000/marketplace

# Run tests
node test-marketplace-simple.mjs
```

## Key Files

### Core Components
- `/app/marketplace/page.tsx` - Main marketplace page with all 5 UI variations
- `/app/marketplace/[productId]/page.tsx` - Product detail page
- `/components/marketplace/ProductCard.tsx` - Reusable card (5 variants)
- `/components/marketplace/ZoneSelector.tsx` - Header zone dropdown
- `/components/marketplace/UIStyleSwitcher.tsx` - Header UI variation switcher

### Context & State
- `/contexts/MarketplaceContext.tsx` - Global marketplace state (MUST wrap app)
- `/lib/marketplace/storage.ts` - localStorage utilities

### Data & Logic
- `/lib/marketplace/product-data.ts` - 70 mock products generator
- `/lib/marketplace/shipping-integration.ts` - Bridge to calculator
- `/lib/marketplace/product-filters.ts` - Filter/sort utilities
- `/lib/marketplace/types.ts` - TypeScript definitions

## The 5 UI Variations

| Variation | Layout | Key Feature | Use Case |
|-----------|--------|-------------|----------|
| Amazon | Dense grid + sidebar | Robust filtering | Detail-oriented shoppers |
| Uber Eats | Grid + category tabs | Visual browsing | Food/restaurant focus |
| Pinterest | Masonry grid | Hover overlays | Image discovery |
| Minimalist | Spacious grid | Huge images | Premium/lifestyle |
| Proximity | Zone-grouped | Location focus | Same-zone priority |

## Common Issues & Fixes

### ❌ Context Error: "useMarketplace must be used within a MarketplaceProvider"

**Solution**: Wrap entire app in `app/layout.tsx`:
```typescript
<MarketplaceProvider>
  <Header />  {/* Header needs context! */}
  <main>{children}</main>
</MarketplaceProvider>
```

**DO NOT** wrap individual pages - context must be global.

---

### ❌ Images Not Loading / Broken

**Cause**: Using Unsplash (unreliable, 503 errors)

**Solution**: In `/lib/marketplace/product-data.ts`:
```typescript
// ✅ GOOD
function generatePlaceholderUrl(category, seed) {
  return `https://placehold.co/400x400/${color}/png?text=${category}`;
}

// ❌ BAD - DO NOT USE
return `https://source.unsplash.com/...`;
```

**Approved Services**: placehold.co, dummyimage.com

---

### ❌ Header Dropdowns Unreadable (Blue/Transparent Background)

**Cause**: Wrong styling - `bg-secondary/10 text-white`

**Solution**: Both ZoneSelector and UIStyleSwitcher need:
```typescript
className="bg-white text-secondary border-2 border-white hover:bg-white/90 font-semibold"
```

**Files to Fix**:
- `/components/marketplace/ZoneSelector.tsx:25`
- `/components/marketplace/UIStyleSwitcher.tsx:25`

---

### ❌ UI Variation Not Switching

**Debug Steps**:
1. Check browser console for errors
2. Verify `MarketplaceProvider` wraps app
3. Check `currentView` state in React DevTools
4. Ensure marketplace page reads from context

---

## Design System Rules

### ✅ DO
- White card backgrounds: `bg-white border-2 border-primary/30`
- Header dropdowns: `bg-white text-secondary font-semibold`
- Orange buttons: `bg-primary text-white`
- Bold typography: `font-bold` or `font-semibold`

### ❌ DON'T
- Semi-transparent backgrounds: `bg-secondary/10`
- Inline styles: `style={{ ... }}`
- Teal/accent colors (orange + navy only)
- Gradients
- Unsplash images

---

## Data Reference

### Mock Products
- **Total**: 70 products
- **Categories**: Food (23), Medical (24), Retail (23)
- **Zones**: Distributed across Zona 1-16
- **Images**: placehold.co with brand colors

### localStorage Keys
- `envia_user_delivery_zone` - Selected zone
- `envia_marketplace_view` - UI variation
- `envia_service_type` - Shipping service
- `envia_zone_set_date` - Timestamp

---

## Shipping Integration

Uses existing calculator from `/lib/shipping-calculator.ts`:
- **Formula**: max(actualWeight, dimensionalWeight) × baseRate × serviceMultiplier
- **Base Rate**: Q15/kg
- **Minimum**: Q25
- **Services**: Standard (1×), Express (2×), International (3.5×)

---

## Testing

```bash
# Run basic marketplace test
node test-marketplace-simple.mjs

# Captures:
# - marketplace-initial.png (full grid)
# - marketplace-product-detail.png (detail page)
# - marketplace-checkout.png (checkout modal)
```

---

## Architecture Summary

```
User visits /marketplace
  ↓
ZoneModal (first visit only)
  ↓
Select zone → Save to localStorage
  ↓
Products load with shipping estimates
  ↓
Browse (filter, sort, search)
  ↓
Click product → Detail page
  ↓
Click "Buy Now" → QuickCheckoutModal
  ↓
Fill form → Mock confirmation
```

---

## Quick Troubleshooting Checklist

- [ ] MarketplaceProvider wraps entire app in layout.tsx?
- [ ] Header dropdowns use `bg-white text-secondary`?
- [ ] Images use placehold.co (NOT Unsplash)?
- [ ] All cards use `bg-white border-2 border-primary/30`?
- [ ] No inline styles anywhere?
- [ ] Context errors in browser console?
- [ ] Zone saved to localStorage?
- [ ] Dev server running?

---

## Future Enhancements (Not Yet Implemented)

- Shopping cart (multi-product)
- Real payment integration
- Backend product database
- User accounts
- Order history
- Product reviews submission
- Seller accounts
- Real-time inventory
- Order tracking
- Pagination/infinite scroll

---

**For detailed documentation, see:** `/CLAUDE.md` → "Marketplace Feature" section
