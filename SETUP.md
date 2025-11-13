# Quick Setup Guide for Gambo

This guide will help you get Gambo up and running quickly.

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
   ```bash
   node --version  # Should show v18 or higher
   ```

2. **PostgreSQL** installed and running
   - macOS: `brew install postgresql && brew services start postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

3. **Git** (if cloning from a repository)

## Step-by-Step Setup

### 1. Install Dependencies

```bash
cd Gambo
npm install
```

This will install all required packages including Next.js, Prisma, NextAuth, and more.

### 2. Configure Database

Create a PostgreSQL database:

```bash
# Using psql
createdb gambo

# Or using PostgreSQL command line
psql -U postgres
CREATE DATABASE gambo;
\q
```

### 3. Set Up Environment Variables

The `.env` file already exists. Update it with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/gambo?schema=public"
```

Replace:
- `YOUR_USERNAME` with your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/gambo?schema=public"
```

### 4. Initialize Database

Run the complete database setup command:

```bash
npm run db:setup
```

This single command will:
1. Create all database tables (via Prisma migrate)
2. Generate the Prisma Client
3. Seed the database with sample data

You should see output like:
```
✓ Migrations applied
✓ Prisma Client generated
Starting seed...
Created admin user: admin@gambo.com
Created sample games
Created sample bundle with games
Created BTTS bundle
Seed completed successfully!
```

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 6. Log In

Use the default admin credentials:
- **Email**: `admin@gambo.com`
- **Password**: `admin123`

## Verify Installation

1. **Home Page**: Visit http://localhost:3000 - you should see the landing page
2. **Bundles**: Visit http://localhost:3000/bundles - you should see 2 sample bundles
3. **Live Scores**: Visit http://localhost:3000/live-scores - you should see 3 upcoming games
4. **Pricing**: Visit http://localhost:3000/pricing - you should see all 4 pricing tiers

## Troubleshooting

### Issue: Database connection error

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
1. Verify PostgreSQL is running: `pg_isready`
2. Check your DATABASE_URL in `.env`
3. Try connecting manually: `psql -U postgres -d gambo`

### Issue: Port 3000 already in use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Option 1: Use a different port
PORT=3001 npm run dev

# Option 2: Kill the process using port 3000
lsof -ti:3000 | xargs kill
```

### Issue: Prisma Client not generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run prisma:generate
```

### Issue: TypeScript errors

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

### For Development:

1. **Create more bundles**: Use Prisma Studio or create an admin interface
   ```bash
   npx prisma studio
   ```

2. **Add more games**: Seed more sample data or connect to a sports API

3. **Customize styling**: Edit Tailwind classes in components

### For Production:

1. **Set up Stripe**: Add your Stripe keys to `.env`
2. **Configure production database**: Use a hosted PostgreSQL (Railway, Supabase, etc.)
3. **Deploy**: Use Vercel, Railway, or your preferred hosting platform

## Useful Commands

```bash
# View database in browser
npx prisma studio

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name your_migration_name

# Check database schema
npx prisma db pull

# Format Prisma schema
npx prisma format

# Check for type errors
npm run build
```

## Development Workflow

1. Make changes to your code
2. The dev server will auto-reload
3. If you change the Prisma schema:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```
4. If you need to reset the database:
   ```bash
   npx prisma migrate reset
   npm run prisma:seed
   ```

## Project Structure Overview

```
Key directories to know:

app/
  ├── page.tsx           → Home page
  ├── bundles/           → Bundles listing page
  ├── live-scores/       → Live scores page
  ├── pricing/           → Pricing page
  └── api/               → API routes

components/
  ├── bundles/           → Bundle card with expandable analysis
  ├── live-scores/       → Live score cards
  ├── pricing/           → Pricing cards
  └── navigation/        → Navbar

lib/
  ├── prisma.ts          → Database client
  ├── auth.ts            → Authentication config
  └── subscription.ts    → Subscription logic

prisma/
  ├── schema.prisma      → Database schema
  └── seed.ts            → Sample data
```

## Getting Help

- Check the main [README.md](README.md) for detailed documentation
- Review the database schema in `prisma/schema.prisma`
- Use Prisma Studio to view/edit data: `npx prisma studio`

## Ready to Build!

You now have a fully functional betting analysis platform with:
- User authentication
- Subscription tiers
- Betting bundles with detailed analysis
- Live scores system
- Responsive UI

Start building your features!