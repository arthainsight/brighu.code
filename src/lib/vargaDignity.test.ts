// Dignity in a divisional chart (vargaDignity.ts): the levels, the recursion through the hosts, the dominance and the signs.
import assert from 'node:assert/strict';
import { DIGNITY_SCORE, HOST_WEIGHT, vargaDignity } from './vargaDignity';

// In the Rāśi (division 1) the longitudes are the signs: 15° into a sign (sign index × 30 + 15).
const at = (sign: number) => sign * 30 + 15;
const chart = (signs: Record<string, number>, lagna = 0) => vargaDignity(Object.entries(signs).map(([name, sign]) => ({ name, longitude: at(sign) })), at(lagna), 1)!;
const SPREAD = { Sun: 4, Moon: 3, Mars: 0, Mercury: 2, Jupiter: 8, Venus: 6, Saturn: 9 }; // all in own signs

// Own signs: the score 6 and no host but itself; the Sun in Aries is exalted (7), Saturn in Aries is fallen (0).
{
  const all = chart(SPREAD);
  assert.ok(all.grahas.every(item => item.level === 'own' && item.host === item.name && item.effective === DIGNITY_SCORE.own));
  assert.equal(all.average, 6);
  const mixed = chart({ ...SPREAD, Sun: 0, Saturn: 0 });
  assert.equal(mixed.grahas.find(item => item.name === 'Sun')?.level, 'exalted');
  assert.equal(mixed.grahas.find(item => item.name === 'Saturn')?.level, 'debilitated');
  assert.equal(mixed.grahas.find(item => item.name === 'Saturn')?.score, 0);
}

// The recursion: a graha in the sign of a host takes part of the host's dignity. Venus in Cancer (the Moon's sign; Venus and the Moon are enemies) with the Moon in
// its own sign (6): Venus's own score 2 (or 1) is raised by the host; with the host in the fall it is pulled down.
{
  const rich = chart({ ...SPREAD, Venus: 3 });
  const venus = rich.grahas.find(item => item.name === 'Venus')!;
  assert.equal(venus.host, 'Moon');
  assert.ok(venus.effective > venus.score && Math.abs(venus.effective - ((1 - HOST_WEIGHT) * venus.score + HOST_WEIGHT * 6)) < 1e-9);
  const poor = chart({ ...SPREAD, Venus: 3, Moon: 7 }); // the Moon in Scorpio: fallen
  const poorVenus = poor.grahas.find(item => item.name === 'Venus')!;
  assert.ok(poorVenus.effective < venus.effective);
}

// Mars in Leo (the Sun's sign) with the Sun in Aries (Mars's sign): a mutual reception; the recursion settles.
{
  const swap = chart({ ...SPREAD, Sun: 0, Mars: 4 });
  const sun = swap.grahas.find(item => item.name === 'Sun')!;
  const mars = swap.grahas.find(item => item.name === 'Mars')!;
  assert.equal(sun.host, 'Mars');
  assert.equal(mars.host, 'Sun');
  assert.equal(swap.chains.Mars.join('>'), 'Mars>Sun');
  assert.ok(Number.isFinite(mars.effective) && mars.effective > 0);
}

// The dominance: the grahas and the Lagna in the tree under a graha, itself counted. All in their own signs, with the Lagna in Cancer: each stands alone
// (1) and the Moon, the Lagna's lord, has 2.
{
  const all = chart(SPREAD, 3);
  assert.equal(all.grahas[0].name, 'Moon');
  assert.equal(all.grahas[0].dominance, 2);
  assert.ok(all.grahas.slice(1).every(item => item.dominance === 1));
  // Everything in the Sun's chain: all the grahas in Leo, and the Lagna in Leo, give the Sun 8.
  const leo = chart({ Sun: 4, Moon: 4, Mars: 4, Mercury: 4, Jupiter: 4, Venus: 4, Saturn: 4 }, 4);
  assert.equal(leo.grahas[0].name, 'Sun');
  assert.equal(leo.grahas[0].dominance, 8);
}

// The signs: high dominance with a low dignity ∇, low dominance with a good one Δ; the flag where a benefic and a malefic stand next to each other.
{
  // Saturn in Aries (fallen, host Mars), everything else in its own sign, the Lagna in Capricorn: Mars has Saturn and the Lagna under it (3), Saturn the Lagna (2).
  const result = chart({ ...SPREAD, Saturn: 0 }, 9);
  assert.deepEqual(result.grahas.slice(0, 2).map(item => [item.name, item.dominance]), [['Mars', 3], ['Saturn', 2]]);
  assert.equal(result.grahas[0].symbol, null);
  assert.equal(result.grahas[1].symbol, 'inverted');
  assert.equal(result.grahas.at(-1)?.symbol, 'upright');
  assert.ok(result.flags.every(index => index >= 0 && index < result.grahas.length - 1));
}

// Division 9: Aries 6° is in the Taurus navāṁśa, as the lesson says (the longitude 6° has the navāṁśa sign Taurus).
{
  const result = vargaDignity(Object.entries({ Sun: 6, Moon: 6, Mars: 6, Mercury: 6, Jupiter: 6, Venus: 6, Saturn: 6 }).map(([name, longitude]) => ({ name, longitude })), 6, 9)!;
  assert.ok(result.grahas.every(item => item.sign === 1));
}

// A missing graha cannot be judged.
assert.equal(vargaDignity([{ name: 'Sun', longitude: 0 }], 0, 9), null);
