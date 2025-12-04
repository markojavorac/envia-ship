# Envia Ship

A modern web application for shipping services built with Next.js 15.5+, React 19, and Tailwind CSS v4.

## Getting Started

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Development Commands

```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production with Turbopack
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
/app                 # Next.js App Router pages and layouts
/components          # React components
/contexts            # React contexts (Theme)
/lib                 # Utility functions and types
/public              # Static assets
```

## Key Features

- Next.js 15.5+ with App Router and Turbopack
- React 19 with Server Components
- TypeScript with strict mode
- Tailwind CSS v4 with CSS variables
- Theme system with React Context
- shadcn/ui components (New York style)
- Responsive design with mobile-first approach
- Dynamic favicon
- Google Fonts integration (Geist, Merriweather)

## Customization

### Theme Configuration

Edit `lib/themes.ts` to customize:
- Company name and branding
- Colors (primary, secondary, accent, etc.)
- Contact information (phone, email)
- Tagline

### Adding shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## Documentation

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation, best practices, and development guidelines.

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and configure the build
4. Deploy!

## License

Private project - All rights reserved
