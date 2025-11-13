# Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Step 1: Push to GitHub

```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your "Gambo" repository
   - Click "Import"

3. **Configure Project**

   Vercel will auto-detect Next.js. Just verify:
   - **Framework Preset:** Next.js
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`

4. **Add Environment Variables**

   Click "Environment Variables" and add:

   ```bash
   # Database (Use Vercel Postgres or external PostgreSQL)
   DATABASE_URL=postgresql://user:password@host:5432/database

   # NextAuth
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

   # AI Service
   GROQ_API_KEY=your_groq_api_key_here

   # BetsAPI Tokens
   BETSAPI_SOCCER_TOKEN=your_token_here
   BETSAPI_BASKETBALL_TOKEN=your_token_here
   BETSAPI_TENNIS_TOKEN=your_token_here
   BETSAPI_HOCKEY_TOKEN=your_token_here
   BETSAPI_FOOTBALL_TOKEN=your_token_here

   # Cron Secret (generate random string)
   CRON_SECRET=<generate with: openssl rand -base64 32>
   ```

5. **Click "Deploy"**
   - First deployment takes 2-3 minutes
   - Vercel will build and deploy automatically

---

## 🗄️ Database Setup

### Option A: Vercel Postgres (Recommended)

1. **In Vercel Dashboard**
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose your plan (Hobby is free)

2. **Connect to Project**
   - Select your Gambo project
   - Vercel automatically adds `DATABASE_URL`

3. **Run Migrations**
   ```bash
   # After first deployment
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

### Option B: External PostgreSQL

Use any PostgreSQL provider:
- **Neon:** [neon.tech](https://neon.tech) (Free tier, serverless)
- **Supabase:** [supabase.com](https://supabase.com) (Free tier)
- **Railway:** [railway.app](https://railway.app) (Database only)

Get your connection string and add to `DATABASE_URL`.

---

## ⏰ Vercel Cron Jobs Setup

Vercel doesn't support PM2, so we use Vercel Cron Jobs instead.

### How It Works:

1. **Cron endpoint created:** `/api/cron/generate-bundles`
2. **Configured in vercel.json:** Runs daily at 10 PM (22:00)
3. **Authentication:** Uses `CRON_SECRET` for security

### Configure Cron Job:

Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/generate-bundles",
      "schedule": "0 22 * * *"
    }
  ]
}
```

### Schedule Format:
- `0 22 * * *` = 10:00 PM UTC daily
- To change time: `minute hour day month dayOfWeek`

### Verify Cron is Active:

1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Cron Jobs"
3. You should see: `/api/cron/generate-bundles` scheduled

### Test Cron Manually:

```bash
curl https://your-app.vercel.app/api/cron/generate-bundles \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## 🔧 Post-Deployment Setup

### 1. Run Database Migrations

```bash
# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 2. Seed Initial Data (Optional)

```bash
npm run prisma:seed
```

### 3. Test the App

Visit your Vercel URL and verify:
- ✅ Home page loads
- ✅ Bundles page works
- ✅ Games Analysis page loads
- ✅ Authentication works
- ✅ Database connected

### 4. Test Cron Job

Manually trigger to test:
```bash
curl https://your-app.vercel.app/api/cron/generate-bundles \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Check Vercel logs for output.

---

## 📊 Monitoring

### View Logs:

1. **Deployment Logs**
   - Vercel Dashboard → Project → "Deployments"
   - Click on a deployment to see build logs

2. **Runtime Logs**
   - Vercel Dashboard → Project → "Logs"
   - Real-time logs from your app

3. **Cron Job Logs**
   - Check logs after 10 PM
   - Search for "Vercel Cron: Starting bundle generation"

### Set Up Alerts:

1. Go to Project Settings → "Notifications"
2. Enable deployment notifications
3. Add email or Slack integration

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically:
# 1. Detects push
# 2. Builds new version
# 3. Runs tests
# 4. Deploys to production
```

### Preview Deployments:

Every branch gets a preview URL:
```bash
git checkout -b feature-branch
git push origin feature-branch

# Vercel creates: https://gambo-feature-branch.vercel.app
```

---

## ⚙️ Environment Variables

### Required Variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=<32-char-secret>

# AI
GROQ_API_KEY=your_key

# BetsAPI
BETSAPI_SOCCER_TOKEN=your_token
BETSAPI_BASKETBALL_TOKEN=your_token
BETSAPI_TENNIS_TOKEN=your_token
BETSAPI_HOCKEY_TOKEN=your_token
BETSAPI_FOOTBALL_TOKEN=your_token

# Cron Security
CRON_SECRET=<32-char-secret>
```

### Add/Update Variables:

1. Vercel Dashboard → Project → "Settings" → "Environment Variables"
2. Add new variable
3. **Important:** Redeploy after adding variables

### Pull Variables Locally:

```bash
vercel env pull .env.local
```

---

## 🚨 Important Differences from PM2

### What Vercel Does Differently:

1. **No PM2 Process Manager**
   - Uses Vercel Cron Jobs instead
   - Serverless functions, not persistent processes

2. **Cron Job Limitations**
   - Max execution time: 5 minutes (Hobby), 15 minutes (Pro)
   - If generation takes longer, consider splitting into steps

3. **Cold Starts**
   - Functions may have cold start delay
   - First request after idle may be slower

4. **File System**
   - `/tmp` is only writable directory
   - Database required (can't use SQLite file)
   - Must use PostgreSQL or external DB

---

## 🔐 Security Checklist

Before going live:

- ✅ `NEXTAUTH_SECRET` is random and secure (32+ chars)
- ✅ `CRON_SECRET` is random and secure (32+ chars)
- ✅ Database URL doesn't contain plain passwords in git
- ✅ All API keys stored as environment variables
- ✅ HTTPS enabled (automatic on Vercel)
- ✅ `.env.local` in `.gitignore`

---

## 📈 Scaling Considerations

### Free Tier Limits:

- **Bandwidth:** 100GB/month
- **Function Execution:** 100GB-hrs/month
- **Serverless Function Duration:** 10 seconds
- **Cron Jobs:** Unlimited on Pro plan

### If You Need More:

1. **Upgrade to Pro Plan** ($20/month)
   - Longer function timeouts (15min for cron)
   - More bandwidth
   - Priority support

2. **Split Generation into Steps**
   - Fetch fixtures (Function 1)
   - Analyze games (Function 2)
   - Create bundles (Function 3)
   - Each runs separately to avoid timeout

---

## 🎯 Expected Behavior

### Daily at 10 PM UTC:

1. Vercel triggers cron job
2. Calls `/api/cron/generate-bundles`
3. Runs generation script
4. Fetches 500 fixtures per sport
5. Analyzes with Groq AI
6. Creates 7-9 bundles
7. Saves to database
8. Returns success response

### Generation Time:

- Small dataset (500 fixtures): 3-5 minutes
- Full dataset (2,500 fixtures): 8-12 minutes

**Note:** If exceeding 5 minutes on Hobby plan, upgrade to Pro or optimize.

---

## 🐛 Troubleshooting

### Issue: "Prisma Client not found"

**Solution:** Ensure build command includes prisma generate:
```bash
prisma generate && next build
```

### Issue: Cron not running

**Solution:**
1. Check Vercel Dashboard → Settings → Cron Jobs
2. Verify `CRON_SECRET` is set
3. Check function logs at scheduled time

### Issue: Database connection failed

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database is accessible from Vercel
3. Ensure connection pool settings are correct

### Issue: Function timeout

**Solution:**
1. Upgrade to Vercel Pro (15min timeout)
2. Or optimize generation to run faster
3. Or split into multiple functions

### Issue: Cold start slow

**Solution:**
1. First request after idle will be slower
2. Keep functions warm with monitoring service
3. Or upgrade to Pro for faster cold starts

---

## 📞 Support Resources

- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Discord:** [vercel.com/discord](https://vercel.com/discord)
- **Cron Jobs Docs:** [vercel.com/docs/cron-jobs](https://vercel.com/docs/cron-jobs)
- **Prisma on Vercel:** [vercel.com/guides/using-prisma-with-vercel](https://vercel.com/guides/using-prisma-with-vercel)

---

## ✅ Deployment Checklist

Before deploying:

- [x] Code pushed to GitHub
- [x] Vercel project created
- [x] Environment variables added
- [x] Database created (Vercel Postgres or external)
- [x] Cron job configured
- [x] CRON_SECRET generated
- [x] First deployment successful

After deploying:

- [ ] Run database migrations
- [ ] Test app functionality
- [ ] Verify cron job scheduled
- [ ] Test cron endpoint manually
- [ ] Check logs for any errors
- [ ] Set up monitoring/alerts
- [ ] Wait for first scheduled run (10 PM)

---

## 🎉 You're Ready!

Your Gambo app will now:

1. ✅ Deploy automatically on git push
2. ✅ Run bundle generation daily at 10 PM
3. ✅ Scale automatically with traffic
4. ✅ Have global CDN for fast loading
5. ✅ Provide preview deployments for branches

**Next Step:** Push to GitHub and import to Vercel!
