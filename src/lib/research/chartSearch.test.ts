import assert from 'node:assert/strict';
import { meets, pointFacts, searchCharts, type Criterion, type SearchItem } from './chartSearch';

const planet = (name: string, longitude: number, isRetrograde = false) => ({ name, longitude, sign: Math.floor(longitude / 30) + 1, degree: longitude % 30, house: 0, isRetrograde });
// Lagna Cancer 10° (sign 4); the Sun in Leo (the 2nd house), the Moon in Cancer with the Lagna (1st), Saturn retrograde in Aquarius (8th) at 310°.
const chartA = {
  ascendant: { sign: 4, degree: 10, longitude: 100 },
  planets: [planet('Sun', 130), planet('Moon', 105), planet('Saturn', 310, true), planet('Mars', 100.5)],
};
// Lagna Aries; the Moon in Pisces (12th), the Sun in Aries (1st).
const chartB = {
  ascendant: { sign: 1, degree: 5, longitude: 5 },
  planets: [planet('Sun', 20), planet('Moon', 350), planet('Saturn', 200), planet('Mars', 25)],
};

assert.deepEqual(pointFacts(chartA, 'Sun'), { longitude: 130, sign: 5, house: 2, nakshatra: 10, retrograde: false });
assert.equal(pointFacts(chartA, 'Lagna')!.house, 1);
assert.equal(pointFacts(chartA, 'Venus'), null, 'a point the chart lacks');
// The nakshatra counts from 1: 0° is Ashwini, the last 13°20′ is Revati.
assert.equal(pointFacts(chartB, 'Moon')!.nakshatra, 27, '350° is in Revati (346°40′ to 360°)');
assert.equal(pointFacts(chartB, 'Lagna')!.nakshatra, 1, '5° is in Ashwini');

assert.equal(meets(chartA, { kind: 'sign', point: 'Moon', value: 4 }), true);
assert.equal(meets(chartA, { kind: 'sign', point: 'Moon', value: 5 }), false);
assert.equal(meets(chartA, { kind: 'house', point: 'Saturn', value: 8 }), true);
assert.equal(meets(chartA, { kind: 'nakshatra', point: 'Sun', value: 10 }), true, '130° is in Magha (10)');
assert.equal(meets(chartA, { kind: 'retrograde', point: 'Saturn' }), true);
assert.equal(meets(chartA, { kind: 'retrograde', point: 'Sun' }), false);
assert.equal(meets(chartA, { kind: 'together', point: 'Moon', other: 'Mars' }), true, 'both in Cancer');
assert.equal(meets(chartA, { kind: 'together', point: 'Moon', other: 'Sun' }), false);
assert.equal(meets(chartA, { kind: 'together', point: 'Moon', other: 'Moon' }), false, 'a graha is not together with itself');
assert.equal(meets(chartA, { kind: 'together', point: 'Moon', other: 'Venus' }), false, 'a point the chart lacks is never together');

const items: SearchItem[] = [
  { id: 'a', name: 'Anna', client: 'Family', chart: chartA },
  { id: 'b', name: 'Bertta', client: '', chart: chartB },
];
const moonInCancer: Criterion = { kind: 'sign', point: 'Moon', value: 4 };
const saturnRetro: Criterion = { kind: 'retrograde', point: 'Saturn' };
const sunFirst: Criterion = { kind: 'house', point: 'Sun', value: 1 };
assert.deepEqual(searchCharts(items, [], 'all'), [], 'no condition finds nothing');
assert.deepEqual(searchCharts(items, [moonInCancer, saturnRetro], 'all').map(hit => hit.id), ['a']);
assert.deepEqual(searchCharts(items, [moonInCancer, sunFirst], 'all'), [], 'no chart meets both');
assert.deepEqual(searchCharts(items, [moonInCancer, sunFirst], 'any').map(hit => [hit.id, hit.met]), [['a', [0]], ['b', [1]]]);
// The text looks at the name and the client, whatever the case.
assert.deepEqual(searchCharts(items, [], 'all', 'family').map(hit => hit.id), ['a']);
assert.deepEqual(searchCharts(items, [sunFirst], 'all', 'ber').map(hit => hit.id), ['b']);
assert.deepEqual(searchCharts(items, [moonInCancer], 'all', 'ber'), []);

console.log('chart search tests passed');
