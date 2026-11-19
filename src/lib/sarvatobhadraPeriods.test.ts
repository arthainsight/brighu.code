import assert from 'node:assert/strict';
import { grahaStretches, impactWindows, janmaNakshatra, LATTA_ON_JANMA_WEIGHT, POINT_WEIGHT } from './sarvatobhadraPeriods';
import { SBC_SPECIAL_NAKSHATRAS, sbcCellOf, sbcVedha, specialNakshatraName, specialsOf, type SbcPoint } from './sarvatobhadra';
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

// --- The special nakshatras from the Moon's: Janma 1, Naidhana 7, Karma 10, Sanghatika 16, Samudayika 18, Adhana 19, Vainasika 23, Manasa 25, and the king's
// Jati 26, Desa 27 and Abhiseka 28, which are counted in the 28 nakshatras with Abhijit ------------------------------------------------------------------
const item = (name: string) => SBC_SPECIAL_NAKSHATRAS.find(entry => entry.name === name)!;
assert.deepEqual(SBC_SPECIAL_NAKSHATRAS.map(entry => `${entry.name} ${entry.count}`), ['Janma 1', 'Naidhana 7', 'Karma 10', 'Saṅghātika 16', 'Sāmudāyika 18', 'Ādhāna 19', 'Vaināśika 23', 'Mānasa 25', 'Jāti 26', 'Deśa 27', 'Abhiṣeka 28']);
assert.deepEqual(specialsOf(11, 11), ['Janma']);
assert.equal(specialNakshatraName(11, item('Karma')), 'Uttara Ashadha', 'the 10th counting the own as 1: 11 + 9 = 20');
assert.equal(specialNakshatraName(0, item('Naidhana')), 'Punarvasu', 'the 7th from Ashwini');
assert.equal(specialNakshatraName(0, item('Vaināśika')), 'Dhanishtha', 'the 23rd from Ashwini');
// The 28 count: Abhiseka is the nakshatra just before the Janma, Abhijit counted between Uttara Ashadha and Shravana.
assert.equal(specialNakshatraName(0, item('Abhiṣeka')), 'Revati');
assert.equal(specialNakshatraName(25, item('Abhiṣeka')), 'Purva Bhadrapada', 'from Uttara Bhadrapada, the one before it');
assert.equal(specialNakshatraName(21, item('Abhiṣeka')), 'Abhijit', 'from Shravana the one before is Abhijit');
assert.equal(specialNakshatraName(23, item('Jāti')), 'Abhijit', 'the 26th of the 28 from Shatabhisha');
// Manasa 25 and Jati 26 are the same nakshatra, three before the Janma.
assert.deepEqual(specialsOf(0, 24), ['Mānasa', 'Jāti']);
assert.deepEqual(specialsOf(0, 1), [], 'the 2nd is none');

// A kick on the Karma or the Abhisheka of the birth counts against too, with its own weight.
// The Sun in Ashwini kicks the 12th on, nakshatra 11; for a Moon in nakshatra 2 that is the 10th: the Karma.
const karmaSun = grahaStretches('Sun', series, [], 2).find(item => item.nakshatra === 'Ashwini')!;
assert.equal(karmaSun.latta!.key, 'Karma');
assert.equal(karmaSun.latta!.onJanma, false);
assert.equal(karmaSun.score, -2);

// --- With the pada chosen only the pada of the birth Moon's number is struck ----------------------------------------------------------------------
// The Sun in Ashwini (0°–13°20′, 1° a day) kicks nakshatra 11; the birth Moon is in nakshatra 11, in its 2nd pada (3°20′–6°40′): the kick bites the Janma only
// while the Sun is in the 2nd pada of Ashwini.
const whole = grahaStretches('Sun', series, [], 11, 0, 'nakshatra', 2).filter(item => item.nakshatra === 'Ashwini');
assert.equal(whole.length, 1);
assert.equal(whole[0].start, start);
assert.equal(whole[0].latta!.onJanma, true, 'the whole nakshatra: from the first day');
const padaOnly = grahaStretches('Sun', series, [], 11, 0, 'pada', 2).filter(item => item.nakshatra === 'Ashwini');
assert.equal(padaOnly.length, 1, 'the other padas are left out');
assert.equal(padaOnly[0].latta!.onJanma, true);
assert.equal(padaOnly[0].score, -LATTA_ON_JANMA_WEIGHT);
assert.equal(padaOnly[0].start, start + 3.5 * DAY, 'from half way between the samples at 3° and 4°');
assert.equal(padaOnly[0].end, start + 6.5 * DAY, 'to half way between 6° and 7°');

assert.equal(janmaNakshatra(0), 0);
assert.equal(janmaNakshatra(359.9), 26);
assert.equal(janmaNakshatra(10, 5), 1, 'the zodiac offset of the chart moves it');
