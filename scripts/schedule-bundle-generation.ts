/**
 * Smart Bundle Generation Scheduler
 * Runs daily at 10:00 PM (server local time) for optimal bundle generation
 *
 * WHY 10:00 PM?
 * - Next-day fixtures and opening odds are typically available
 * - Perfect timing to prepare bundles for the following day
 * - Gives bookmakers time to release odds while markets are fresh
 * - Users can review picks before going to bed
 * - Early morning odds movements can still be captured
 * - Optimal balance between odds availability and freshness
 *
 * Daily generation ensures:
 * - Fresh picks every day for users
 * - Comprehensive analysis of all available matches
 * - Optimal odds from bookmakers worldwide
 * - Top 4 vs Bottom 4 matchup identification
 * - Multi-line Over/Under analysis (1.5, 2.5, 3.5)
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const BUNDLE_SCRIPT = path.join(__dirname, 'generate-intelligent-bundles.ts');
const LOG_DIR = path.join(__dirname, '../logs');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

function getUTCTimeString(): string {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
}

function getLogFileName(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  return path.join(LOG_DIR, `bundles-${dateStr}.log`);
}

async function runBundleGeneration(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🕐 ${getUTCTimeString()}`);
    console.log(`🚀 Starting bundle generation...`);
    console.log(`${'='.repeat(60)}\n`);

    const logFile = getLogFileName();
    const logStream = fs.createWriteStream(logFile, { flags: 'a' });

    logStream.write(`\n${'='.repeat(60)}\n`);
    logStream.write(`Execution Time: ${getUTCTimeString()}\n`);
    logStream.write(`${'='.repeat(60)}\n\n`);

    const child = spawn('npx', ['tsx', BUNDLE_SCRIPT], {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env
    });

    // Pipe output to both console and log file
    child.stdout.on('data', (data) => {
      process.stdout.write(data);
      logStream.write(data);
    });

    child.stderr.on('data', (data) => {
      process.stderr.write(data);
      logStream.write(data);
    });

    child.on('close', (code) => {
      logStream.end();

      if (code === 0) {
        console.log(`\n✅ Bundle generation completed successfully`);
        console.log(`📝 Log saved to: ${logFile}\n`);
        resolve();
      } else {
        console.log(`\n❌ Bundle generation failed with code ${code}`);
        console.log(`📝 Error log saved to: ${logFile}\n`);
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      logStream.end();
      console.error(`\n❌ Failed to start bundle generation: ${error.message}\n`);
      reject(error);
    });
  });
}

/**
 * Calculate milliseconds until next 10:00 PM (local server time)
 */
function getMillisecondsUntil10PM(): number {
  const now = new Date();
  const next10PM = new Date(now);

  // Set to 10:00 PM (22:00) today
  next10PM.setHours(22, 0, 0, 0);

  // If 10 PM has already passed today, schedule for tomorrow
  if (now.getTime() >= next10PM.getTime()) {
    next10PM.setDate(next10PM.getDate() + 1);
  }

  return next10PM.getTime() - now.getTime();
}

/**
 * Get formatted time string for logging
 */
function getFormattedNextRunTime(): string {
  const now = new Date();
  const next10PM = new Date(now);

  next10PM.setHours(22, 0, 0, 0);
  if (now.getTime() >= next10PM.getTime()) {
    next10PM.setDate(next10PM.getDate() + 1);
  }

  return next10PM.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function scheduleNextRun() {
  const msUntil10PM = getMillisecondsUntil10PM();
  const hours = Math.floor(msUntil10PM / (1000 * 60 * 60));
  const minutes = Math.floor((msUntil10PM % (1000 * 60 * 60)) / (1000 * 60));

  console.log(`⏰ Next run scheduled in ${hours}h ${minutes}m`);
  console.log(`   Target time: ${getFormattedNextRunTime()}`);
  console.log(`   Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
  console.log(`   Press Ctrl+C to stop the scheduler\n`);

  setTimeout(async () => {
    try {
      await runBundleGeneration();
    } catch (error) {
      console.error('Scheduled run failed:', error);
    }
    // Schedule the next run after this one completes
    scheduleNextRun();
  }, msUntil10PM);
}

async function scheduleLoop() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const currentTime = new Date().toLocaleString();

  console.log(`\n╔════════════════════════════════════════════════════════════╗`);
  console.log(`║     INTELLIGENT BUNDLE SCHEDULER (Daily Generation)      ║`);
  console.log(`╚════════════════════════════════════════════════════════════╝\n`);
  console.log(`📅 Running daily at 10:00 PM (local server time)`);
  console.log(`🌍 Timezone: ${timezone}`);
  console.log(`🕐 Current time: ${currentTime}`);
  console.log(`📂 Logs directory: ${LOG_DIR}`);
  console.log(`\n⭐ FEATURES:`);
  console.log(`   • Top 4 vs Bottom 4 matchup detection`);
  console.log(`   • H2H historical analysis`);
  console.log(`   • Multi-line Over/Under (1.5, 2.5, 3.5)`);
  console.log(`   • Smart market selection (best EV)`);
  console.log(`   • Cross-sport intelligence\n`);

  // DON'T run immediately on start - only run at scheduled 10 PM time
  // This prevents generating bundles every time the scheduler restarts

  // Schedule next run at 10 PM
  scheduleNextRun();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Scheduler stopped gracefully\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\n👋 Scheduler stopped gracefully\n');
  process.exit(0);
});

// Start the scheduler
scheduleLoop().catch(error => {
  console.error('Scheduler failed:', error);
  process.exit(1);
});
