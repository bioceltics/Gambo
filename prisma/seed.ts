import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@gambo.com' },
    update: {},
    create: {
      email: 'admin@gambo.com',
      password: hashedPassword,
      name: 'Admin User',
      subscriptionTier: 'ULTIMATE',
    },
  });

  console.log('Created admin user:', admin.email);

  // Create sample games
  const game1 = await prisma.game.create({
    data: {
      sport: 'SOCCER',
      homeTeam: 'Manchester City',
      awayTeam: 'Arsenal',
      league: 'Premier League',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      venue: 'Etihad Stadium',
      weather: 'Clear',
      status: 'UPCOMING',
    },
  });

  const game2 = await prisma.game.create({
    data: {
      sport: 'BASKETBALL',
      homeTeam: 'Golden State Warriors',
      awayTeam: 'Boston Celtics',
      league: 'NBA',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      venue: 'Chase Center',
      status: 'UPCOMING',
    },
  });

  const game3 = await prisma.game.create({
    data: {
      sport: 'SOCCER',
      homeTeam: 'Liverpool',
      awayTeam: 'Tottenham',
      league: 'Premier League',
      scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      venue: 'Anfield',
      weather: 'Rainy',
      status: 'UPCOMING',
    },
  });

  console.log('Created sample games');

  // Create a sample bundle
  const bundle = await prisma.bundle.create({
    data: {
      name: 'Saturday Value Bundle',
      type: 'STANDARD',
      confidence: 86,
      expectedReturn: 3.5,
      tierAccess: 'FREE',
      isActive: true,
      publishedAt: new Date(),
    },
  });

  // Add games to bundle with analysis
  await prisma.bundleGame.create({
    data: {
      bundleId: bundle.id,
      gameId: game1.id,
      pick: 'Over 2.5 Goals',
      odds: 1.80,
      summary:
        'Both teams show strong attacking form with defensive vulnerabilities. City\'s home dominance combined with Arsenal\'s missing defenders creates ideal conditions for goals. Historical meetings average 4.2 goals.',
      recentForm:
        'City: WWLWW (12 goals last 5), Arsenal: WWDWL (9 goals last 5)',
      headToHead:
        '8 of last 10 meetings had Over 2.5 goals, average 4.2 goals per game',
      injuries:
        'Arsenal missing Saliba (CB) - major defensive blow, City\'s Rodri doubtful',
      advancedMetrics:
        'Combined xG: 3.4 per game, both teams top 3 in shot creation',
      weatherConditions: 'Dry evening, minimal wind - optimal for attacking football',
      motivationFactors:
        'Title race implications, both managers attack in big games',
      setPieceAnalysis:
        'Combined 18 set piece goals this season, both top 5 in corners',
      styleMatchup:
        'City\'s possession vs Arsenal\'s press leads to high turnovers',
      playerForm: 'Haaland: 5 goals in last 4, Saka: 3 goals & 2 assists last 5',
      marketIntelligence:
        'Professional money heavily backing Over, line movement indicates confidence',
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle.id,
      gameId: game2.id,
      pick: 'Warriors -4.5',
      odds: 1.91,
      summary:
        'Warriors\' strong home form meets Celtics\' road struggles and key injury absence. Historical data shows Warriors dominate this matchup at home with average +6.5 margin.',
      recentForm:
        'Warriors 4-1 last 5 (+8.2 avg), Celtics 3-2 but 1-3 last 4 on road',
      headToHead:
        'Warriors won 2 of last 3, +6.5 avg margin last 5 home games',
      injuries:
        'Celtics missing Porzingis (-5.2 point impact), Warriors fully healthy',
      advancedMetrics:
        'Warriors +8.3 net rating at home, Celtics +2.1 on road',
      motivationFactors: 'Celtics 3rd game in 4 nights with cross-country travel',
      styleMatchup:
        'Curry excels vs Celtics P&R defense, small-ball advantage',
      playerForm: 'Curry averaging 31 PPG last 3 games',
      marketIntelligence:
        'Line moved from -3.5 to -4.5, professional money on Warriors',
    },
  });

  // Create bundle performance
  await prisma.bundlePerformance.create({
    data: {
      bundleId: bundle.id,
      totalGames: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
    },
  });

  console.log('Created sample bundle with games');

  // Create BTTS Bundle
  const bttsBundle = await prisma.bundle.create({
    data: {
      name: 'Saturday BTTS Value Bundle',
      type: 'BTTS',
      confidence: 79,
      expectedReturn: 2.8,
      tierAccess: 'PRO',
      isActive: true,
      publishedAt: new Date(),
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bttsBundle.id,
      gameId: game3.id,
      pick: 'Both Teams to Score - YES',
      odds: 1.72,
      summary:
        'Both teams consistently score and concede in similar fixtures. Defensive issues on both sides with strong attacking talent.',
      recentForm: 'Liverpool: BTTS in 7 of last 9, Tottenham: BTTS in 6 of last 8',
      headToHead: 'BTTS in 9 of last 11 meetings',
      injuries: 'Both teams missing key defenders',
      advancedMetrics: 'Combined xG for and against suggests open game',
      styleMatchup: 'Attacking full-backs create chances but leave defensive gaps',
    },
  });

  await prisma.bundlePerformance.create({
    data: {
      bundleId: bttsBundle.id,
      totalGames: 0,
      wins: 0,
      losses: 0,
      pushes: 0,
    },
  });

  console.log('Created BTTS bundle');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
