import assert from 'node:assert/strict';
import { DISC_DIAMETER, findPlanetaryWars, resolveWars, yuddhaBalaOf, type WarBody } from './yuddha';

const body = (name: string, longitude: number, latitude?: number): WarBody => ({ name, longitude, latitude });

// Who is at war: the five grahas closer than a degree, and only those. The Sun and the Moon never fight.
const wars = findPlanetaryWars([body('Mars', 100), body('Mercury', 100.5), body('Jupiter', 102), body('Sun', 100.2), body('Moon', 100.1)]);
assert.deepEqual(wars.map(war => [war.a, war.b]), [['Mars', 'Mercury']], 'only Mars and Mercury are within a degree; the lights are left out');
assert.ok(Math.abs(wars[0].distance - 0.5) < 1e-9);
assert.equal(findPlanetaryWars([body('Mars', 100), body('Venus', 101)]).length, 0, 'exactly a degree is not a war');
assert.equal(findPlanetaryWars([body('Mars', 100), body('Venus', 100.999)]).length, 1);
// Across 0° Aries.
assert.equal(findPlanetaryWars([body('Saturn', 359.8), body('Venus', 0.3)]).length, 1, 'the distance goes round the circle');
// Three in one place make three pairs.
assert.equal(findPlanetaryWars([body('Mars', 10), body('Mercury', 10.1), body('Venus', 10.2)]).length, 3);
// A graha the chart lacks takes no part.
assert.equal(findPlanetaryWars([body('Mars', 10)]).length, 0);

const mars = body('Mars', 100, 1.2);
const mercury = body('Mercury', 100.5, -0.4);
const totals = { Mars: 500, Mercury: 420 };

// The verse: the difference as it is, the victor the more northerly (Mars, latitude 1.2 against −0.4).
let results = resolveWars([mars, mercury], totals, 'verse');
assert.equal(results.length, 1);
assert.deepEqual([results[0].winner, results[0].loser, results[0].amount], ['Mars', 'Mercury', 80]);
assert.deepEqual(yuddhaBalaOf(results), { Mars: 80, Mercury: -80 });
// The weaker graha can win: then it gains the difference all the same (the verse says the difference, not who is stronger).
results = resolveWars([body('Mars', 100, -1), body('Mercury', 100.5, 2)], totals, 'verse');
assert.deepEqual(yuddhaBalaOf(results), { Mercury: 80, Mars: -80 });
// Śrīpati: the difference over the difference of the discs (9.4 − 6.6 = 2.8).
results = resolveWars([mars, mercury], totals, 'sripati');
assert.ok(Math.abs(results[0].amount - 80 / (DISC_DIAMETER.Mars - DISC_DIAMETER.Mercury)) < 1e-9);
assert.equal(results[0].winner, 'Mars');
// Raman: the victor has the smaller longitude, whatever the latitude (Mars 100° against Mercury 100.5°).
results = resolveWars([body('Mars', 100, -3), body('Mercury', 100.5, 3)], totals, 'raman');
assert.equal(results[0].winner, 'Mars');
assert.ok(Math.abs(results[0].amount - 80 / 2.8) < 1e-9);
// ... also across 0° Aries: 359.8° is "before" 0.3°.
results = resolveWars([body('Saturn', 359.8), body('Venus', 0.3)], { Saturn: 300, Venus: 330 }, 'raman');
assert.equal(results[0].winner, 'Saturn');

// Nothing is passed when it cannot be told: no latitude, the same latitude, or a rule that is off.
assert.equal(resolveWars([body('Mars', 100), body('Mercury', 100.5)], totals, 'verse')[0].winner, null, 'no latitude, no victor by latitude');
assert.equal(resolveWars([body('Mars', 100, 1), body('Mercury', 100.5, 1)], totals, 'verse')[0].winner, null);
assert.deepEqual(resolveWars([mars, mercury], totals, 'off'), []);
assert.deepEqual(yuddhaBalaOf(resolveWars([body('Mars', 100), body('Mercury', 100.5)], totals, 'verse')), {});
// Whatever is gained is lost: the wars do not change the sum of the strengths.
const three = resolveWars([body('Mars', 10, 1), body('Mercury', 10.1, 2), body('Venus', 10.2, 3)], { Mars: 500, Mercury: 420, Venus: 480 }, 'verse');
assert.equal(three.length, 3);
const bala = yuddhaBalaOf(three);
assert.ok(Math.abs(Object.values(bala).reduce((sum, value) => sum + (value ?? 0), 0)) < 1e-9);

console.log('Yuddha tests passed');
