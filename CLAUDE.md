# Envia Ship - Project Instructions

## Project Overview

Admin dashboard for ENVÍA de Guatemala shipping operations. Built with Next.js 15.5+, React 19, TypeScript, Tailwind CSS v4, and shadcn/ui components.

**Note**: Public-facing features (calculator, marketplace, contact) have been archived to `archived-public/` directory.

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

## Spacing Standards (shadcn/ui Guidelines)

### Main Layout
- **Main container**: `px-4 md:px-6` (provides breathing room from sidebar)
- **Mobile bottom spacing**: `pb-20` (clears bottom nav)

### Page-Level Spacing
- **Containers**: `container mx-auto px-4 xl:px-6`
- **Max-width constraints**:
  - Admin pages: No max-width (use full available space)

### Vertical Rhythm
- **Hero sections**: `py-12` (48px) - Spacious introductions
- **Content sections**: `py-8` (32px) - Standard sections
- **Admin sections**: `py-6` (24px) - Compact feel for dashboards

### Gaps & Grids
- **Product grids**: `gap-4 md:gap-6` (responsive comfortable spacing)
- **Form fields**: `gap-4` (16px standard)
- **Card groups**: `gap-6` (24px comfortable)
- **Navigation items**: `gap-2` (8px tight)

### Cards
- **Standard padding**: `p-6` (24px)
- **Compact cards**: `p-4` (16px)
- **Header/Content split**: Header `p-6 pb-3`, Content `p-6 pt-0`

## Key Constraints

### DO
- Use shadcn/ui components exclusively
- Follow spacing standards above
- Trust code as ground truth
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
- `app/layout.tsx` - Root with providers (Theme, Sidebar)
- `app/globals.css` - Tailwind v4 with inline @theme

### Theme
- CSS vars in `:root` with `hsl()` wrapper for light/dark modes

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
  <SelectTrigger className="bg-card border-2 border-border focus:border-primary focus:ring-primary/20">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
  </SelectContent>
</Select>
```

## Theming System

### Architecture
- **Provider**: next-themes with `attribute="class"` (v0.4.6+)
- **Storage**: localStorage key `envia-theme`
- **Default**: Light theme (user can toggle to dark)
- **Toggle**: ThemeToggle component in AppSidebar footer

### Theme Definitions
- **Light** (`:root`): White background, navy/orange brand colors
- **Dark** (`.dark`): Slate-900 background (#0f172a), slate-800 cards (#1e293b), orange primary

### Color Usage Rules (STRICT)

**ALWAYS use CSS variables (NO hardcoded colors):**

✅ **Correct:**
```tsx
<Card className="bg-card border-border">
  <p className="text-muted-foreground">Description</p>
</Card>
```

❌ **Wrong:**
```tsx
<Card className="bg-white border-gray-200">
  <p className="text-gray-600">Description</p>
</Card>
```

**Variable Reference:**
- `bg-background` - Page background
- `bg-card` - Card/panel backgrounds
- `bg-muted` - Subtle backgrounds (was bg-gray-100)
- `bg-input` - Input field backgrounds
- `text-foreground` - Primary text (was text-gray-900)
- `text-muted-foreground` - Secondary text (was text-gray-600)
- `border-border` - Default borders (was border-gray-200)
- `bg-primary`, `text-primary` - Orange brand (keep as-is)
- `bg-secondary`, `text-secondary` - Navy brand (keep as-is)

**Exceptions (keep hardcoded):**
- Brand accent colors: `bg-primary/10`, `border-primary/30`, `hover:bg-primary/90`
- Utility classes: `bg-black/50` (overlays), `text-white` (explicit contrast)

### Loading Indicator

The app uses `nextjs-toploader` for route change loading feedback:
- **Top progress bar**: Orange (#FF8C00) with subtle shadow
- **Auto-configured**: Added to root layout, works globally
- **No manual setup needed**: Automatically tracks all route changes

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

### Images Not Loading
- Configure remote patterns in `next.config.ts`

## Git Workflow

- Commit messages: Conventional Commits format
- Include Claude attribution footer
- NO force push to main
- NO skip hooks

## Vercel Deployment

### CLI Commands

```bash
# Check login status
vercel whoami

# List recent deployments
vercel ls envia-ship

# View runtime logs for a deployment
vercel logs <deployment-url>

# Example: View logs for latest deployment
vercel logs https://envia-ship-abc123.vercel.app
```

### Deployment Status

- **● Building** - Deployment in progress
- **● Ready** - Deployment successful and live
- **● Error** - Build failed, check logs

### Debugging Production Issues

1. **Check deployment status**: `vercel ls envia-ship | head -10`
2. **View runtime logs**: `vercel logs <deployment-url>`
3. **Test API directly**: `curl -X POST https://envia-ship.vercel.app/api/endpoint`
4. **Check environment variables** in Vercel dashboard → Settings → Environment Variables

### Common Issues

- **Build fails with missing env vars**: Ensure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and `SESSION_SECRET` are set in Vercel
- **Auto-deploy not triggering**: Check GitHub integration in Vercel dashboard
- **Database client errors**: Verify env vars are available at build time (use lazy initialization)

## Documentation

- **CLAUDE.md** (this file): High-level project config
- **README.md**: Detailed project/feature documentation
- **CHANGELOG.md**: Version history and updates
- **Code comments**: Why decisions were made (not what code does)

### When to Update Documentation

**"Update documentation" typically means:**
- ✅ **CHANGELOG.md**: Always update for feature additions, fixes, changes
- ✅ **README.md**: Update if necessary for admin features

**Do NOT update CLAUDE.md unless:**
- ❌ Large-scale fundamental project changes (tech stack, architecture)
- ❌ Workflow changes that affect how development is done
- ❌ New critical constraints or patterns that must be followed
- ❌ Changes to design system fundamentals

**Keep documentation updates efficient and lean.**

## Archived Public Features

All public-facing code (calculator, marketplace, contact) has been archived to `archived-public/` directory:
- Pages: calculator, marketplace, contact, root
- Components: calculator (7), marketplace (10), copilot, footer
- Libraries: marketplace data/utilities, copilot AI tools (partially)
- Contexts: MarketplaceContext, CalculatorContext
- API routes: analyze-package, copilot

**Note**: Some marketplace libraries (types, product data, shipping integration) remain in `lib/marketplace/` as they are dependencies for the admin system.

## Support

- Next.js: https://nextjs.org/docs
- shadcn/ui: https://ui.shadcn.com
- Tailwind v4: https://tailwindcss.com
