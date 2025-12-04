# Changelog

All notable changes to the Envia Shipping Calculator project will be documented in this file.

## [Unreleased]

### AI-Powered Calculator Enhancement - 2025-12-04

Major feature release adding AI-powered package analysis, time slot selection, and enhanced quote management.

#### Added

- **AI Package Analysis** (Phase 3)
  - Google Gemini 2.0 Flash Vision API integration
  - Image upload component with drag & drop (max 5 images, 5MB each)
  - Mobile camera access via `capture="environment"` attribute
  - Confidence indicators for dimension and weight estimates
  - Package characteristics analysis (shape, fragility, stackability)
  - Smart recommendations based on package analysis
  - Mock mode for development (`USE_MOCK_AI=true`)
  - Base64 image encoding for API transmission
  - Components:
    - `ImageUpload.tsx` - Image upload with previews
    - `ConfidenceIndicator.tsx` - Visual confidence display
    - `AIPackageAnalyzer.tsx` - Main AI analysis interface
    - `CalculatorTabs.tsx` - Tab navigation wrapper
  - Services:
    - `gemini-service.ts` - Gemini API integration
    - `gemini-parser.ts` - Prompt engineering and response parsing
    - `mock-ai-service.ts` - Development mock service
  - API Routes:
    - `/api/analyze-package` - Image analysis endpoint
  - Types:
    - `ai-analysis.ts` - Complete type definitions for AI responses

- **Time Slot Selection** (Phase 1)
  - Morning (8AM-12PM), Afternoon (12PM-5PM), Evening (5PM-8PM) options
  - Progressive disclosure (only shows when "Schedule for later" selected)
  - Separate pickup and delivery time slot pickers
  - Visual time slot icons (Sunrise, Sun, Moon)
  - Components:
    - `TimeSlotPicker.tsx` - RadioGroup-based time slot selector
  - Types:
    - `TimeSlot` enum in `types.ts`
    - `TIME_SLOT_OPTIONS` constant with display data
  - Validation:
    - Added time slot fields to shipping schema

- **Enhanced Quote Management** (Phase 2)
  - Save quotes to localStorage (max 10 quotes)
  - "Save Quote" button with toast notifications
  - "Contact Sales" button with phone link (tel:2303-7676)
  - Quote storage utilities:
    - `quote-storage.ts` - localStorage persistence layer
  - Components:
    - Updated `PricingResultsCard.tsx` with action buttons
  - Notifications:
    - Installed sonner for toast notifications

- **Tab Navigation System**
  - Two-tab interface: "AI Analysis" and "Manual Entry"
  - Seamless data flow from AI to manual form
  - "Use These Estimates" button auto-populates manual form
  - Shared calculator context for state management
  - Components:
    - `CalculatorContext.tsx` - React Context for shared state
    - `CalculatorTabs.tsx` - Tab navigation component
  - Integration:
    - Updated calculator page to use tabs
    - Modified `ShippingCalculatorForm.tsx` to accept initialValues

#### Changed

- **ShippingCalculatorForm**
  - Now accepts `initialValues` prop for AI data pre-fill
  - Added `useEffect` to update form when AI data changes
  - Interface updated to support optional initial values

- **Calculator Page**
  - Replaced direct form with `CalculatorTabs` component
  - Maintains all existing info sections and layout
  - Added context provider wrapper

- **Environment Configuration**
  - Added `.env.local` with Gemini API key
  - Added `USE_MOCK_AI` flag for development mode
  - API key properly secured (ignored by .gitignore)

#### Technical Details

- **Dependencies Added**
  - `@google/generative-ai` - Gemini AI SDK
  - `sonner` - Toast notifications (shadcn/ui)
  - `tabs` component from shadcn/ui

- **File Structure**
  ```
  /app/api/analyze-package/route.ts
  /components/calculator/
    - AIPackageAnalyzer.tsx
    - CalculatorTabs.tsx
    - ConfidenceIndicator.tsx
    - ImageUpload.tsx
    - TimeSlotPicker.tsx
  /contexts/CalculatorContext.tsx
  /lib/services/gemini-service.ts
  /lib/types/ai-analysis.ts
  /lib/gemini-parser.ts
  /lib/mock-ai-service.ts
  /lib/storage/quote-storage.ts
  /.env.local (git-ignored)
  ```

- **Design System Compliance**
  - All components use Orange (#FF8C00) and Navy (#1E3A5F) colors
  - No inline styles - 100% Tailwind classes
  - shadcn/ui components exclusively
  - Condensed modern spacing (py-12, gap-4)
  - Mobile-first responsive design

- **AI Integration Details**
  - Model: `gemini-2.0-flash-exp`
  - Comprehensive prompt engineering with reference objects
  - Conservative estimation guidelines for safety
  - JSON response format with confidence scores
  - Error handling with user-friendly messages
  - 2-second mock delay for realistic testing

- **Quote Storage**
  - Client-side only (MVP approach)
  - localStorage key: `envia-saved-quotes`
  - Maximum 10 saved quotes
  - Server-side safe with window checks

#### Build Status
- ✅ Production build successful
- ✅ No linting errors
- ✅ TypeScript compilation clean
- ✅ All routes optimized
- ✅ Calculator bundle: 273 kB

---

### Major UI/UX Redesign - 2025-12-03

Complete modern redesign implementing a sleek, condensed interface with shadcn/ui components.

#### Added
- **Modern Typography System**
  - Inter: Primary sans-serif font
  - DM Sans: Heading font for improved readability
  - JetBrains Mono: Modern monospace font
  - Font variables configured in `app/globals.css:4-6`

- **Brand Integration**
  - Envia logo integrated throughout application
  - Logo in header (120px), hero section (200-250px responsive), footer (100px)
  - Logo asset: `public/envia-logo.png`

- **New shadcn/ui Components**
  - NavigationMenu: Modern navigation system
  - ToggleGroup: Service type selection
  - Separator: Visual content divisions
  - Badge: Currency and status indicators
  - Tabs: Future extensibility

#### Changed

- **Header Component** (`components/Header.tsx`)
  - Simplified navigation from 6 links to 2 (Home, Calculator)
  - Removed non-existent pages: Services, Tracking, About, Contact
  - Reduced height: h-16 → h-14
  - Added Envia logo replacing package icon
  - Added "Get Quote" CTA button
  - Implemented NavigationMenu component
  - Removed all inline color styles, using Tailwind classes
  - Mobile menu now displays logo at top

- **Footer Component** (`components/Footer.tsx`)
  - Reduced from 4 columns to 3 (Company, Quick Links, Contact)
  - Padding reduced: py-12 → py-8
  - Removed Privacy/Terms links (pages don't exist)
  - Removed Services section
  - Added Envia logo
  - Updated location to "Guatemala City, Guatemala"

- **Home Page** (`app/page.tsx`)
  - **Hero Section**
    - Added centered Envia logo (200-250px responsive)
    - Reduced padding: py-20 md:py-32 → py-12 md:py-16
    - Replaced custom buttons with shadcn/ui Button components
    - Removed "Track Package" link (page doesn't exist)

  - **Features Section**
    - Reduced from 4 features to 3
    - Implemented modern card design with border-2 and hover effects
    - Icon backgrounds: h-12 w-12 rounded-lg bg-primary/10
    - Reduced padding: py-20 → py-12
    - Gap reduced: gap-8 → gap-6

  - **CTA Section**
    - Single "Get Started" button instead of two CTAs
    - Removed phone number display
    - Reduced padding: py-20 → py-12
    - Uses bg-primary Tailwind class

- **Calculator Page** (`app/calculator/page.tsx`)
  - Removed large hero section
  - Compact title with icon (h-6 w-6)
  - Single-column layout: max-w-3xl
  - Reduced padding: py-12 → py-8
  - Added Separator components for visual organization
  - Moved info section inline with form

- **ShippingCalculatorForm** (`components/calculator/ShippingCalculatorForm.tsx`)
  - Changed from 2-column grid to single-column layout
  - Reduced overall spacing: gap-8 → gap-4, space-y-6 → space-y-4
  - Shortened labels: "Length" → "L (cm)", "Width" → "W (cm)", "Height" → "H (cm)"
  - Implemented ToggleGroup for service selection (replaced RadioGroup)
  - Service selection now shows as modern toggle buttons in 3-column grid
  - Nested cards for better section organization
  - Card padding reduced: p-6 → p-4
  - Button uses shadcn/ui size="lg"
  - Removed all inline color styles

- **PricingResultsCard** (`components/calculator/PricingResultsCard.tsx`)
  - Large prominent price: text-4xl → text-5xl
  - Modern card styling: border-2 border-primary/20 bg-primary/5
  - Added Badge component for currency display
  - Implemented Separator components
  - Compact breakdown with reduced spacing
  - Empty state improved with border-2 border-dashed
  - Icon size reduced: h-16 w-16 → h-12 w-12
  - Removed all inline color styles

#### Removed
- All inline style attributes using `style={{ color: theme.colors.* }}`
- Navigation links to non-existent pages
- Excessive whitespace and padding throughout
- Geist and Merriweather fonts
- Large hero sections on calculator page
- Redundant CTA buttons and sections

#### Technical Improvements
- **100% shadcn/ui Components**: All styling through Tailwind CSS classes
- **Consistent Spacing Scale**: py-12, gap-4, space-y-4 throughout
- **Modern Card Patterns**: border-2, hover:border-primary/50, bg-primary/10
- **Responsive Typography**: text-2xl md:text-3xl, leading-tight
- **Mobile-First Design**: All components fully responsive
- **Accessibility**: Proper ARIA labels, keyboard navigation
- **Performance**: Removed unnecessary theme context lookups for colors

#### Files Modified
- `app/layout.tsx` - Font imports and configuration
- `app/globals.css` - Font variables
- `app/page.tsx` - Home page redesign
- `app/calculator/page.tsx` - Calculator page layout
- `components/Header.tsx` - Navigation redesign
- `components/Footer.tsx` - Footer simplification
- `components/calculator/ShippingCalculatorForm.tsx` - Form layout and components
- `components/calculator/PricingResultsCard.tsx` - Results display

#### Design Philosophy
- **Modern & Sleek**: Contemporary UI with clean lines and professional styling
- **Condensed Layout**: Efficient use of space, reduced whitespace
- **shadcn/ui First**: Exclusive use of shadcn/ui components, no custom styling
- **Color Consistency**: Envia brand colors (Orange #FF8C00, Navy #1E3A5F, Teal #7EBEC5)
- **Simplified Navigation**: Only existing pages in navigation
- **Mobile-First**: Responsive design prioritizing mobile experience

---

## [0.1.0] - 2025-12-02

### Initial Release

#### Added
- Next.js 15.5 application with App Router and Turbopack
- React 19.1 with Server Components
- TypeScript 5+ with strict mode
- Tailwind CSS v4 with PostCSS configuration
- shadcn/ui component library (New York style)
- Theme system using React Context and CSS variables
- Envia Guatemala branding (Orange, Navy, Teal color scheme)

#### Components
- Header with navigation
- Footer with company information
- Home page with hero, features, and CTA sections
- Shipping Calculator with form validation
- Pricing results display

#### Business Logic
- Dimensional weight calculation (L×W×H/5000)
- Service tier multipliers (Express 2×, Standard 1×, International 3.5×)
- Guatemala City zone-based location system (14 zones)
- Base rate: Q15/kg with Q25 minimum charge
- Delivery timing options (ASAP, Scheduled)
- React Hook Form + Zod validation

#### Technical Stack
- next: 15.5.7
- react: 19.1.0
- typescript: 5.x
- tailwindcss: 4.x
- react-hook-form: 7.54.2
- zod: 3.24.1
- date-fns: 4.1.0
- @radix-ui components via shadcn/ui

---

## Version History

- **Unreleased**: Modern UI/UX redesign with condensed layout
- **0.1.0**: Initial MVP release with shipping calculator functionality
