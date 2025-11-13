# Gambo - Professional Betting Bundles & Live Scores

A world-class betting analysis platform built with Next.js 14, TypeScript, Prisma, and Tailwind CSS.

## Features

### Subscription Tiers

- **Free**: 1 bundle/week, basic analysis, top league live scores
- **Basic ($20/mo)**: 2 bundles/day, advanced analysis, live scores with alerts
- **Pro ($50/mo)**: 5 bundles/day, BTTS bundle, unlimited custom analysis
- **Ultimate ($100/mo)**: All bundles (+50 Odds, Weekend +10, Players to Score, Under/Over), custom requests, early alerts

### Core Functionality

1. **Expert Betting Bundles**
   - Comprehensive game analysis with expandable details
   - Multiple bundle types (Standard, BTTS, High Odds, etc.)
   - Confidence scores and expected returns
   - Track record and performance metrics

2. **Live Scores**
   - Real-time updates across all major sports
   - Advanced stats (xG, possession, shots, etc.)
   - Sport-specific metrics
   - Game status tracking

3. **Analysis System**
   - Recent form analysis
   - Head-to-head history
   - Injury reports
   - Advanced metrics (xG, net rating, etc.)
   - Weather conditions
   - Market intelligence
   - Player form tracking

4. **User Management**
   - Authentication with NextAuth
   - Subscription tier management
   - Custom bundle requests (Ultimate tier)
   - Notification system

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Payments**: Stripe (ready to integrate)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/gambo?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

3. **Set up the database**
```bash
npm run db:setup
```

This will:
- Run Prisma migrations
- Generate Prisma Client
- Seed the database with sample data

4. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Default Admin Credentials

After seeding, you can log in with:
- Email: `admin@gambo.com`
- Password: `admin123`

## Project Structure

```
gambo/
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── bundles/        # Bundle CRUD
│   │   ├── games/          # Game CRUD
│   │   └── register/       # User registration
│   ├── auth/               # Auth pages
│   ├── bundles/            # Bundles listing
│   ├── live-scores/        # Live scores page
│   ├── pricing/            # Pricing page
│   └── dashboard/          # User dashboard (TODO)
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── bundles/            # Bundle-specific components
│   ├── live-scores/        # Live score components
│   ├── pricing/            # Pricing components
│   └── navigation/         # Navigation components
├── lib/
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth config
│   ├── utils.ts            # Utility functions
│   └── subscription.ts     # Subscription logic
└── prisma/
    ├── schema.prisma       # Database schema
    └── seed.ts             # Seed script
```

## Database Schema

Key models:
- `User`: User accounts with subscription tiers
- `Bundle`: Betting bundles with metadata
- `Game`: Sports games/matches
- `BundleGame`: Join table with full analysis
- `LiveGameStats`: Real-time game statistics
- `BundlePerformance`: Track record metrics
- `Notification`: User notifications
- `CustomBundleRequest`: Custom bundle requests

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with sample data
- `npm run db:setup` - Complete database setup (migrate + generate + seed)

## Key Features Implementation

### Bundle Card with Expandable Analysis

Each bundle displays:
- Bundle name, confidence score, expected return
- Game matchups with sport indicators
- Pick and odds for each game
- Summary analysis (always visible)
- Expandable full analysis (10+ data points)

### Subscription-Based Access Control

Use the `canAccessBundle` function from `lib/subscription.ts`:
```typescript
import { canAccessBundle } from '@/lib/subscription';

if (!canAccessBundle(userTier, bundleTier)) {
  // Show upgrade prompt
}
```

### Live Score Updates

The live scores page shows:
- Live games with real-time updates
- Upcoming fixtures
- Finished games with final scores
- Sport-specific stats (possession, xG, etc.)

## Next Steps / TODO

1. **Stripe Integration**
   - Add Stripe checkout
   - Webhook handlers for subscriptions
   - Subscription management dashboard

2. **Admin Dashboard**
   - Bundle creation interface
   - Game management
   - User management
   - Analytics dashboard

3. **Real-time Updates**
   - WebSocket or polling for live scores
   - Push notifications
   - Real-time bundle updates

4. **Additional Features**
   - Email notifications
   - Mobile app (React Native)
   - Social sharing
   - Historical bundle performance graphs
   - User betting slip tracking

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - App URL

Optional (for full functionality):
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `STRIPE_BASIC_PRICE_ID` - Basic tier price ID
- `STRIPE_PRO_PRICE_ID` - Pro tier price ID
- `STRIPE_ULTIMATE_PRICE_ID` - Ultimate tier price ID
- `SPORTS_API_KEY` - Sports data API key
- `ODDS_API_KEY` - Odds data API key

## Contributing

This is a proprietary application. Contact the team for contribution guidelines.

## License

All rights reserved.
