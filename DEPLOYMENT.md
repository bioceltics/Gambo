# Deployment Guide for Gambo

This guide covers deploying Gambo to production environments.

## Quick Deploy Options

### Option 1: Vercel (Recommended)

Vercel is the easiest option as it's made by the creators of Next.js.

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js

3. **Set Environment Variables**
   In Vercel dashboard, add:
   ```
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=generate_a_secure_random_string
   NEXTAUTH_URL=https://your-app.vercel.app
   STRIPE_SECRET_KEY=your_stripe_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
   ```

4. **Set up Production Database**
   Options:
   - [Neon](https://neon.tech) - Serverless Postgres (Free tier available)
   - [Supabase](https://supabase.com) - Free tier with 500MB
   - [Railway](https://railway.app) - $5/month
   - [Heroku Postgres](https://www.heroku.com/postgres)

5. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Railway

Railway provides both hosting and database in one place.

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Initialize Project**
   ```bash
   railway init
   ```

3. **Add PostgreSQL**
   ```bash
   railway add postgresql
   ```

4. **Set Environment Variables**
   ```bash
   railway variables set NEXTAUTH_SECRET=your_secret
   railway variables set NEXTAUTH_URL=https://your-app.railway.app
   ```

5. **Deploy**
   ```bash
   railway up
   ```

### Option 3: Docker + Any Cloud Provider

See [Docker Setup](#docker-setup) below.

## Pre-Deployment Checklist

- [ ] Database is set up and accessible
- [ ] Environment variables are configured
- [ ] Prisma migrations are up to date
- [ ] NEXTAUTH_SECRET is a secure random string
- [ ] NEXTAUTH_URL matches your domain
- [ ] Stripe keys are production keys (if using payments)
- [ ] Database connection is secure (SSL enabled)

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/gambo?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="https://your-domain.com"

# Stripe (Optional but recommended)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_BASIC_PRICE_ID="price_..."
STRIPE_PRO_PRICE_ID="price_..."
STRIPE_ULTIMATE_PRICE_ID="price_..."
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Database Setup

### Production Database Providers

#### Option A: Neon (Recommended)

Free tier includes:
- 500MB storage
- Serverless PostgreSQL
- Automatic scaling
- Branching for dev/staging

Setup:
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add `?sslmode=require` to the connection string

#### Option B: Supabase

Free tier includes:
- 500MB database
- Automatic backups
- REST API
- Real-time subscriptions

Setup:
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string (Transaction mode)
5. Replace `[YOUR-PASSWORD]` with your actual password

#### Option C: Railway

Advantages:
- Postgres + app hosting in one place
- Simple pricing
- Automatic SSL

Setup:
```bash
railway add postgresql
railway variables
# Copy DATABASE_URL
```

### Run Migrations

After setting up your production database:

```bash
# Set production DATABASE_URL
export DATABASE_URL="your_production_database_url"

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run prisma:seed
```

## Docker Setup

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

For local development:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gambo
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/gambo
      NEXTAUTH_SECRET: development-secret
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose up --build
```

## Vercel Deployment (Detailed)

### 1. Prepare for Deployment

Update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For Docker deployments
};

export default nextConfig;
```

### 2. Set Up Database

1. Create production database (e.g., Neon)
2. Copy connection string
3. Add to Vercel environment variables

### 3. Configure Vercel

Create `vercel.json`:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

### 4. Environment Variables in Vercel

Dashboard > Project > Settings > Environment Variables

Add all variables from `.env`:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- STRIPE_* (if using)

### 5. Deploy

```bash
npm i -g vercel
vercel --prod
```

Or push to GitHub and let Vercel auto-deploy.

## Post-Deployment Tasks

### 1. Run Database Migrations

```bash
# Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy

# Or via your hosting platform's CLI
```

### 2. Seed Initial Data

```bash
npm run prisma:seed
```

### 3. Test the Application

1. Visit your deployed URL
2. Try to register a user
3. Log in with admin credentials
4. Check bundles page
5. Check live scores page
6. Verify database connections

### 4. Set Up Monitoring

Options:
- [Vercel Analytics](https://vercel.com/analytics)
- [Sentry](https://sentry.io) for error tracking
- [LogRocket](https://logrocket.com) for session replay

### 5. Set Up Backups

For production database:
- Enable automated backups
- Test restore procedures
- Set up backup notifications

## Performance Optimization

### 1. Enable Caching

In `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, must-revalidate',
        },
      ],
    },
  ],
};
```

### 2. Database Connection Pooling

For serverless (Vercel), use connection pooling:

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=1'
    }
  }
})
```

Or use Prisma Accelerate for connection pooling and caching.

### 3. Enable Production Optimizations

```bash
# Build with optimizations
NODE_ENV=production npm run build
```

## Security Checklist

- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database connection uses SSL
- [ ] Environment variables are not committed to git
- [ ] Stripe webhook secret is configured
- [ ] CORS is configured properly
- [ ] Rate limiting is enabled (via Vercel or nginx)
- [ ] Database has proper indexes
- [ ] Sensitive data is encrypted at rest

## Monitoring & Maintenance

### 1. Set Up Alerts

- Database CPU/Memory usage
- Application errors
- Slow API responses
- Failed Stripe payments

### 2. Regular Tasks

- Monitor database size
- Review error logs
- Check API response times
- Update dependencies monthly
- Backup database weekly

### 3. Scaling Considerations

When to scale:
- Database connections maxed out → Add connection pooling
- Slow queries → Add database indexes
- High traffic → Enable CDN and caching
- API rate limits → Implement queueing

## Troubleshooting

### Issue: Build fails on Vercel

**Solution**: Check build logs, ensure `prisma generate` runs before build

```json
// vercel.json
{
  "buildCommand": "npx prisma generate && next build"
}
```

### Issue: Database connection timeout

**Solution**: Use connection pooling or Prisma Accelerate

### Issue: Environment variables not loading

**Solution**:
1. Check Vercel dashboard
2. Redeploy after adding variables
3. Verify variable names match exactly

### Issue: Authentication not working

**Solution**:
1. Verify NEXTAUTH_URL matches your domain
2. Check NEXTAUTH_SECRET is set
3. Ensure cookies are allowed

## Rollback Procedure

If deployment fails:

### Vercel
```bash
vercel rollback
```

### Railway
```bash
railway down
railway up --detach
```

### Manual
1. Revert git commit
2. Redeploy previous version
3. Restore database backup if needed

## Cost Estimation

### Minimal Setup (Free)
- Vercel: Free (Hobby plan)
- Neon Database: Free (500MB)
- Total: $0/month

### Production Setup
- Vercel Pro: $20/month
- Railway Postgres: $5/month
- Stripe: 2.9% + $0.30 per transaction
- Total: ~$25/month + transaction fees

### Scaling
- Add Prisma Accelerate: $29/month (connection pooling + caching)
- Upgrade database: $15-50/month (depending on provider)
- Add Vercel Enterprise: $150+/month (for larger teams)

## Success Metrics

After deployment, monitor:
- Uptime (aim for 99.9%)
- Response time (< 200ms)
- Error rate (< 1%)
- Database query time (< 100ms)
- Build time (< 2 minutes)

## Getting Help

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Support](https://vercel.com/support)
- [Railway Docs](https://docs.railway.app)

---

Your Gambo app is now production-ready! 🚀