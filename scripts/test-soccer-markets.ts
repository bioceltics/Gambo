import 'dotenv/config';

async function testSoccerMarkets() {
  const token = process.env.BETSAPI_SOCCER_TOKEN;

  console.log('Testing BetsAPI Soccer Markets...\n');

  // Get soccer events
  const eventsRes = await fetch(
    `https://api.b365api.com/v3/events/upcoming?sport_id=1&token=${token}&day=${Math.floor(Date.now()/1000/86400)}&skip_esports=true`
  );
  const eventsData = await eventsRes.json();

  if (!eventsData.success) {
    console.log('Failed to fetch events:', eventsData);
    return;
  }

  // Filter to real soccer only
  const realSoccerEvents = eventsData.results.filter((event: any) => {
    const leagueName = event.league?.name?.toLowerCase() || '';
    return !leagueName.includes('esport') &&
           !leagueName.includes('cyber') &&
           event.league?.cc !== null;
  });

  const event = realSoccerEvents[0];
  console.log('Test Event:', event.home.name, 'vs', event.away.name);
  console.log('League:', event.league.name);
  console.log('Event ID:', event.id);
  console.log('\nFetching ALL odds markets for this event...\n');

  // Get odds for this event
  const oddsRes = await fetch(
    `https://api.b365api.com/v2/event/odds/summary?token=${token}&event_id=${event.id}`
  );
  const oddsData = await oddsRes.json();

  console.log('Odds API Response:');
  console.log('Success:', oddsData.success);
  console.log('Has Results:', !!oddsData.results);

  if (oddsData.results) {
    const bookmakers = Object.keys(oddsData.results);
    console.log('Available Bookmakers:', bookmakers.length);
    console.log('Bookmaker Names:', bookmakers.slice(0, 5));

    // Check first bookmaker
    const firstBookmaker = oddsData.results[bookmakers[0]];
    console.log('\nFirst Bookmaker:', bookmakers[0]);
    console.log('Has odds:', !!firstBookmaker.odds);

    if (firstBookmaker.odds?.start) {
      const markets = Object.keys(firstBookmaker.odds.start);
      console.log('\n📊 AVAILABLE MARKETS:', markets.length);
      console.log('Market IDs:', markets);

      // Show details for each market
      console.log('\n📋 MARKET DETAILS:\n');
      markets.forEach(marketId => {
        const marketData = firstBookmaker.odds.start[marketId];
        if (marketData) {
          console.log(`Market ${marketId}:`);
          console.log(JSON.stringify(marketData, null, 2));
          console.log('---');
        }
      });
    }
  }

  // Also check the BetsAPI documentation for market IDs
  console.log('\n\n📖 COMMON SOCCER MARKET IDs (BetsAPI):');
  console.log('1_1  = Match Result (1X2)');
  console.log('1_2  = Double Chance');
  console.log('1_3  = Total Goals (Over/Under)');
  console.log('1_4  = European Handicap');
  console.log('1_5  = Both Teams to Score (BTTS)');
  console.log('1_6  = Correct Score');
  console.log('1_7  = Half Time Result');
  console.log('1_8  = Half Time/Full Time');
  console.log('And many more...');
}

testSoccerMarkets().catch(console.error);
