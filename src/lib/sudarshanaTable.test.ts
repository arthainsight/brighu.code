import assert from 'node:assert/strict';
import type { PlanetData } from '@/types';
import { LORD_POINTS, auspiciousness, stateInSign, sudarshanaTable } from './sudarshanaTable';

// The worksheet of the video "Sudarshana Chakra Paddhati" (Revatiraa), for the chart of 3 December 1984, 09:17, Howrah (Lahiri, mean node): the signs of the grahas and the Lagna are those
// of the chart; the expected columns are typed in from the picture of the worksheet. Where the worksheet disagrees with its own letters, the test says so.
const at = (name: string, sign: number): PlanetData => ({ name, sign, degree: 10, longitude: (sign - 1) * 30 + 10 }) as PlanetData;
const chart = {
  ascendant: { sign: 10, longitude: 272.36 },
  planets: [at('Sun', 8), at('Moon', 12), at('Mars', 10), at('Mercury', 9), at('Jupiter', 9), at('Venus', 9), at('Saturn', 7), at('Rahu', 2), at('Ketu', 8)],
} as Parameters<typeof sudarshanaTable>[0];

// --- States -------------------------------------------------------------------------------------------------------------------------
assert.equal(stateInSign('Mars', 10), 'exalted');
assert.equal(stateInSign('Saturn', 7), 'exalted');
assert.equal(stateInSign('Jupiter', 9), 'moolatrikona', 'the whole sign, as BPHS 3 and the worksheet');
assert.equal(stateInSign('Jupiter', 12), 'own');
assert.equal(stateInSign('Sun', 8), 'friendly', 'the Sun in the sign of Mars');
assert.equal(stateInSign('Moon', 12), 'neutral', 'the Moon in the sign of Jupiter');
assert.equal(stateInSign('Mercury', 9), 'neutral');
assert.equal(stateInSign('Venus', 5), 'hostile', 'Venus in the sign of the Sun');
assert.equal(stateInSign('Sun', 7), 'hostile', 'debilitated counts with the enemies');
assert.deepEqual(LORD_POINTS, { exalted: 1, moolatrikona: 0.75, own: 0.5, friendly: 0.25, neutral: 0.125, hostile: 0 });

// --- The strength column: the sum of the points of the three lords, over three -------------------------------------------------------
const table = sudarshanaTable(chart);
assert.equal(table.length, 12);
const expectedPoints = [2.75, 2.75, 1.875, 2.125, 1, 1.375, 0.375, /* the worksheet has 1.25 in the 8th but its letters F,N,N make 0.5 */ 0.5, 1.25, 1.125, 2.125, 1.875];
assert.deepEqual(table.map(row => row.lordPoints), expectedPoints);
assert.deepEqual(table.map(row => row.dispositors.map(item => item.state[0].toUpperCase()).join('')).slice(0, 2), ['EME', 'EEM'], 'exalted, moolatrikona, exalted: the 1st house');
assert.deepEqual(table.map(row => Math.round(row.strength * 100) / 100), [91.67, 91.67, 62.5, 70.83, 33.33, 45.83, 12.5, 16.67, 41.67, 37.5, 70.83, 62.5]);

// --- Placement ---------------------------------------------------------------------------------------------------------------------
const placement = (house: number) => table[house - 1].occupants.map(item => (item.benefic ? 'B' : 'M')).sort().join('');
assert.equal(placement(1), 'BMMM', 'Mars, the Moon, the Sun and Ketu');
assert.equal(placement(2), 'BBB');
assert.equal(placement(3), 'BMM', 'the worksheet has M,M,B');
assert.equal(placement(4), '', 'no graha stands in the 4th: the worksheet has a B there, the Moon a second time');
assert.equal(placement(6), '');
assert.equal(placement(10), 'BBBM');
assert.equal(table.flatMap(row => row.occupants).length, 27, 'nine grahas in three charts');

// --- The Sarvāṣṭakavarga from the Lagna: the 7th is not in the picture ----------------------------------------------------------------
assert.deepEqual(table.map(row => row.sav), [29, 25, 22, 32, 31, 25, 23, 33, 27, 39, 31, 20]);

// --- V-AMSHA: the mean of the graha's good count over six ---------------------------------------------------------------------------
assert.equal(auspiciousness(4), (4 / 6) * 100);
const good = { Sun: 3, Moon: 4, Mars: 5, Mercury: 2, Jupiter: 2, Venus: 3, Saturn: 3, Rahu: 2, Ketu: 3 };
const withGood = sudarshanaTable(chart, good);
const vamsha = withGood.map(row => Math.round((row.vamsha ?? 0) * 100) / 100);
assert.deepEqual(vamsha, [62.5, 38.89, 61.11, 50 /* the worksheet: 66.67 */, 50, 50, 33.33, 50, 50, 41.67, 61.11, 41.67]);
assert.equal(sudarshanaTable(chart, { Sun: 3 })[0].vamsha, null, 'a graha whose count is missing leaves the mean open');
assert.equal(sudarshanaTable(chart)[3].vamsha, 50, 'an empty house is 50');

// --- The aspects (Parāśara's): from the grahas outside the sign ---------------------------------------------------------------------
const sixth = table[5].aspects;
assert.ok(sixth.benefic.includes('Venus') && sixth.malefic.includes('Mars'), 'Gemini: Venus and Mercury opposite from Sagittarius, Mars on its 8th');

console.log('Sudarshana table passed');
