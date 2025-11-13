import 'dotenv/config';

// Copy the fetchEventOdds function here to test
async function fetchEventOdds(eventId: string, apiToken: string): Promise<any> {
  try {
    const response = await fetch(
      `https://api.b365api.com/v2/event/odds/summary?token=${apiToken}&event_id=${eventId}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (!data.success || !data.results) {
      return null;
    }

    // Get odds from first available bookmaker
    const bookmakers = Object.keys(data.results);
    for (const bookmaker of bookmakers) {
      const bookmakerData = data.results[bookmaker];

      if (!bookmakerData.odds?.start) continue;

      const result: any = {};

      // H2H/Moneyline markets (all sports)
      const h2hMarkets = ['1_1', '18_1', '13_1', '17_1', '16_1'];
      for (const marketId of h2hMarkets) {
        if (bookmakerData.odds.start[marketId]) {
          const oddsData = bookmakerData.odds.start[marketId];
          result.homeWin = parseFloat(oddsData.home_od) || undefined;
          result.draw = parseFloat(oddsData.draw_od) || undefined;
          result.awayWin = parseFloat(oddsData.away_od) || undefined;
          break;
        }
      }

      // Soccer-specific markets
      // Double Chance (1_2)
      if (bookmakerData.odds.start['1_2']) {
        const dc = bookmakerData.odds.start['1_2'];
        result.doubleChance = {
          homeOrDraw: parseFloat(dc.home_od) || undefined,
          awayOrDraw: parseFloat(dc.away_od) || undefined,
        };
      }

      // Over/Under (1_3)
      if (bookmakerData.odds.start['1_3']) {
        const ou = bookmakerData.odds.start['1_3'];
        result.overUnder = {
          over: parseFloat(ou.over_od) || undefined,
          under: parseFloat(ou.under_od) || undefined,
          line: parseFloat(ou.handicap) || 2.5,
        };
      }

      // BTTS (1_5)
      if (bookmakerData.odds.start['1_5']) {
        const btts = bookmakerData.odds.start['1_5'];
        result.btts = {
          yes: parseFloat(btts.home_od) || undefined,
          no: parseFloat(btts.away_od) || undefined,
        };
      }

      // Return if we found at least H2H odds
      if (result.homeWin || result.awayWin) {
        return result;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function testAllMarkets() {
  const token = process.env.BETSAPI_SOCCER_TOKEN;

  console.log('Testing All Markets Fetching...\n');

  // Soccer event ID from earlier test
  const eventId = '10912852'; // Mighty Tigers vs Kamuzu Barracks

  const odds = await fetchEventOdds(eventId, token!);

  console.log('📊 ALL FETCHED ODDS:\n');
  console.log(JSON.stringify(odds, null, 2));

  console.log('\n\n✅ Markets Available:');
  console.log('H2H (Home/Draw/Away):', odds?.homeWin ? '✓' : '✗');
  console.log('Double Chance:', odds?.doubleChance ? '✓' : '✗');
  console.log('Over/Under:', odds?.overUnder ? '✓' : '✗');
  console.log('BTTS:', odds?.btts ? '✓' : '✗');
}

testAllMarkets().catch(console.error);
