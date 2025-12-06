# Envia Ship - Project Instructions

## Project Overview

Modern shipping calculator and marketplace for ENVÍA de Guatemala. Built with Next.js 15.5+, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui components.

## Tech Stack

- **Framework**: Next.js 15.5+ (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 with CSS variables
- **UI**: shadcn/ui (New York style)
- **Validation**: Zod + React Hook Form
- **Fonts**: Inter (body), DM Sans (headings), JetBrains Mono (code)

## Design System (CRITICAL)

### Colors - STRICT
- **Primary**: Orange (#FF8C00)
- **Secondary**: Navy (#1E3A5F)
- **Background**: White (#FFFFFF)
- **NO teal, NO accent colors, NO gradients**

### Styling Rules
- ✅ **ONLY Tailwind classes** - NEVER inline styles
- ✅ **White card backgrounds**: `bg-white border-2 border-primary/30`
- ✅ **Bold typography**: Navigation/headings (`font-bold`), labels (`font-semibold`)
- ✅ **Orange focus states**: `focus-visible:border-primary focus-visible:ring-primary/20`
- ✅ **Condensed spacing**: `py-12` (sections), `gap-4/gap-6` (cards)
- ❌ **NO** beige/cream backgrounds (`bg-primary/5`)
- ❌ **NO** semi-transparent backgrounds (`bg-secondary/10`)
- ❌ **NO** NavigationMenu component (use simple text links)

### Typography Scale
- **H1**: `text-2xl md:text-3xl lg:text-5xl font-bold`
- **H2**: `text-2xl md:text-3xl font-bold`
- **H3**: `text-lg font-semibold`
- **Body**: `text-base`
- **Small**: `text-sm`

## Key Constraints

### DO
- Use shadcn/ui components exclusively
- Trust code as ground truth
- Keep spacing condensed
- Test responsive on mobile
- Use `cn()` for conditional classes

### DON'T
- Use inline `style={{}}` attributes
- Add Spanish text (English only)
- Use number input spinners (hide with CSS)
- Create links to non-existent pages
- Skip accessibility attributes
- Use deprecated font imports

## Critical Files

### Configuration
- `postcss.config.mjs` - Required for Tailwind v4
- `next.config.ts` - Turbopack, image domains
- `tailwind.config.ts` - Theme, CSS variables
- `components.json` - shadcn/ui config

### Layout
- `app/layout.tsx` - Root with providers (Theme, Marketplace)
- `app/globals.css` - Tailwind v4 with inline @theme

### Theme
- `lib/themes.ts` - Envia brand config
- CSS vars in `:root` with `hsl()` wrapper

## Common Patterns

### Card Pattern
```tsx
<Card className="bg-white border-2 border-primary/30 hover:shadow-lg">
  <CardHeader className="pb-3">
    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center">
      <Icon className="h-7 w-7 text-white" />
    </div>
    <CardTitle className="text-lg text-primary font-bold">{title}</CardTitle>
  </CardHeader>
  <CardContent className="pt-0">
    <p className="text-sm text-gray-600">{description}</p>
  </CardContent>
</Card>
```

### Button Pattern
```tsx
// Primary
<Button className="bg-primary text-white hover:bg-primary/90 font-semibold">

// Secondary
<Button className="bg-white text-primary border-2 border-primary hover:bg-primary/5 font-semibold">
```

### Select/Dropdown Pattern
```tsx
<Select>
  <SelectTrigger className="bg-white border-2 border-gray-200 focus:border-primary focus:ring-primary/20">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
  </SelectContent>
</Select>
```

### Loading Indicator

The app uses `nextjs-toploader` for route change loading feedback:
- **Top progress bar**: Orange (#FF8C00) with subtle shadow
- **Auto-configured**: Added to root layout, works globally
- **No manual setup needed**: Automatically tracks all route changes

## Navigation

**Header**: Sticky navy (`bg-secondary`), bold white links, orange CTA button
**Links**: Home, Calculator, Marketplace
**Marketplace Controls** (shown on /marketplace only):
- ZoneSelector: `bg-white text-secondary font-semibold`
- UIStyleSwitcher: `bg-white text-secondary font-semibold`

## Marketplace

### Overview
- 5 UI variations (Amazon, Uber Eats, Pinterest, Minimalist, Proximity)
- 70 mock products (Food, Medical, Retail)
- Zone-based shipping integration
- Single product checkout

### Critical Architecture
- **MarketplaceContext**: Wrapped at root layout (required for Header access)
- **Images**: Use placehold.co (NOT Unsplash - causes 503 errors)
- **Header Dropdowns**: Must use `bg-white text-secondary` (NOT `bg-secondary/10`)

### Key Files
See `/MARKETPLACE.md` for quick reference

## Admin Dark Theme Patterns (CRITICAL)

### Admin Styling Rules (STRICT)

✅ **ALWAYS use CSS variables in admin:**
- `bg-card` (NOT `bg-white`)
- `text-foreground` (NOT `text-gray-900` or `text-secondary`)
- `border-border` (NOT `border-gray-200`)
- `text-muted-foreground` (NOT `text-gray-600`)
- `text-primary` for orange accents
- `text-destructive` for errors
- **Labels MUST include `text-foreground`**: `<Label className="font-semibold text-foreground">`

✅ **Info boxes:**
- Info/Warning: `bg-primary/10 border-l-4 border-primary`
- Error: `bg-destructive/10 border-l-4 border-destructive`

❌ **NEVER use in admin:**
- Hardcoded colors: `bg-white`, `bg-blue-50`, `text-gray-600`
- Inline `style={{}}` attributes

### Admin Component Wrappers

```tsx
import { AdminCard, AdminInfoBox, AdminPageTitle } from "@/components/admin/ui";

// Card with enforced styling
<AdminCard title="Title" icon={Icon}>
  <AdminCardContent>...</AdminCardContent>
</AdminCard>

// Info/warning/error boxes
<AdminInfoBox variant="warning">Add at least 2 stops</AdminInfoBox>
<AdminInfoBox variant="error">Maximum reached</AdminInfoBox>

// Page title with actions
<AdminPageTitle
  title="Dashboard"
  description="View analytics"
  actions={<Button>Export</Button>}
/>
```

### Linting Enforcement

```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
npm run format        # Auto-format with Prettier
npm run check         # Format + lint
```

Build process runs `npm run check` automatically via `prebuild` script.

## Troubleshooting

### Tailwind Not Working
- Check `postcss.config.mjs` has `@tailwindcss/postcss`
- Remove `node_modules`, `.next`, `package-lock.json`, reinstall
- NO `@layer base` with `@apply` in globals.css (v4 incompatible)

### Context Errors (Marketplace)
- Ensure `MarketplaceProvider` wraps entire app in `app/layout.tsx`
- DO NOT wrap individual pages

### Images Not Loading
- Switch to placehold.co in `/lib/marketplace/product-data.ts`
- Configure remote patterns in `next.config.ts`

## Git Workflow

- Commit messages: Conventional Commits format
- Include Claude attribution footer
- NO force push to main
- NO skip hooks

## Documentation

- **CLAUDE.md** (this file): High-level project config (<200 lines)
- **README.md**: Detailed project/feature documentation
- **MARKETPLACE.md**: Quick reference for marketplace
- **CHANGELOG.md**: Version history and updates
- **Code comments**: Why decisions were made (not what code does)

### When to Update Documentation

**"Update documentation" typically means:**
- ✅ **CHANGELOG.md**: Always update for feature additions, fixes, changes
- ✅ **README.md**: Update if necessary for user-facing features
- ✅ **MARKETPLACE.md**: Update if marketplace-specific changes

**Do NOT update CLAUDE.md unless:**
- ❌ Large-scale fundamental project changes (tech stack, architecture)
- ❌ Workflow changes that affect how development is done
- ❌ New critical constraints or patterns that must be followed
- ❌ Changes to design system fundamentals

**Keep documentation updates efficient and lean.**

## Support

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind v4: https://tailwindcss.com
