import assert from 'node:assert/strict';
import { ayanaOf, clockMinutes, kalaOf, lunarYearStart, rituOf, SAMVATSARA_NAMES, samvatsaraOf } from './calendar';

// --- The sixty names, and the cycle: Krodhi (38) from Ugadi 2024, Vishvavasu 2025, Parabhava 2026, Shobhakrit 2023 -------------------------------------
assert.equal(SAMVATSARA_NAMES.length, 60);
assert.equal(new Set(SAMVATSARA_NAMES).size, 60);
assert.equal(SAMVATSARA_NAMES[0], 'Prabhava');
assert.equal(SAMVATSARA_NAMES[59], 'Akshaya');
// Chaitra (0) of the year: the month says the date is in the year that begins that spring.
const at = (y: number, m: number, d: number, masa: number | null) => samvatsaraOf(y, m, d, masa);
assert.deepEqual([at(2024, 4, 15, 0).name, at(2024, 4, 15, 0).number, at(2024, 4, 15, 0).shaka], ['Krodhi', 38, 1946]);
assert.equal(at(2025, 4, 10, 0).name, 'Vishvavasu');
assert.equal(at(2026, 4, 10, 0).name, 'Parabhava');
assert.equal(at(2023, 4, 10, 0).name, 'Shobhakrit');
assert.equal(at(1987, 4, 10, 0).name, 'Prabhava', 'the cycle begins again every sixty years: Ugadi 1987 was a Prabhava');
assert.equal(at(2047, 4, 10, 0).name, 'Prabhava');
// January to March belong to the year that began the spring before: Pausha, Magha and Phalguna say so, and Pausha in December is the year of the same calendar year.
assert.equal(at(2026, 1, 20, 10).name, 'Vishvavasu', 'Magha 2026 is still the year of Ugadi 2025');
assert.equal(at(2026, 3, 5, 11).name, 'Vishvavasu', 'Phalguna, early March 2026');
assert.equal(at(2026, 1, 5, 9).name, 'Vishvavasu', 'Pausha in January');
assert.equal(at(2025, 12, 20, 9).name, 'Vishvavasu', 'Pausha in December');
assert.equal(at(2026, 11, 20, 7).name, 'Parabhava', 'Kartika 2026 after Ugadi 2026');
assert.equal(at(2026, 3, 25, 0).name, 'Parabhava', 'Chaitra begins in the last days of March');
// Without the month: before the middle of April counts as the old year.
const rough = samvatsaraOf(2026, 2, 1, null);
assert.equal(rough.approximate, true);
assert.equal(rough.name, 'Vishvavasu');
assert.equal(samvatsaraOf(2026, 8, 1, null).name, 'Parabhava');
assert.equal(lunarYearStart(2026, 8, 1, 4).approximate, false);

// --- The Ayana: the Sun in sidereal Makara to Mithuna, and the sayana one a month earlier -----------------------------------------------------------------
assert.deepEqual(ayanaOf(280), { ayana: 'Uttarayana' });
assert.deepEqual(ayanaOf(10), { ayana: 'Uttarayana' });
assert.deepEqual(ayanaOf(120), { ayana: 'Dakshinayana' });
assert.deepEqual(ayanaOf(250), { ayana: 'Dakshinayana' });
assert.deepEqual(ayanaOf(269.9), { ayana: 'Dakshinayana' });
assert.deepEqual(ayanaOf(270), { ayana: 'Uttarayana' });
assert.deepEqual(ayanaOf(89.9), { ayana: 'Uttarayana' });
assert.deepEqual(ayanaOf(90), { ayana: 'Dakshinayana' });
assert.deepEqual(ayanaOf(255, 279), { ayana: 'Dakshinayana', sayana: 'Uttarayana' }, 'late December: the sayana Uttarayana has begun');
assert.deepEqual(ayanaOf(120, 144), { ayana: 'Dakshinayana' }, 'where both agree only one is given');

// --- The Ritu: two lunar months each, and the solar one by the Sun's sign ------------------------------------------------------------------------------------
assert.equal(rituOf(0, 0).ritu, 'Vasanta');
assert.equal(rituOf(1, 0).ritu, 'Vasanta');
assert.equal(rituOf(2, 0).ritu, 'Grishma');
assert.equal(rituOf(5, 0).ritu, 'Varsha', 'Bhadrapada');
assert.equal(rituOf(7, 0).ritu, 'Sharad', 'Kartika');
assert.equal(rituOf(8, 0).ritu, 'Hemanta', 'Margashirsha');
assert.equal(rituOf(9, 0).ritu, 'Hemanta', 'Pausha');
assert.equal(rituOf(10, 0).ritu, 'Shishira', 'Magha');
assert.equal(rituOf(11, 0).ritu, 'Shishira');
assert.equal(rituOf(null, 15).ritu, 'Vasanta', 'the solar one for the Sun in Mesha');
assert.equal(rituOf(null, 345).solar, 'Vasanta', 'Mina');
assert.equal(rituOf(null, 45).solar, 'Grishma', 'Vrishabha');
assert.equal(rituOf(null, 280).solar, 'Shishira', 'Makara');
assert.equal(rituOf(null, 240).solar, 'Hemanta', 'Dhanu');
assert.deepEqual(rituOf(8, 200), { ritu: 'Hemanta', solar: 'Sharad' }, 'Margashirsha with the Sun still in Tula: the two differ');

// --- The Kala of the day: five parts of the day, three of the night -----------------------------------------------------------------------------------------
const rise = 6;
const set = 18;   // a day of 12 hours: parts of 2 h 24 min
assert.equal(kalaOf(6.5, rise, set, 30, -6)!.name, 'Pratah');
assert.equal(kalaOf(9, rise, set, 30, -6)!.name, 'Sangava');
assert.equal(kalaOf(12, rise, set, 30, -6)!.name, 'Madhyahna');
assert.equal(kalaOf(15, rise, set, 30, -6)!.name, 'Aparahna');
assert.equal(kalaOf(17.5, rise, set, 30, -6)!.name, 'Sayahna');
const middle = kalaOf(12, rise, set, 30, -6)!;
assert.equal(middle.day, true);
assert.ok(Math.abs(middle.from - 10.8) < 1e-9 && Math.abs(middle.to - 13.2) < 1e-9, 'the third fifth of 06:00–18:00 is 10:48–13:12');
// The night, 18:00 to 06:00 the next day, in three parts of four hours; a birth before sunrise is in the night before (from the previous sunset, -6 = 18:00 the day before).
assert.equal(kalaOf(19, rise, set, 30, -6)!.name, 'Pradosha');
assert.equal(kalaOf(23, rise, set, 30, -6)!.name, 'Nishitha');
assert.equal(kalaOf(1, rise, set, 30, -6)!.name, 'Nishitha', '01:00 is in the middle part of 18:00–06:00 (22:00–02:00)');
assert.equal(kalaOf(2, rise, set, 30, -6)!.name, 'Ushah', 'and 02:00 begins the last');
assert.equal(kalaOf(4, rise, set, 30, -6)!.name, 'Ushah');
assert.equal(kalaOf(4, rise, set, 30, -6)!.day, false);
assert.equal(kalaOf(12, null, null, null, null), null, 'no sunrise, no parts');
assert.equal(kalaOf(4, rise, set, 30, null), null, 'before sunrise without the previous sunset');
assert.equal(clockMinutes(10.8), '10:48');
assert.equal(clockMinutes(25.5), '01:30');
assert.equal(clockMinutes(23.999), '00:00');

console.log('panchang calendar tests passed');
