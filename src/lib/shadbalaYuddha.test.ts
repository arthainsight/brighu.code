import assert from 'node:assert/strict';
import { buildShadbalaRows, shadbalaWars, type ShadbalaChartLike } from './shadbala';
import { DEFAULT_BALA_OPTIONS, readBalaOptions } from './balaOptions';
import { REFERENCE_CHART } from './shadbala.fixture';

// Yuddha Bala in the Ṣaḍbala: Mercury of the reference chart is put half a degree from Mars, so that the two are at war.
const near = (name: string, longitude: number, latitude?: number) => ({ longitude, sign: Math.floor(longitude / 30) + 1, degree: longitude % 30, ...(latitude === undefined ? {} : { data: { eclipticLatitude: latitude } }), name });
const mars = REFERENCE_CHART.planets!.find(planet => planet.name === 'Mars')!;
const marsLongitude = mars.longitude!;
const warChart = (marsLatitude?: number, mercuryLatitude?: number): ShadbalaChartLike => ({
  ...REFERENCE_CHART,
  planets: REFERENCE_CHART.planets!.map(planet => {
    if (planet.name === 'Mars') return { ...planet, data: marsLatitude === undefined ? undefined : { eclipticLatitude: marsLatitude } };
    if (planet.name === 'Mercury') return { ...planet, ...near('Mercury', marsLongitude + 0.5, mercuryLatitude) };
    return planet;
  }),
});

const by = (rows: ReturnType<typeof buildShadbalaRows>, planet: string) => rows.find(row => row.planet === planet)!;

// The choice is off by default: no row has a Yuddha Bala, and a graha in war is not touched.
assert.equal(DEFAULT_BALA_OPTIONS.yuddha, 'off');
const chart = warChart(1.2, -0.4);
const off = buildShadbalaRows(chart);
assert.equal(by(off, 'Mars').kalaBreakdown.yuddha, undefined, 'nothing is added while the choice is off');
assert.deepEqual(shadbalaWars(chart, off), []);

// 'verse': the more northerly graha (Mars, latitude 1.2) gains the difference of the two totals, Mercury loses it.
const verse = buildShadbalaRows(chart, { ...DEFAULT_BALA_OPTIONS, yuddha: 'verse' });
const difference = Math.abs(by(off, 'Mars').totalVirupa - by(off, 'Mercury').totalVirupa);
assert.ok(difference > 0);
assert.ok(Math.abs(by(verse, 'Mars').kalaBreakdown.yuddha! - difference) < 1e-9);
assert.ok(Math.abs(by(verse, 'Mercury').kalaBreakdown.yuddha! + difference) < 1e-9);
assert.ok(Math.abs(by(verse, 'Mars').totalVirupa - (by(off, 'Mars').totalVirupa + difference)) < 1e-9, 'the total follows');
assert.ok(Math.abs(by(verse, 'Mars').kalaBreakdown.total - (by(off, 'Mars').kalaBreakdown.total + difference)) < 1e-9, 'it is a part of Kāla Bala');
assert.ok(Math.abs(by(verse, 'Mars').ratio - by(verse, 'Mars').totalVirupa / by(verse, 'Mars').requiredVirupa) < 1e-12);
// The grahas that are not at war are not touched, and what one gains the other loses.
for (const planet of ['Sun', 'Moon', 'Jupiter', 'Venus', 'Saturn']) assert.equal(by(verse, planet).totalVirupa, by(off, planet).totalVirupa, `${planet} is not in the war`);
assert.ok(Math.abs(verse.reduce((sum, row) => sum + row.totalVirupa, 0) - off.reduce((sum, row) => sum + row.totalVirupa, 0)) < 1e-9, 'the sum of the totals does not change');

// Mercury farther north: the roles are swapped.
const swapped = buildShadbalaRows(warChart(-1, 2), { ...DEFAULT_BALA_OPTIONS, yuddha: 'verse' });
assert.ok(by(swapped, 'Mercury').kalaBreakdown.yuddha! > 0 && by(swapped, 'Mars').kalaBreakdown.yuddha! < 0);

// Without latitudes (a chart saved before v4.24) the victor by latitude cannot be told and nothing is passed.
const withoutLatitude = buildShadbalaRows(warChart(), { ...DEFAULT_BALA_OPTIONS, yuddha: 'verse' });
assert.equal(by(withoutLatitude, 'Mars').kalaBreakdown.yuddha, 0);
assert.equal(by(withoutLatitude, 'Mars').totalVirupa, by(buildShadbalaRows(warChart()), 'Mars').totalVirupa);

// Raman wins by the smaller longitude: Mars (marsLongitude) over Mercury (+0.5°), whatever the latitudes; the amount over the discs (2.8).
const raman = buildShadbalaRows(warChart(-5, 5), { ...DEFAULT_BALA_OPTIONS, yuddha: 'raman' });
const offRaman = buildShadbalaRows(warChart(-5, 5));
const ramanDifference = Math.abs(by(offRaman, 'Mars').totalVirupa - by(offRaman, 'Mercury').totalVirupa);
assert.ok(Math.abs(by(raman, 'Mars').kalaBreakdown.yuddha! - ramanDifference / 2.8) < 1e-9);
assert.ok(by(raman, 'Mercury').kalaBreakdown.yuddha! < 0);

// The stored choice is read, and an unknown one falls back on off.
assert.equal(readBalaOptions({ yuddha: 'raman' }).yuddha, 'raman');
assert.equal(readBalaOptions({ yuddha: 'nonsense' }).yuddha, 'off');

console.log('Shadbala Yuddha tests passed');
