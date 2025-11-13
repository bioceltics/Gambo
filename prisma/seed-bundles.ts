import { PrismaClient, BundleType, SubscriptionTier, Sport, GameStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding bundles...');

  // Clear existing bundles
  await prisma.bundleGame.deleteMany({});
  await prisma.bundle.deleteMany({});
  await prisma.game.deleteMany({});

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Helper function to create publishedAt with offset (in reverse order so newest appears first)
  const getPublishedAt = (bundleNumber: number) => {
    const date = new Date(now);
    date.setMinutes(date.getMinutes() - (10 - bundleNumber)); // Bundle 10 is most recent
    return date;
  };

  // Bundle 1: +2 odds free
  const bundle1 = await prisma.bundle.create({
    data: {
      name: 'Free Daily Double',
      type: BundleType.STANDARD,
      confidence: 75,
      expectedReturn: 2.0,
      tierAccess: SubscriptionTier.FREE,
      isActive: true,
      publishedAt: getPublishedAt(1),
    },
  });

  // Create 2 games for +2 odds (1.5 x 1.33 ≈ 2.0)
  const game1 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Manchester City',
      awayTeam: 'Everton',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle1.id,
      gameId: game1.id,
      pick: 'Manchester City to Win',
      odds: 1.5,
      summary: 'Man City dominant at home with 85% win rate against mid-table teams. Everton struggling defensively with 3 clean sheets in last 20 away games.',
      recentForm: 'Man City: WWWWW (5 wins in last 5). Everton: LLDWL (1 win in last 5)',
      headToHead: 'City won last 4 meetings, scoring 13 goals while conceding 2',
      injuries: 'Everton missing key defender Tarkowski. City fully fit.',
      advancedMetrics: 'City xG: 2.8 per game vs Everton xGA: 2.1 per game',
    },
  });

  const game2 = await prisma.game.create({
    data: {
      sport: Sport.BASKETBALL,
      homeTeam: 'Boston Celtics',
      awayTeam: 'Detroit Pistons',
      league: 'NBA',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle1.id,
      gameId: game2.id,
      pick: 'Celtics -8.5',
      odds: 1.33,
      summary: 'Celtics are championship contenders facing struggling Pistons. Home court advantage and superior roster depth.',
      recentForm: 'Celtics: WWLWW (4-1 in last 5). Pistons: LLLWL (1-4 in last 5)',
      headToHead: 'Celtics won last 3 meetings by average of 15 points',
      playerForm: 'Tatum averaging 28.5 PPG in last 10. Brown 24.3 PPG.',
      advancedMetrics: 'Celtics offensive rating 118.5 vs Pistons defensive rating 115.2',
    },
  });

  // Bundle 2: +5 odds mixed sports Basic
  const bundle2 = await prisma.bundle.create({
    data: {
      name: 'Basic Mixed 5X',
      type: BundleType.STANDARD,
      confidence: 82,
      expectedReturn: 5.0,
      tierAccess: SubscriptionTier.BASIC,
      isActive: true,
      publishedAt: getPublishedAt(2),
    },
  });

  // Create 3 games for +5 odds (1.7 x 1.5 x 1.96 ≈ 5.0)
  const game3 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Liverpool',
      awayTeam: 'Crystal Palace',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle2.id,
      gameId: game3.id,
      pick: 'Liverpool to Win',
      odds: 1.7,
      summary: 'Liverpool strong at Anfield with attacking prowess. Palace weak away record.',
      recentForm: 'Liverpool: WWDWW. Palace: LWLLD',
      headToHead: 'Liverpool unbeaten in last 6 home games vs Palace',
      advancedMetrics: 'Liverpool xG 2.5/game. Palace xGA 1.8/game away',
    },
  });

  const game4 = await prisma.game.create({
    data: {
      sport: Sport.FOOTBALL,
      homeTeam: 'Kansas City Chiefs',
      awayTeam: 'Carolina Panthers',
      league: 'NFL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle2.id,
      gameId: game4.id,
      pick: 'Chiefs -10.5',
      odds: 1.5,
      summary: 'Chiefs elite offense vs struggling Panthers defense. Mahomes factor.',
      recentForm: 'Chiefs: WWWLW. Panthers: LLWLL',
      playerForm: 'Mahomes 8 TDs in last 3 games',
      advancedMetrics: 'Chiefs averaging 28.5 PPG vs Panthers allowing 26.3 PPG',
    },
  });

  const game5 = await prisma.game.create({
    data: {
      sport: Sport.BASKETBALL,
      homeTeam: 'Milwaukee Bucks',
      awayTeam: 'Washington Wizards',
      league: 'NBA',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle2.id,
      gameId: game5.id,
      pick: 'Bucks -12.5',
      odds: 1.96,
      summary: 'Giannis-led Bucks dominate at home against bottom-tier Wizards.',
      recentForm: 'Bucks: WWWWL. Wizards: LLLLL',
      playerForm: 'Giannis averaging 32 PPG, 11 RPG at home',
      advancedMetrics: 'Bucks net rating +8.5 vs Wizards -10.2',
    },
  });

  // Bundle 3: +5 odds Mixed sports Pro
  const bundle3 = await prisma.bundle.create({
    data: {
      name: 'Pro Mixed 5X Elite',
      type: BundleType.STANDARD,
      confidence: 85,
      expectedReturn: 5.2,
      tierAccess: SubscriptionTier.PRO,
      isActive: true,
      publishedAt: getPublishedAt(3),
    },
  });

  const game6 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Arsenal',
      awayTeam: 'Burnley',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle3.id,
      gameId: game6.id,
      pick: 'Arsenal to Win',
      odds: 1.4,
      summary: 'Arsenal title chasers vs relegation-threatened Burnley. Home advantage crucial.',
      recentForm: 'Arsenal: WWWDW. Burnley: LLLLL',
      headToHead: 'Arsenal won last 5 meetings, scoring 15 goals',
      advancedMetrics: 'Arsenal xG 2.8/game vs Burnley xGA 2.3/game',
    },
  });

  const game7 = await prisma.game.create({
    data: {
      sport: Sport.HOCKEY,
      homeTeam: 'Colorado Avalanche',
      awayTeam: 'Arizona Coyotes',
      league: 'NHL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle3.id,
      gameId: game7.id,
      pick: 'Avalanche -1.5',
      odds: 1.85,
      summary: 'Avalanche elite at altitude vs struggling Coyotes. MacKinnon in prime form.',
      recentForm: 'Avalanche: WWLWW. Coyotes: LLWLL',
      playerForm: 'MacKinnon 12 points in last 5 games',
      advancedMetrics: 'Avalanche 3.5 goals/game vs Coyotes 2.1 goals/game',
    },
  });

  const game8 = await prisma.game.create({
    data: {
      sport: Sport.TENNIS,
      homeTeam: 'Novak Djokovic',
      awayTeam: 'Francisco Cerundolo',
      league: 'ATP Tour',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle3.id,
      gameId: game8.id,
      pick: 'Djokovic to Win',
      odds: 2.0,
      summary: 'Djokovic experience and consistency vs emerging but inconsistent Cerundolo.',
      recentForm: 'Djokovic: WWWLW (4-1). Cerundolo: LWLWL (2-3)',
      headToHead: 'Djokovic leads 2-0',
      styleMatchup: 'Djokovic defensive mastery neutralizes Cerundolo aggression',
    },
  });

  // Bundle 4: +5 odds Mixed sports Pro (Alternative)
  const bundle4 = await prisma.bundle.create({
    data: {
      name: 'Pro Value Picks 5X',
      type: BundleType.STANDARD,
      confidence: 83,
      expectedReturn: 5.1,
      tierAccess: SubscriptionTier.PRO,
      isActive: true,
      publishedAt: getPublishedAt(4),
    },
  });

  const game9 = await prisma.game.create({
    data: {
      sport: Sport.FOOTBALL,
      homeTeam: 'San Francisco 49ers',
      awayTeam: 'New York Giants',
      league: 'NFL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle4.id,
      gameId: game9.id,
      pick: '49ers -7.5',
      odds: 1.6,
      summary: '49ers elite defense and running game vs Giants offensive struggles.',
      recentForm: '49ers: WWLWW. Giants: LWLLL',
      advancedMetrics: '49ers allowing 18.5 PPG, Giants scoring 19.2 PPG',
    },
  });

  const game10 = await prisma.game.create({
    data: {
      sport: Sport.BASKETBALL,
      homeTeam: 'Denver Nuggets',
      awayTeam: 'Portland Trail Blazers',
      league: 'NBA',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle4.id,
      gameId: game10.id,
      pick: 'Nuggets -9.5',
      odds: 1.75,
      summary: 'Jokic-led Nuggets defending champions vs rebuilding Blazers.',
      playerForm: 'Jokic triple-double threat every game. 26/12/9 averages.',
      advancedMetrics: 'Nuggets +6.8 net rating vs Blazers -4.2',
    },
  });

  const game11 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Bayern Munich',
      awayTeam: 'Hoffenheim',
      league: 'Bundesliga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle4.id,
      gameId: game11.id,
      pick: 'Bayern to Win',
      odds: 1.82,
      summary: 'Bayern dominant at Allianz Arena. Kane scoring for fun.',
      recentForm: 'Bayern: WWWWW. Hoffenheim: WLLWL',
      playerForm: 'Harry Kane 15 goals in last 10 games',
      headToHead: 'Bayern won last 7 home games vs Hoffenheim',
    },
  });

  // Bundle 5: +5 BTTS soccer bundle pro
  const bundle5 = await prisma.bundle.create({
    data: {
      name: 'BTTS Accumulator Pro',
      type: BundleType.BTTS,
      confidence: 80,
      expectedReturn: 5.3,
      tierAccess: SubscriptionTier.PRO,
      isActive: true,
      publishedAt: getPublishedAt(5),
    },
  });

  const game12 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Brentford',
      awayTeam: 'Brighton',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle5.id,
      gameId: game12.id,
      pick: 'Both Teams to Score',
      odds: 1.7,
      summary: 'Both teams attack-minded with leaky defenses. BTTS in 8 of last 10 meetings.',
      recentForm: 'Brentford BTTS in 7/10. Brighton BTTS in 8/10',
      headToHead: 'BTTS occurred in last 5 h2h meetings',
      advancedMetrics: 'Brentford 1.8 goals scored, 1.6 conceded. Brighton 1.9 scored, 1.5 conceded',
    },
  });

  const game13 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Atalanta',
      awayTeam: 'Napoli',
      league: 'Serie A',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle5.id,
      gameId: game13.id,
      pick: 'Both Teams to Score',
      odds: 1.65,
      summary: 'High-scoring Serie A clash. Both teams score and concede freely.',
      recentForm: 'Atalanta BTTS in 9/10. Napoli BTTS in 7/10',
      headToHead: 'BTTS in 4 of last 5 meetings',
      setPieceAnalysis: 'Both teams dangerous from set pieces',
    },
  });

  const game14 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'RB Leipzig',
      awayTeam: 'Borussia Dortmund',
      league: 'Bundesliga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle5.id,
      gameId: game14.id,
      pick: 'Both Teams to Score',
      odds: 1.88,
      summary: 'German attacking football on display. Both defenses vulnerable.',
      recentForm: 'Leipzig BTTS 8/10. Dortmund BTTS 7/10',
      headToHead: 'BTTS in last 6 meetings',
      advancedMetrics: 'Leipzig xG 2.3, xGA 1.4. Dortmund xG 2.5, xGA 1.6',
    },
  });

  // Bundle 6: +5 odds only soccer bundle Ultimate
  const bundle6 = await prisma.bundle.create({
    data: {
      name: 'Soccer Parlay Ultimate 5X',
      type: BundleType.STANDARD,
      confidence: 87,
      expectedReturn: 5.4,
      tierAccess: SubscriptionTier.ULTIMATE,
      isActive: true,
      publishedAt: getPublishedAt(6),
    },
  });

  const game15 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Real Madrid',
      awayTeam: 'Almeria',
      league: 'La Liga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle6.id,
      gameId: game15.id,
      pick: 'Real Madrid -1.5',
      odds: 1.5,
      summary: 'Real Madrid title push vs bottom team Almeria. Expect goal avalanche.',
      recentForm: 'Real: WWWWW. Almeria: LLLLL',
      headToHead: 'Real won last 5 by average of 3 goals',
      playerForm: 'Bellingham 12 goals, Vinicius 10 goals this season',
    },
  });

  const game16 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'PSG',
      awayTeam: 'Strasbourg',
      league: 'Ligue 1',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle6.id,
      gameId: game16.id,
      pick: 'PSG to Win',
      odds: 1.3,
      summary: 'PSG star power overwhelming for Strasbourg. Mbappe and co. too strong.',
      recentForm: 'PSG: WWWDW. Strasbourg: LWLLL',
      playerForm: 'Mbappe 18 goals in 15 games',
      advancedMetrics: 'PSG xG 3.2/game. Strasbourg xGA 2.1/game',
    },
  });

  const game17 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Inter Milan',
      awayTeam: 'Sassuolo',
      league: 'Serie A',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle6.id,
      gameId: game17.id,
      pick: 'Inter Milan to Win',
      odds: 2.77,
      summary: 'Inter defensive solidity meets Sassuolo struggles. Title race intensity.',
      recentForm: 'Inter: WWWWL. Sassuolo: LLWLL',
      headToHead: 'Inter won last 4 home meetings',
      advancedMetrics: 'Inter only conceded 12 goals in 18 home games',
    },
  });

  // Bundle 7: +5 odds over/under soccer bundle - ultimate
  const bundle7 = await prisma.bundle.create({
    data: {
      name: 'Goals Galore Ultimate',
      type: BundleType.UNDER_OVER,
      confidence: 84,
      expectedReturn: 5.6,
      tierAccess: SubscriptionTier.ULTIMATE,
      isActive: true,
      publishedAt: getPublishedAt(7),
    },
  });

  const game18 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Tottenham',
      awayTeam: 'Newcastle',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle7.id,
      gameId: game18.id,
      pick: 'Over 2.5 Goals',
      odds: 1.75,
      summary: 'Two attacking teams with defensive vulnerabilities. Expect goals galore.',
      recentForm: 'Spurs: Over 2.5 in 8/10. Newcastle: Over 2.5 in 7/10',
      headToHead: 'Over 2.5 in last 6 meetings',
      advancedMetrics: 'Combined xG of 5.2 per game in h2h',
    },
  });

  const game19 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Barcelona',
      awayTeam: 'Real Sociedad',
      league: 'La Liga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle7.id,
      gameId: game19.id,
      pick: 'Over 2.5 Goals',
      odds: 1.65,
      summary: 'Barcelona attacking prowess vs Sociedad counter-attacking threat.',
      recentForm: 'Barca: Over 2.5 in 7/10. Sociedad: Over 2.5 in 6/10',
      playerForm: 'Lewandowski 16 goals. Oyarzabal 9 goals',
      advancedMetrics: 'Combined average of 3.8 goals per meeting',
    },
  });

  const game20 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'AC Milan',
      awayTeam: 'Roma',
      league: 'Serie A',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle7.id,
      gameId: game20.id,
      pick: 'Over 2.5 Goals',
      odds: 1.94,
      summary: 'Italian derby with both teams needing wins. Attacking urgency expected.',
      recentForm: 'Milan: Over 2.5 in 6/10. Roma: Over 2.5 in 7/10',
      headToHead: 'Over 2.5 in 5 of last 7 meetings',
      motivationFactors: 'Both teams chasing Champions League spots',
    },
  });

  // Bundle 8: +5 players to score soccer bundle - ultimate
  const bundle8 = await prisma.bundle.create({
    data: {
      name: 'Goalscorers Special Ultimate',
      type: BundleType.PLAYERS_TO_SCORE,
      confidence: 81,
      expectedReturn: 5.5,
      tierAccess: SubscriptionTier.ULTIMATE,
      isActive: true,
      publishedAt: getPublishedAt(8),
    },
  });

  const game21 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Manchester United',
      awayTeam: 'Sheffield United',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle8.id,
      gameId: game21.id,
      pick: 'Rashford to Score Anytime',
      odds: 1.8,
      summary: 'Rashford in red-hot form vs leaky Sheffield defense. 12 goals in last 10 games.',
      playerForm: 'Rashford scored in last 5 home games. Shot accuracy 78%',
      headToHead: 'Rashford scored in last 3 meetings with Sheffield',
      advancedMetrics: 'Rashford xG 0.85 per game. Sheffield conceding 2.1 goals/game',
    },
  });

  const game22 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Atletico Madrid',
      awayTeam: 'Osasuna',
      league: 'La Liga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle8.id,
      gameId: game22.id,
      pick: 'Griezmann to Score Anytime',
      odds: 1.95,
      summary: 'Griezmann main attacking outlet for Atletico. Osasuna weak against creative players.',
      playerForm: 'Griezmann 8 goals in last 10. Creating 3.2 chances/game',
      headToHead: 'Griezmann scored in 4 of last 6 vs Osasuna',
      styleMatchup: 'Griezmann movement perfect vs Osasuna defensive setup',
    },
  });

  const game23 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Juventus',
      awayTeam: 'Udinese',
      league: 'Serie A',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle8.id,
      gameId: game23.id,
      pick: 'Vlahovic to Score Anytime',
      odds: 1.57,
      summary: 'Vlahovic penalty box predator vs Udinese shaky defense.',
      playerForm: 'Vlahovic 11 goals in 15 games. 4.8 shots per game',
      headToHead: 'Vlahovic scored in last 2 meetings',
      advancedMetrics: 'Vlahovic conversion rate 28%. Udinese allowing 12.3 shots/game',
    },
  });

  // Bundle 9: 10 odds weekend mixed sports - ultimate
  const bundle9 = await prisma.bundle.create({
    data: {
      name: 'Weekend Special 10X Ultimate',
      type: BundleType.WEEKEND_PLUS_10,
      confidence: 78,
      expectedReturn: 10.2,
      tierAccess: SubscriptionTier.ULTIMATE,
      isActive: true,
      publishedAt: getPublishedAt(9),
    },
  });

  const game24 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Chelsea',
      awayTeam: 'Luton',
      league: 'Premier League',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle9.id,
      gameId: game24.id,
      pick: 'Chelsea to Win',
      odds: 1.4,
      summary: 'Chelsea quality too much for newly-promoted Luton at Stamford Bridge.',
      recentForm: 'Chelsea: WWDWL. Luton: LLWLL',
      headToHead: 'Chelsea won last 4 home meetings',
      advancedMetrics: 'Chelsea xG 2.2/game vs Luton xGA 2.3/game',
    },
  });

  const game25 = await prisma.game.create({
    data: {
      sport: Sport.FOOTBALL,
      homeTeam: 'Buffalo Bills',
      awayTeam: 'New England Patriots',
      league: 'NFL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle9.id,
      gameId: game25.id,
      pick: 'Bills -6.5',
      odds: 1.75,
      summary: 'Bills high-powered offense vs Patriots rebuilding year. Josh Allen factor.',
      playerForm: 'Allen 12 TDs, 2 INTs in last 5 games',
      recentForm: 'Bills: WWLWW. Patriots: LWLLL',
      advancedMetrics: 'Bills scoring 27.8 PPG. Patriots allowing 25.1 PPG',
    },
  });

  const game26 = await prisma.game.create({
    data: {
      sport: Sport.BASKETBALL,
      homeTeam: 'Phoenix Suns',
      awayTeam: 'San Antonio Spurs',
      league: 'NBA',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle9.id,
      gameId: game26.id,
      pick: 'Suns -11.5',
      odds: 1.68,
      summary: 'Suns Big 3 too much firepower for young Spurs team.',
      playerForm: 'Durant 28 PPG, Booker 26 PPG, Beal 19 PPG',
      recentForm: 'Suns: WWWLW. Spurs: LLLWL',
      advancedMetrics: 'Suns offensive rating 119.2 vs Spurs 108.5',
    },
  });

  const game27 = await prisma.game.create({
    data: {
      sport: Sport.HOCKEY,
      homeTeam: 'Tampa Bay Lightning',
      awayTeam: 'Columbus Blue Jackets',
      league: 'NHL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle9.id,
      gameId: game27.id,
      pick: 'Lightning to Win',
      odds: 2.46,
      summary: 'Lightning playoff-tested experience vs Blue Jackets struggles.',
      recentForm: 'Lightning: WWLWL. Blue Jackets: LLLWL',
      playerForm: 'Kucherov 42 points in 28 games',
      advancedMetrics: 'Lightning 3.3 goals/game vs Blue Jackets 2.4 goals/game',
    },
  });

  // Bundle 10: +50 odds special - ultimate
  const bundle10 = await prisma.bundle.create({
    data: {
      name: 'Mega 50X Special Ultimate',
      type: BundleType.PLUS_50_ODDS,
      confidence: 65,
      expectedReturn: 52.5,
      tierAccess: SubscriptionTier.ULTIMATE,
      isActive: true,
      publishedAt: getPublishedAt(10),
    },
  });

  // Create 6 games for +50 odds (approx 2.0 x 1.8 x 1.7 x 1.6 x 1.5 x 2.2 ≈ 50)
  const game28 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Villarreal',
      awayTeam: 'Getafe',
      league: 'La Liga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game28.id,
      pick: 'Villarreal to Win',
      odds: 2.0,
      summary: 'Villarreal home advantage vs defensive Getafe. Yellow Submarine quality edge.',
      recentForm: 'Villarreal: WWLWD. Getafe: DLLWL',
      headToHead: 'Villarreal won last 3 home meetings',
      advancedMetrics: 'Villarreal xG 1.9/game vs Getafe xGA 1.5/game',
    },
  });

  const game29 = await prisma.game.create({
    data: {
      sport: Sport.BASKETBALL,
      homeTeam: 'LA Lakers',
      awayTeam: 'Utah Jazz',
      league: 'NBA',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game29.id,
      pick: 'Lakers -5.5',
      odds: 1.8,
      summary: 'LeBron and AD partnership overwhelming for rebuilding Jazz.',
      playerForm: 'LeBron 25/7/8 averages. AD 24/12 averages',
      recentForm: 'Lakers: WWLWW. Jazz: LWLLL',
      advancedMetrics: 'Lakers +4.2 net rating at home',
    },
  });

  const game30 = await prisma.game.create({
    data: {
      sport: Sport.FOOTBALL,
      homeTeam: 'Philadelphia Eagles',
      awayTeam: 'Arizona Cardinals',
      league: 'NFL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game30.id,
      pick: 'Eagles -9.5',
      odds: 1.7,
      summary: 'Eagles elite roster vs Cardinals rebuilding. Jalen Hurts MVP form.',
      playerForm: 'Hurts 15 total TDs in last 5 games',
      recentForm: 'Eagles: WWWWL. Cardinals: LLWLL',
      advancedMetrics: 'Eagles +8.5 point differential vs Cardinals -7.2',
    },
  });

  const game31 = await prisma.game.create({
    data: {
      sport: Sport.SOCCER,
      homeTeam: 'Sevilla',
      awayTeam: 'Cadiz',
      league: 'La Liga',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game31.id,
      pick: 'Sevilla to Win',
      odds: 1.6,
      summary: 'Sevilla European pedigree vs struggling Cadiz. Home fortress.',
      recentForm: 'Sevilla: WDWLW. Cadiz: LLLWL',
      headToHead: 'Sevilla won last 5 home meetings',
      motivationFactors: 'Sevilla fighting for European spots',
    },
  });

  const game32 = await prisma.game.create({
    data: {
      sport: Sport.HOCKEY,
      homeTeam: 'Boston Bruins',
      awayTeam: 'Buffalo Sabres',
      league: 'NHL',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game32.id,
      pick: 'Bruins to Win',
      odds: 1.5,
      summary: 'Bruins elite defensive structure vs Sabres inconsistency.',
      recentForm: 'Bruins: WWWLW. Sabres: WLLWL',
      headToHead: 'Bruins won 7 of last 10 meetings',
      advancedMetrics: 'Bruins 3.4 goals/game, allowing 2.3',
    },
  });

  const game33 = await prisma.game.create({
    data: {
      sport: Sport.TENNIS,
      homeTeam: 'Carlos Alcaraz',
      awayTeam: 'Grigor Dimitrov',
      league: 'ATP Tour',
      scheduledAt: tomorrow,
      status: GameStatus.UPCOMING,
    },
  });

  await prisma.bundleGame.create({
    data: {
      bundleId: bundle10.id,
      gameId: game33.id,
      pick: 'Alcaraz to Win',
      odds: 2.2,
      summary: 'Young star Alcaraz energy and athleticism vs veteran Dimitrov.',
      recentForm: 'Alcaraz: WWLWW. Dimitrov: WLWLL',
      headToHead: 'Alcaraz leads 2-1',
      styleMatchup: 'Alcaraz court coverage neutralizes Dimitrov shot-making',
    },
  });

  console.log('Successfully seeded 10 bundles with games!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
