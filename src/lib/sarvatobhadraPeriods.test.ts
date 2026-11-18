import assert from 'node:assert/strict';
import { grahaStretches, impactWindows, janmaNakshatra, LATTA_ON_JANMA_WEIGHT, POINT_WEIGHT } from './sarvatobhadraPeriods';
import { sbcCellOf, sbcVedha, type SbcPoint } from './sarvatobhadra';
import { lattaNakshatra } from './phaladipikaGochara';

const DAY = 86_400_000;
const start = Date.UTC(2026, 0, 1);

// A graha that crosses Ashwini, Bharani and Krittika in 30 days (13°20' a nakshatra): one sample a day, 1° a day.
const series = { start, step: DAY, longitudes: Array.from({ length: 40 }, (_, day) => day) };
const lines = sbcVedha(sbcCellOf(1))!;
// A point of the birth at the end of the lines of Ashwini: the square Ashwini pierces across.
const target = lines[0].target;
const points: SbcPoint[] = [{ id: 'janma', position: target }];

// --- Stretches: one for each nakshatra the graha stands in, split half way between two samples ------------------------------------------
const mars = grahaStretches('Mars', series, points, null);
assert.ok(mars.length >= 1);
const ashwini = mars.find(item => item.nakshatra === 'Ashwini')!;
assert.ok(ashwini, 'the lines of Ashwini reach the point');
assert.equal(ashwini.start, start, 'the first stretch starts with the series');
assert.equal(ashwini.hits[0].point.id, 'janma');
assert.equal(ashwini.score, -POINT_WEIGHT.janma, 'a malefic that reaches the birth nakshatra is against');
const jupiter = grahaStretches('Jupiter', series, points, null).find(item => item.nakshatra === 'Ashwini')!;
assert.equal(jupiter.score, POINT_WEIGHT.janma, 'a benefic for');
// Ashwini is 13°20' long: day 0 to day 13 are in it (samples at 0° to 13°), the next sample (14°) is not, so the edge is half way: 13.5 days.
assert.equal(ashwini.end, start + 13.5 * DAY);

// --- The lattā on the birth nakshatra counts against, whoever has it ---------------------------------------------------------------------
const kicked = lattaNakshatra('Sun', 1)!;   // the nakshatra the Sun kicks from Ashwini
const sun = grahaStretches('Sun', series, [], kicked).find(item => item.nakshatra === 'Ashwini')!;
assert.ok(sun, 'a stretch with no points reached is kept for the lattā on the birth nakshatra');
assert.equal(sun.latta!.onJanma, true);
assert.equal(sun.score, -LATTA_ON_JANMA_WEIGHT);
assert.equal(grahaStretches('Sun', series, [], 5).length, 0, 'nothing reached, no lattā on the birth: nothing to tell');
assert.equal(grahaStretches('Ketu', series, [{ id: 'janma', position: target }], null)[0].latta, null, 'Ketu has no lattā');

// --- Windows: good and difficult days run together --------------------------------------------------------------------------------------
const windows = impactWindows([ashwini, jupiter], start, 30);
assert.equal(windows.length, 0, 'a good and a bad stretch of equal weight at once cancel: no window');
const only = impactWindows([ashwini], start, 30);
assert.equal(only.length, 1);
assert.equal(only[0].quality, 'difficult');
assert.equal(only[0].from, start);
assert.equal(only[0].to, start + 13 * DAY, 'the days 0 to 12 have their middle inside the stretch (day 13 ends it at 13.5)');
assert.equal(only[0].peak, -POINT_WEIGHT.janma);
assert.deepEqual(only[0].causes, [ashwini]);
const mixed = impactWindows([ashwini, { ...jupiter, start: start + 20 * DAY, end: start + 25 * DAY }], start, 30);
assert.deepEqual(mixed.map(item => item.quality), ['difficult', 'good']);

assert.equal(janmaNakshatra(0), 0);
assert.equal(janmaNakshatra(359.9), 26);
assert.equal(janmaNakshatra(10, 5), 1, 'the zodiac offset of the chart moves it');
