import 'dotenv/config';

async function testOddsAPI() {
  const token = process.env.BETSAPI_BASKETBALL_TOKEN;

  console.log('Testing BetsAPI odds fetching...\n');

  // Get basketball events
  const eventsRes = await fetch(
    `https://api.b365api.com/v3/events/upcoming?sport_id=18&token=${token}&day=${Math.floor(Date.now()/1000/86400)}`
  );
  const eventsData = await eventsRes.json();

  if (!eventsData.success) {
    console.log('Failed to fetch events:', eventsData);
    return;
  }

  const event = eventsData.results[0];
  console.log('Test Event:', event.home.name, 'vs', event.away.name);
  console.log('Event ID:', event.id);
  console.log('\nFetching odds for this event...\n');

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
    console.log('\nFirst Bookmaker Data:');
    console.log('Has odds:', !!firstBookmaker.odds);
    console.log('Has start odds:', !!firstBookmaker.odds?.start);

    if (firstBookmaker.odds?.start) {
      const markets = Object.keys(firstBookmaker.odds.start);
      console.log('Available Markets:', markets);

      // Check for basketball moneyline market (18_1)
      if (firstBookmaker.odds.start['18_1']) {
        console.log('\nBasketball Moneyline (18_1):');
        console.log(JSON.stringify(firstBookmaker.odds.start['18_1'], null, 2));
      }
    }
  }

  console.log('\n\nFull Response (first bookmaker):');
  console.log(JSON.stringify(oddsData.results?.[Object.keys(oddsData.results)[0]], null, 2));
}

testOddsAPI().catch(console.error);
