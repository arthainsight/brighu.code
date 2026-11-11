// True signs (trueSigns.ts): the Venus of the lesson's chart, with the weights found from it.
import assert from 'node:assert/strict';
import { TRUE_SIGN_BODY_WEIGHTS, TRUE_SIGN_TOTAL, TRUE_SIGN_WEIGHTS, trueSignPlacement, trueSigns } from './trueSigns';

assert.equal(TRUE_SIGN_TOTAL, 13);
assert.equal(TRUE_SIGN_WEIGHTS[9] / TRUE_SIGN_WEIGHTS[1], 0.75, 'D9 is three quarters of the D1');

// Venus at 19°54′ Virgo (169.9°): Virgo 4, Gemini 3, Cancer 2, Aries 2, Scorpio 1, Libra 1 of 13: 30.8, 23.1, 15.4, 15.4, 7.7, 7.7 %.
{
  const venus = trueSignPlacement({ name: 'Venus', longitude: 169.9 });
  assert.deepEqual(venus.signs, { 1: 6, 9: 3, 7: 4, 12: 1, 10: 8, 16: 7 });
  const percent = venus.share.map(value => Math.round(value * 1000) / 10);
  assert.deepEqual(percent, [15.4, 0, 23.1, 15.4, 0, 30.8, 7.7, 7.7, 0, 0, 0, 0]);
  assert.ok(Math.abs(venus.share.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
}

// The overall share is the weighted mean of the bodies' shares and sums to 1; a body alone gives its own.
{
  const alone = trueSigns([{ name: 'Venus', longitude: 169.9 }]);
  assert.deepEqual(alone.overall, alone.placements[0].share);
  const two = trueSigns([{ name: 'Venus', longitude: 169.9 }, { name: 'Sun', longitude: 10 }]);
  assert.ok(Math.abs(two.overall.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  // The Venus (0.5) and the Sun (0.6): each sign is (0.5 · Venus + 0.6 · Sun) / 1.1.
  two.overall.forEach((value, sign) => assert.ok(Math.abs(value - (0.5 * two.placements[0].share[sign] + 0.6 * two.placements[1].share[sign]) / 1.1) < 1e-12));
  assert.equal(trueSigns([]).overall.every(value => value === 0), true);
}

// The overall balances of two charts shown in the videos (tropical longitudes, the true node), to the tenth of a per cent the figures of the report.
// Donald Trump, 14.6.1946 10:54 EDT, Jamaica, New York; Jim Morrison, 8.12.1943 11:55 EWT, Melbourne, Florida. Aries … Pisces.
{
  assert.deepEqual(TRUE_SIGN_BODY_WEIGHTS, { Lagna: 1, Moon: 0.75, Sun: 0.6, Mars: 0.5, Mercury: 0.5, Jupiter: 0.5, Venus: 0.5, Saturn: 0.5, Rahu: 0.5, Ketu: 0.5 });
  const charts: { name: string; longitudes: Record<string, number>; percent: number[] }[] = [
    {
      name: 'Trump',
      longitudes: { Lagna: 149.9717, Sun: 82.9284, Moon: 261.2038, Mars: 146.7759, Mercury: 98.859, Jupiter: 197.4521, Venus: 115.7381, Saturn: 113.8156, Rahu: 80.8037, Ketu: 260.8037 },
      percent: [11.6, 3.9, 9.1, 12.8, 11.8, 2.0, 11.5, 5.9, 13.9, 1.4, 10.5, 5.5],
    },
    {
      name: 'Morrison',
      longitudes: { Lagna: 312.852, Sun: 255.6926, Moon: 39.2199, Mars: 71.6616, Mercury: 270.8835, Jupiter: 147.0161, Venus: 210.3825, Saturn: 83.7456, Rahu: 128.2093, Ketu: 308.2093 },
      percent: [4.9, 10.0, 12.1, 6.6, 12.4, 2.6, 2.6, 6.6, 10.1, 14.5, 10.5, 7.2],
    },
  ];
  for (const chart of charts) {
    const overall = trueSigns(Object.entries(chart.longitudes).map(([name, longitude]) => ({ name, longitude }))).overall.map(value => value * 100);
    overall.forEach((value, sign) => assert.ok(Math.abs(value - chart.percent[sign]) < 0.11, `${chart.name} sign ${sign + 1}: ${value.toFixed(2)} against ${chart.percent[sign]}`));
  }
}
