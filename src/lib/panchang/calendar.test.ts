import assert from 'node:assert/strict';
import { ayanaOf, clockMinutes, KALA_MEANING, kalaOf, lunarYearStart, rituOf, SAMVATSARA_NAMES, samvatsaraOf } from './calendar';

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

// --- The Kala: Suryodaya, Pratah, Sangava, Madhyahna, Parahna, Sayankala, Ratri and Pratyusha round the whole day -------------------------------------------------
const rise = 6;
const set = 18;   // a day of 12 hours: fifths of 2 h 24 min, a muhurta of 48 min, and the same for the night
const kala = (local: number) => kalaOf(local, rise, set, 30, -6)!;
const named = (local: number) => `${kala(local).name}${kala(local).third ? ` · ${kala(local).third}` : ''}`;
assert.equal(named(6), 'Sūryodaya', 'the first muhurta from sunrise');
assert.equal(named(6.7), 'Sūryodaya');
assert.equal(named(7), 'Prātaḥ', 'the rest of the first fifth');
assert.equal(named(9), 'Saṅgava');
assert.equal(named(12), 'Madhyāhna');
assert.equal(named(15), 'Parāhna');
assert.equal(named(17), 'Sāyankāla', 'the last fifth');
assert.equal(named(18.5), 'Sāyankāla', 'and the twilight after sunset, a night muhurta');
assert.equal(named(19), 'Rātri · Pradosha');
assert.equal(named(23), 'Rātri · Nishitha');
assert.equal(named(26.5), 'Rātri · Ushah');
assert.equal(named(29), 'Pratyūsha', 'the last two muhurtas before sunrise');
// Before sunrise it is the night before (the previous sunset -6 is 18:00 the day before).
assert.equal(named(1), 'Rātri · Nishitha');
assert.equal(named(4), 'Rātri · Ushah');
assert.equal(named(5), 'Pratyūsha');
assert.equal(named(5.99), 'Pratyūsha');
// The hours of each part, and no gap between them.
const bounds = (local: number) => [kala(local).from, kala(local).to];
assert.deepEqual(bounds(6.5).map(value => Math.round(value * 60)), [360, 408], 'Suryodaya 06:00–06:48');
assert.deepEqual(bounds(7).map(value => Math.round(value * 60)), [408, 504], 'Pratah 06:48–08:24');
assert.deepEqual(bounds(12).map(value => Math.round(value * 60)), [648, 792], 'Madhyahna 10:48–13:12');
assert.deepEqual(bounds(17).map(value => Math.round(value * 60)), [936, 1128], 'Sayankala 15:36–18:48');
assert.deepEqual(bounds(23).map(value => Math.round(value * 60)), [1128, 1704], 'Ratri 18:48–04:24 the next day');
assert.deepEqual(bounds(29).map(value => Math.round(value * 60)), [1704, 1800], 'Pratyusha 04:24–06:00');
let last = kala(6).name;
for (let minute = 361; minute < 1800; minute++) {
  const found = kala(minute / 60);
  assert.ok(found.from <= minute / 60 + 1e-9 && minute / 60 < found.to + 1e-9, `${minute} is inside its part`);
  last = found.name;
}
assert.equal(last, 'Pratyūsha');
assert.equal(KALA_MEANING['Madhyāhna'], 'midday');
assert.equal(kalaOf(12, null, null, null, null), null, 'no sunrise, no parts');
assert.equal(kalaOf(4, rise, set, 30, null), null, 'before sunrise without the previous sunset');
assert.equal(kalaOf(20, rise, set, null, -6), null, 'after sunset without the next sunrise');

assert.equal(clockMinutes(10.8), '10:48');
assert.equal(clockMinutes(25.5), '01:30');
assert.equal(clockMinutes(23.999), '00:00');

console.log('panchang calendar tests passed');
