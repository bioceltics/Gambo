# Gambo - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (Next.js 14 + React)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Home    │  │ Bundles  │  │  Live    │  │ Pricing  │   │
│  │  Page    │  │  Page    │  │ Scores   │  │  Page    │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
│  ┌────────────────────────────────────────────────────┐     │
│  │           Navigation & Layout                       │     │
│  └────────────────────────────────────────────────────┘     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ API Calls
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      API Layer                               │
│                   (Next.js API Routes)                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  /api/auth/[...nextauth]  ─── NextAuth.js                   │
│  /api/register            ─── User Registration             │
│  /api/bundles             ─── Bundle CRUD                    │
│  /api/games               ─── Game CRUD                      │
│                                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Prisma ORM
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Database Layer                            │
│                   (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    Users    │  │   Bundles    │  │    Games     │       │
│  │             │  │              │  │              │       │
│  │ - email     │  │ - name       │  │ - homeTeam   │       │
│  │ - password  │  │ - confidence │  │ - awayTeam   │       │
│  │ - tier      │  │ - return     │  │ - sport      │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ BundleGame  │  │ LiveStats    │  │Performance   │       │
│  │ (Analysis)  │  │              │  │              │       │
│  └─────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Components                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  UI Components (Reusable)                                    │
│  ┌────────────────────────────────────────────┐             │
│  │  • Button (4 variants)                     │             │
│  │  • Card (header, content, footer)          │             │
│  │  • Badge (4 variants)                      │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  Feature Components                                          │
│  ┌────────────────────────────────────────────┐             │
│  │  BundleCard                                │             │
│  │  ├─ Game Info                              │             │
│  │  ├─ Pick & Odds                            │             │
│  │  ├─ Summary (always visible)               │             │
│  │  └─ Expandable Analysis                    │             │
│  │     ├─ Recent Form                         │             │
│  │     ├─ Head-to-Head                        │             │
│  │     ├─ Injuries                            │             │
│  │     ├─ Advanced Metrics                    │             │
│  │     ├─ Weather                             │             │
│  │     ├─ Motivation                          │             │
│  │     ├─ Set Pieces                          │             │
│  │     ├─ Style Matchup                       │             │
│  │     ├─ Player Form                         │             │
│  │     └─ Market Intelligence                 │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  LiveScoreCard                             │             │
│  │  ├─ Team Names & Scores                    │             │
│  │  ├─ Status & Period                        │             │
│  │  └─ Live Stats                             │             │
│  │     ├─ Possession Bar                      │             │
│  │     ├─ Shots                               │             │
│  │     └─ xG (Expected Goals)                 │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  PricingCard                               │             │
│  │  ├─ Tier Name & Price                      │             │
│  │  ├─ Feature List                           │             │
│  │  └─ CTA Button                             │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
│  ┌────────────────────────────────────────────┐             │
│  │  Navbar (Responsive)                       │             │
│  │  ├─ Logo                                   │             │
│  │  ├─ Navigation Links                       │             │
│  │  ├─ Auth Buttons                           │             │
│  │  └─ Mobile Menu                            │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Bundle Display Flow

```
User visits /bundles
       │
       ▼
┌─────────────────┐
│  Server Side    │
│  (page.tsx)     │
└────────┬────────┘
         │
         │ 1. Fetch bundles from DB
         │
         ▼
┌─────────────────┐
│   Prisma ORM    │
│   (lib/prisma)  │
└────────┬────────┘
         │
         │ 2. Query with relations
         │    (bundles + games + analysis)
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   Database      │
└────────┬────────┘
         │
         │ 3. Return data
         │
         ▼
┌─────────────────┐
│  Transform      │
│  Data           │
└────────┬────────┘
         │
         │ 4. Render components
         │
         ▼
┌─────────────────┐
│  BundleCard     │
│  Component      │
└────────┬────────┘
         │
         │ 5. User clicks "Show Analysis"
         │
         ▼
┌─────────────────┐
│  Client State   │
│  (useState)     │
└────────┬────────┘
         │
         │ 6. Expand/Collapse
         │
         ▼
    User sees full analysis
```

### Authentication Flow

```
User Registration
       │
       ▼
┌─────────────────┐
│  /api/register  │
│                 │
│  1. Hash pwd    │
│  2. Create user │
│  3. Set FREE    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Database      │
│   (User table)  │
└─────────────────┘

User Login
       │
       ▼
┌─────────────────┐
│  NextAuth       │
│  /api/auth      │
│                 │
│  1. Verify pwd  │
│  2. Create JWT  │
│  3. Set session │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Session        │
│  (JWT Token)    │
└─────────────────┘
```

## Database Schema Relationships

```
User ─────────────┐
  │               │
  │ 1:N           │ 1:N
  │               │
  ▼               ▼
Notification   CustomBundleRequest


Bundle ────────────┐
  │                │
  │ 1:N            │ 1:1
  │                │
  ▼                ▼
BundleGame    BundlePerformance
  │
  │ N:1
  │
  ▼
Game ──────────────┐
                   │ 1:1
                   │
                   ▼
              LiveGameStats
```

## Feature Access Matrix

```
┌──────────────────┬──────┬───────┬─────┬──────────┐
│     Feature      │ Free │ Basic │ Pro │ Ultimate │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ Bundles/Week     │  1   │  14   │ 35  │    ∞     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ Custom Analysis  │  ✓   │   ✓   │  ✓  │    ✓     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ Live Scores      │  ✓   │   ✓   │  ✓  │    ✓     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ Alerts           │  ✗   │   ✓   │  ✓  │    ✓     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ BTTS Bundle      │  ✗   │   ✗   │  ✓  │    ✓     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ +50 Odds Bundle  │  ✗   │   ✗   │  ✗  │    ✓     │
├──────────────────┼──────┼───────┼─────┼──────────┤
│ Custom Requests  │  ✗   │   ✗   │  ✗  │    ✓     │
└──────────────────┴──────┴───────┴─────┴──────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  • React 19                                          │
│  • Next.js 14 (App Router)                          │
│  • Tailwind CSS                                      │
│  • Lucide React Icons                               │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                   Business Layer                     │
│  • TypeScript                                        │
│  • NextAuth.js (Authentication)                     │
│  • Subscription Logic                               │
│  • Bundle Analysis Engine                           │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                    Data Layer                        │
│  • Prisma ORM                                        │
│  • PostgreSQL                                        │
│  • Indexes & Optimizations                          │
└─────────────────────────────────────────────────────┘
                        │
┌─────────────────────────────────────────────────────┐
│                  External Services                   │
│  • Stripe (Payments) - Ready to integrate           │
│  • Sports APIs - Ready to integrate                 │
│  • Email Service - Ready to integrate               │
└─────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│                    CDN (Vercel Edge)                  │
│              Static Assets & Edge Functions           │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│                Next.js Application                    │
│              (Vercel Serverless Functions)            │
│                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │   Page 1   │  │   Page 2   │  │   API      │    │
│  │ (Server)   │  │ (Server)   │  │  Routes    │    │
│  └────────────┘  └────────────┘  └────────────┘    │
└────────────────────┬─────────────────────────────────┘
                     │
┌────────────────────▼─────────────────────────────────┐
│              Database (PostgreSQL)                    │
│              Neon / Supabase / Railway                │
│                                                       │
│  ┌──────────────────────────────────────────┐       │
│  │  Connection Pooling                       │       │
│  │  SSL Encryption                           │       │
│  │  Automated Backups                        │       │
│  └──────────────────────────────────────────┘       │
└──────────────────────────────────────────────────────┘
```

## Request Flow Example

### User Views Bundle

```
1. User → Browser
   ↓
2. Browser → GET /bundles
   ↓
3. Next.js → Server Component (page.tsx)
   ↓
4. Server → prisma.bundle.findMany()
   ↓
5. Prisma → PostgreSQL Query
   ↓
6. PostgreSQL → Return rows (with JOINs)
   ↓
7. Prisma → Transform to objects
   ↓
8. Server → Render JSX with data
   ↓
9. Next.js → Generate HTML
   ↓
10. Browser → Display page (hydrated React)
```

### User Expands Analysis

```
1. User → Click "Show Full Analysis"
   ↓
2. React → useState update
   ↓
3. Component → Re-render
   ↓
4. Browser → Show expanded section

(No server request needed - data already loaded)
```

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client Side                      │
│  • HTTPS Only                                        │
│  • XSS Protection (React)                           │
│  • CSRF Tokens                                      │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                  Authentication                      │
│  • NextAuth.js                                       │
│  • JWT Tokens                                        │
│  • Secure Cookies                                   │
│  • bcrypt Password Hashing                          │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                     API Layer                        │
│  • Input Validation                                  │
│  • Rate Limiting (via Vercel)                       │
│  • SQL Injection Protection (Prisma)                │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                    Database                          │
│  • SSL Connections                                   │
│  • Access Control                                   │
│  • Encrypted at Rest                                │
│  • Regular Backups                                  │
└─────────────────────────────────────────────────────┘
```

## Performance Optimizations

1. **Server-Side Rendering**
   - Initial page load is fully rendered
   - SEO optimized
   - Fast Time to First Byte

2. **Data Fetching**
   - Efficient queries with Prisma
   - Database indexes on key fields
   - Connection pooling ready

3. **Client-Side**
   - Minimal JavaScript bundle
   - Code splitting by route
   - React Server Components

4. **Caching Strategy**
   - Static pages cached at CDN
   - API responses can be cached
   - Database query caching ready

## Scalability Considerations

```
Current Setup → Can handle 10,000+ users

To scale to 100,000+ users:
├─ Add Redis cache
├─ Implement connection pooling (Prisma Accelerate)
├─ Add CDN for assets
└─ Enable database read replicas

To scale to 1,000,000+ users:
├─ Microservices for heavy operations
├─ Message queue (Bull/Bee)
├─ Load balancer
└─ Multi-region deployment
```

## Development Workflow

```
Local Development
    ├─ npm run dev (port 3000)
    ├─ Docker Compose (optional)
    └─ Prisma Studio (database GUI)
        │
        ▼
Git Commit & Push
        │
        ▼
CI/CD (Vercel/Railway)
    ├─ Run tests
    ├─ Build application
    ├─ Run migrations
    └─ Deploy to staging
        │
        ▼
Manual Approval
        │
        ▼
Deploy to Production
    ├─ Zero downtime
    ├─ Automatic rollback on failure
    └─ Health checks
```

---

This architecture is designed for:
- **Scalability**: Can grow from 10 to 1,000,000 users
- **Maintainability**: Clean separation of concerns
- **Security**: Multiple layers of protection
- **Performance**: Optimized at every layer
- **Developer Experience**: Fast development cycles