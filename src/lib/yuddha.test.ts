import assert from 'node:assert/strict';
import { DISC_DIAMETER, findPlanetaryWars, resolveWars, yuddhaBalaOf, YUDDHA_RULES, type WarBody } from './yuddha';

const body = (name: string, longitude: number, latitude?: number, magnitude?: number, diameter?: number): WarBody => ({ name, longitude, latitude, magnitude, diameter });

assert.deepEqual([...YUDDHA_RULES], ['off', 'verse', 'sripati'], 'the winner by longitude (Raman) is not among the rules: no Sanskrit text has it');

// Who is at war (Sūrya Siddhānta 7.19: less than a degree apart): the five grahas, and only those. The Sun and the Moon never fight.
const wars = findPlanetaryWars([body('Mars', 100), body('Mercury', 100.5), body('Jupiter', 102), body('Sun', 100.2), body('Moon', 100.1)]);
assert.deepEqual(wars.map(war => [war.a, war.b]), [['Mars', 'Mercury']], 'only Mars and Mercury are within a degree; the lights are left out');
assert.ok(Math.abs(wars[0].distance - 0.5) < 1e-9);
assert.equal(findPlanetaryWars([body('Mars', 100), body('Venus', 101)]).length, 0, 'exactly a degree is not a war');
assert.equal(findPlanetaryWars([body('Mars', 100), body('Venus', 100.999)]).length, 1);
assert.equal(findPlanetaryWars([body('Saturn', 359.8), body('Venus', 0.3)]).length, 1, 'the distance goes round the circle');
assert.equal(findPlanetaryWars([body('Mars', 10), body('Mercury', 10.1), body('Venus', 10.2)]).length, 3, 'three in one place make three pairs');
assert.equal(findPlanetaryWars([body('Mars', 10)]).length, 0, 'a graha the chart lacks takes no part');

const totals = { Mars: 500, Mercury: 420, Jupiter: 450, Venus: 480, Saturn: 400 };

// The victor (Sūrya Siddhānta 7.21, Bṛhat Saṃhitā 17.9–10): the graha farther north, if the one in the south is not both larger and brighter.
// Mars (latitude 1.2, magnitude 1.5, disc 8″) is north of Mercury (−0.4°, magnitude 0.5, disc 6″): Mercury is brighter but not larger, so Mars wins.
let results = resolveWars([body('Mars', 100, 1.2, 1.5, 8), body('Mercury', 100.5, -0.4, 0.5, 6)], totals, 'verse');
assert.deepEqual([results[0].winner, results[0].loser, results[0].basis, results[0].amount], ['Mars', 'Mercury', 'north', 80]);
assert.deepEqual(yuddhaBalaOf(results), { Mars: 80, Mercury: -80 }, 'the difference as BPHS 27.20 has it: gained by the victor, lost by the vanquished');
// Larger but not brighter: the northern one still wins.
results = resolveWars([body('Mars', 100, 1.2, 0.5, 8), body('Mercury', 100.5, -0.4, 1.5, 12)], totals, 'verse');
assert.deepEqual([results[0].winner, results[0].basis], ['Mars', 'north']);
// Larger and brighter in the south: it wins there as well ("dakṣiṇa-dik-stho 'pi jaya-yuktaḥ").
results = resolveWars([body('Mars', 100, 1.2, 1.5, 8), body('Venus', 100.5, -0.4, -4, 40)], totals, 'verse');
assert.deepEqual([results[0].winner, results[0].loser, results[0].basis], ['Venus', 'Mars', 'south-larger-brighter']);
assert.deepEqual(yuddhaBalaOf(results), { Venus: 20, Mars: -20 }, 'the difference of 480 and 500 goes to Venus, the weaker, because she won');
// The order of the two does not matter (Mars is listed first because the grahas go in a fixed order).
results = resolveWars([body('Venus', 100.5, 2, -4, 40), body('Mars', 100, 1, 1.5, 8)], totals, 'verse');
assert.equal(results[0].winner, 'Venus', 'Venus in the north wins');
// Equal brightness or size in the south is not "larger and brighter".
results = resolveWars([body('Mars', 100, 1.2, 1.5, 8), body('Mercury', 100.5, -0.4, 1.5, 12)], totals, 'verse');
assert.equal(results[0].winner, 'Mars');
// Without the magnitude and the diameter (a chart saved before they were kept) the graha farther north wins, and the result says so.
results = resolveWars([body('Mars', 100, 1.2), body('Mercury', 100.5, -0.4)], totals, 'verse');
assert.deepEqual([results[0].winner, results[0].basis], ['Mars', 'north-no-brightness']);

// Śrīpati: the difference over the difference of the discs of the Sūrya Siddhānta (9.4″ − 6.6″), the victor by the same rule.
results = resolveWars([body('Mars', 100, 1.2, 1.5, 8), body('Mercury', 100.5, -0.4, 0.5, 6)], totals, 'sripati');
assert.ok(Math.abs(results[0].amount - 80 / (DISC_DIAMETER.Mars - DISC_DIAMETER.Mercury)) < 1e-9);
assert.equal(results[0].winner, 'Mars');

// Nothing is passed when it cannot be told: no latitude, the same latitude, or a rule that is off.
assert.equal(resolveWars([body('Mars', 100), body('Mercury', 100.5)], totals, 'verse')[0].winner, null, 'no latitude, no victor');
assert.equal(resolveWars([body('Mars', 100, 1), body('Mercury', 100.5, 1)], totals, 'verse')[0].winner, null);
assert.deepEqual(resolveWars([body('Mars', 100, 1.2), body('Mercury', 100.5, -0.4)], totals, 'off'), []);
assert.deepEqual(yuddhaBalaOf(resolveWars([body('Mars', 100), body('Mercury', 100.5)], totals, 'verse')), {});
// Whatever is gained is lost: the wars do not change the sum of the strengths.
const three = resolveWars([body('Mars', 10, 1), body('Mercury', 10.1, 2), body('Venus', 10.2, 3)], totals, 'verse');
assert.equal(three.length, 3);
assert.ok(Math.abs(Object.values(yuddhaBalaOf(three)).reduce((sum, value) => sum + (value ?? 0), 0)) < 1e-9);

console.log('Yuddha tests passed');
