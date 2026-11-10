// True signs (trueSigns.ts): the Venus of the lesson's chart, with the weights found from it.
import assert from 'node:assert/strict';
import { TRUE_SIGN_TOTAL, TRUE_SIGN_WEIGHTS, trueSignPlacement, trueSigns } from './trueSigns';

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

// The overall share is the mean of the grahas' shares and sums to 1; a graha alone gives its own.
{
  const alone = trueSigns([{ name: 'Venus', longitude: 169.9 }]);
  assert.deepEqual(alone.overall, alone.placements[0].share);
  const two = trueSigns([{ name: 'Venus', longitude: 169.9 }, { name: 'Sun', longitude: 10 }]);
  assert.ok(Math.abs(two.overall.reduce((sum, value) => sum + value, 0) - 1) < 1e-12);
  assert.equal(trueSigns([]).overall.every(value => value === 0), true);
}
