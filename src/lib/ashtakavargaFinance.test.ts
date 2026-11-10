// The Aṣṭakavarga and money (ashtakavargaFinance.ts): the example of the lesson, typed in from its text.
import assert from 'node:assert/strict';
import { LOSS_LIMIT, WEALTH_LIMIT, binduClass, buildFinance, financeFromHouses } from './ashtakavargaFinance';
import { buildAshtakavarga } from './ashtakavarga';
import { REFERENCE_CHART } from './shadbala.fixture';

assert.equal(WEALTH_LIMIT, 164);
assert.equal(LOSS_LIMIT, 76);

// The lesson's chart: the 1st 32, the 2nd 25, the 4th 30, the 6th 29, the 8th 31, the 9th 23, the 10th 32, the 11th 34, the 12th 20. The 3rd, 5th and 7th are not
// given; they share what is left of 337 (81) and do not enter any rule.
{
  const sav = [32, 25, 27, 30, 27, 29, 27, 31, 23, 32, 34, 20];
  assert.equal(sav.reduce((sum, value) => sum + value, 0), 337);
  const result = financeFromHouses(sav);
  // The first sūtra: the Lagna over the 12th (and over 28), the 11th over the 12th, but the 2nd under the 11th.
  assert.deepEqual(result.comparisons.map(item => [item.left.bindus, item.right.bindus, item.holds]), [[32, 20, true], [34, 20, true], [25, 34, false]]);
  assert.equal(result.lagnaAhead, true);
  // The second: 32 + 25 + 30 + 23 + 32 + 34 = 176, over 164; 29 + 31 + 20 = 80, over 76; the 8th has the most.
  assert.equal(result.wealthSum, 176);
  assert.equal(result.wealthPromise, true);
  assert.equal(result.lossSum, 80);
  assert.equal(result.lossHeavy, true);
  assert.deepEqual(result.leak, [8]);
}
// The limits are "more than": exactly 164 and 76 do not pass; a Lagna of 28 is not ahead though it beats the 12th; two houses can share the most.
{
  const result = financeFromHouses([28, 27, 30, 27, 30, 26, 30, 26, 27, 27, 28, 24]);
  assert.equal(result.comparisons[0].holds, true);
  assert.equal(result.lagnaAhead, false);
  assert.equal(result.wealthSum, 164);
  assert.equal(result.wealthPromise, false);
  assert.equal(result.lossSum, 76);
  assert.equal(result.lossHeavy, false);
  assert.deepEqual(result.leak, [6, 8]);
  assert.equal(result.comparisons[2].holds, false, '27 against 28');
}
// The classes of the bindus: the lesson's 7 is many and its 4 average.
assert.deepEqual([0, 3, 4, 5, 7, 8].map(binduClass), ['few', 'few', 'average', 'many', 'many', 'many']);

// A chart: the numbers are those of the Aṣṭakavarga of the page, and the grahas are the three kārakas and the lords of the 2nd and the 11th.
{
  const finance = buildFinance(REFERENCE_CHART);
  const { bav, sav } = buildAshtakavarga(REFERENCE_CHART);
  assert.deepEqual(finance.houses, sav.houses);
  assert.equal(finance.wealthSum + finance.lossSum + finance.houses[2] + finance.houses[4] + finance.houses[6], 337);
  // Cancer rises: the 2nd is Leo (the Sun), the 11th Taurus (Venus, a kāraka too).
  assert.deepEqual(finance.grahas.map(item => [item.planet, item.roles.join('+')]), [['Jupiter', 'karaka'], ['Venus', 'karaka+lord11'], ['Mars', 'karaka'], ['Sun', 'lord2']]);
  for (const graha of finance.grahas) {
    assert.equal(graha.bindus, bav.find(row => row.planet === graha.planet)!.houses[graha.house - 1]);
  }
  const of = (name: string) => finance.grahas.find(item => item.planet === name)!;
  // Venus in Libra, the 4th, in its own sign; Jupiter in Aries, the 10th; Mars 16° from the Sun is combust.
  assert.deepEqual([of('Venus').sign, of('Venus').house, of('Venus').dignity], [7, 4, 'own']);
  assert.deepEqual([of('Jupiter').sign, of('Jupiter').house, of('Jupiter').dignity], [1, 10, null]);
  assert.equal(of('Mars').combust, true);
  assert.equal(of('Sun').combust, false);
}

console.log('Ashtakavarga finance tests passed');
