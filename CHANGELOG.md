# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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
- Header marketplace controls (ZoneSelector, UIStyleSwitcher)
- Playwright test scripts for automated screenshot capture
- Comprehensive documentation (README.md, MARKETPLACE.md, CHANGELOG.md)

### Fixed
- MarketplaceContext provider scope (now wraps entire app at root layout)
- Header dropdown styling (white background with navy text, no semi-transparent backgrounds)
- Image loading system (switched from Unsplash to placehold.co for reliability)
- Design system compliance (strict orange + navy only, removed all teal/accent colors)

### Changed
- Updated CLAUDE.md to be lightweight (<200 lines) with only high-level project instructions
- Moved detailed implementation documentation to README.md
- Refactored marketplace components to use consistent design patterns
- Improved mobile responsiveness across all UI variations

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
