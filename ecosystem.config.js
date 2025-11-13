/**
 * PM2 Ecosystem Configuration for Bundle Generation
 *
 * Runs bundle generation daily at 10:00 PM (server local time)
 *
 * WHY 10:00 PM?
 * - Next-day fixtures and opening odds are typically available
 * - Perfect timing to prepare bundles for the following day
 * - Gives bookmakers time to release odds while markets are fresh
 * - Users can review picks before going to bed
 * - Early morning odds movements can still be captured
 * - Optimal balance between odds availability and freshness
 *
 * FEATURES:
 * - Top 4 vs Bottom 4 matchup detection
 * - H2H historical analysis
 * - Multi-line Over/Under (1.5, 2.5, 3.5)
 * - Smart market selection (best expected value)
 * - Cross-sport intelligence
 *
 * Usage:
 *   Start:   npm run bundles:start   (or pm2 start ecosystem.config.js)
 *   Stop:    npm run bundles:stop    (or pm2 stop gambo-bundles)
 *   Restart: npm run bundles:restart (or pm2 restart gambo-bundles)
 *   Logs:    npm run bundles:logs    (or pm2 logs gambo-bundles)
 *   Status:  npm run bundles:status  (or pm2 status)
 */

module.exports = {
  apps: [
    {
      name: 'gambo-bundles',
      script: 'npx',
      args: 'tsx scripts/schedule-bundle-generation.ts',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    }
  ]
};
