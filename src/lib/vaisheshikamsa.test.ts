// The names of the good vargas (BPHS 6.42-53; vaisheshikamsa.ts). The expected counts of the reference chart were worked
// out by a separate program from the definitions of the sixteen vargas in BPHS 6 and from 6.52, not by the engine.
import assert from 'node:assert/strict';
import { BHEDAKADI, KIMSHUKADI, PARIJATADI, VAISHESHIKA_NAMES, VAISHESHIKA_VERSES, arudhaKendraLords, arudhaLagnaLord, calculateJhoraVaisheshikamsa, calculateVaisheshikamsa, schemeVargas, vaisheshikaName } from './vaisheshikamsa';
import { REFERENCE_CHART } from './shadbala.fixture';
import type { ShadbalaChartLike } from './shadbala';

// ---------------------------------------------------------------------------
// The names of the verses
// ---------------------------------------------------------------------------
assert.deepEqual(KIMSHUKADI.map(entry => entry.name), ['Kiṁśuka', 'Vyañjana', 'Cāmara', 'Chatra', 'Kuṇḍala', 'Mukuṭa']);
assert.deepEqual(PARIJATADI.map(entry => entry.name), ['Pārijāta', 'Uttama', 'Gopura', 'Siṁhāsana', 'Pārāvata', 'Devaloka', 'Brahmaloka', 'Śakravāhana', 'Śrīdhāma']);
assert.deepEqual(BHEDAKADI.map(entry => entry.name), ['Bhedaka', 'Kusuma', 'Nāgapuṣpa', 'Kanduka', 'Kerala', 'Kalpavṛkṣa', 'Candanavana', 'Pūrṇacandra', 'Uccaiḥśravā', 'Dhanvantari', 'Sūryakānta', 'Vidruma', 'Śakrasiṁhāsana', 'Goloka', 'Śrīvallabha']);
// Every count from two to the number of vargas of the scheme has one name; one varga and none have no name.
for (const [scheme, size] of [['shadvarga', 6], ['saptavarga', 7], ['dasavarga', 10], ['shodasavarga', 16]] as const) {
  assert.equal(schemeVargas(scheme).length, size);
  assert.deepEqual(VAISHESHIKA_NAMES[scheme].map(entry => entry.count), Array.from({ length: size - 1 }, (_, index) => index + 2), scheme);
  assert.equal(vaisheshikaName(scheme, 0), null);
  assert.equal(vaisheshikaName(scheme, 1), null);
}
assert.equal(vaisheshikaName('shadvarga', 6)?.name, 'Kuṇḍala');
assert.equal(vaisheshikaName('saptavarga', 7)?.name, 'Mukuṭa');
assert.equal(vaisheshikaName('dasavarga', 5)?.name, 'Siṁhāsana');
assert.equal(vaisheshikaName('dasavarga', 10)?.name, 'Śrīdhāma');
assert.equal(vaisheshikaName('shodasavarga', 13)?.name, 'Vidruma');
assert.equal(vaisheshikaName('shodasavarga', 16)?.name, 'Śrīvallabha');
// Each name is in the Devanagari of the verse it is cited from.
for (const entry of [...KIMSHUKADI, ...PARIJATADI, ...BHEDAKADI]) {
  const verse = VAISHESHIKA_VERSES.find(item => item.verse === entry.verse);
  assert.ok(verse, `${entry.name}: verse 6.${entry.verse}`);
  // An initial vowel is joined to the word before it (द्वाभ्यामुत्तमं, दिग्भिरुच्चैःश्रवा): the rest of the name is looked for.
  const letters = /^[अ-औ]/.test(entry.devanagari) ? entry.devanagari.slice(1) : entry.devanagari;
  assert.ok(verse.sanskrit.join(' ').includes(letters), `${entry.name}: ${entry.devanagari} in 6.${entry.verse}`);
}
assert.deepEqual(VAISHESHIKA_VERSES.map(verse => verse.verse), [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53]);

// ---------------------------------------------------------------------------
// The reference chart (13 October 1987, Kotka)
// ---------------------------------------------------------------------------
{
  // Cancer rises, the Moon is in Gemini (the 12th): the Āruḍha is the 12th from Gemini, Taurus. Its kendras are Taurus, Leo, Scorpio and Aquarius.
  assert.deepEqual(arudhaKendraLords(REFERENCE_CHART), { arudhaSign: 2, kendraLords: ['Sun', 'Mars', 'Venus', 'Saturn'] });

  const own = calculateVaisheshikamsa(REFERENCE_CHART);
  const counts = (result: typeof own) => Object.fromEntries(result.rows.map(row => [row.planet, [row.counts.shadvarga, row.counts.saptavarga, row.counts.dasavarga, row.counts.shodasavarga]]));
  assert.deepEqual(counts(own), {
    Sun: [2, 3, 3, 3], Moon: [0, 1, 2, 3], Mars: [0, 0, 1, 3], Mercury: [1, 1, 1, 1], Jupiter: [0, 0, 1, 1], Venus: [2, 2, 3, 7], Saturn: [2, 3, 4, 5],
  });
  const row = (planet: string) => own.rows.find(item => item.planet === planet)!;
  // The Sun: the horā, the saptāṁśa and the navāṁśa in Leo.
  assert.deepEqual(Object.entries(row('Sun').vargas).filter(([, cell]) => cell.good).map(([key]) => key), ['D2', 'D7', 'D9']);
  assert.deepEqual(Object.values(row('Sun').names).map(name => name?.name ?? null), ['Kiṁśuka', 'Vyañjana', 'Uttama', 'Kusuma']);
  assert.deepEqual(Object.values(row('Venus').names).map(name => name?.name ?? null), ['Kiṁśuka', 'Kiṁśuka', 'Uttama', 'Kalpavṛkṣa']);
  assert.deepEqual(Object.values(row('Saturn').names).map(name => name?.name ?? null), ['Kiṁśuka', 'Vyañjana', 'Gopura', 'Kanduka']);
  assert.deepEqual(Object.values(row('Mercury').names), [null, null, null, null]);
  // Jupiter's one good varga is the ṣaṣṭyaṁśa in Cancer, its exaltation; Saturn's saptāṁśa in Libra likewise.
  assert.equal(row('Jupiter').vargas.D60.dignity, 'exalted');
  assert.equal(row('Saturn').vargas.D7.dignity, 'exalted');
  assert.equal(row('Saturn').vargas.D9.dignity, 'own');

  // 6.52 in full: the signs of the Sun, Mars, Venus and Saturn count for every graha.
  const full = calculateVaisheshikamsa(REFERENCE_CHART, 'full');
  assert.deepEqual(counts(full), {
    Sun: [4, 5, 8, 10], Moon: [4, 5, 8, 12], Mars: [0, 1, 3, 6], Mercury: [4, 5, 8, 14], Jupiter: [6, 7, 10, 13], Venus: [5, 5, 7, 12], Saturn: [5, 6, 8, 11],
  });
  assert.equal(full.rows.find(item => item.planet === 'Jupiter')!.names.dasavarga?.name, 'Śrīdhāma');

  // 6.53: Mars is 16°24' from the Sun (orb 17°): combust. Venus is in Libra, its own sign, and Saturn is 57° from the Sun.
  assert.ok(row('Mars').spoilers.includes('combust'));
  assert.ok(!row('Venus').spoilers.includes('debilitated'));
  assert.ok(!row('Saturn').spoilers.includes('combust'));
}

// ---------------------------------------------------------------------------
// The limits of the first reading, from the vargas themselves
// ---------------------------------------------------------------------------
{
  // The Sun at 5° of Leo: Leo in the rāśi, the horā, the dreṣkāṇa and the dvādaśāṁśa; the triṁśāṁśa has no sign of the Sun. Five of six is the most.
  const chart: ShadbalaChartLike = { ascendant: { sign: 1, longitude: 10 }, planets: [{ name: 'Sun', longitude: 125 }, { name: 'Mars', longitude: 40 }, { name: 'Saturn', longitude: 190 }] };
  const sun = calculateVaisheshikamsa(chart).rows.find(row => row.planet === 'Sun')!;
  assert.equal(sun.vargas.D30.good, false);
  assert.ok(sun.counts.shadvarga <= 5);
  // Saturn in Libra is exalted and not debilitated; a graha in its debilitation sign is named by 6.53.
  const all = calculateVaisheshikamsa(chart).rows;
  assert.deepEqual(all.find(row => row.planet === 'Saturn')!.spoilers.filter(item => item === 'debilitated'), []);
  const fallen = calculateVaisheshikamsa({ ...chart, planets: [{ name: 'Sun', longitude: 185 }] }).rows[0];
  assert.ok(fallen.spoilers.includes('debilitated'));
  assert.equal(fallen.vargas.D1.good, false);
  // Without the lord of the Lagna there is no Āruḍha, and the full reading counts as the first.
  assert.deepEqual(arudhaKendraLords({ ascendant: { sign: 4, longitude: 100 }, planets: [{ name: 'Sun', longitude: 125 }] }), { arudhaSign: null, kendraLords: [] });
}

// ---------------------------------------------------------------------------
// The count of Jagannatha Hora: the bars of the video (3 December 1984, 09:17, Howrah; Lahiri, mean node)
// ---------------------------------------------------------------------------
{
  // The expected numbers are read from Jagannatha Hora itself (the Vaiseshikamsa (6) and (10) bars), with the settings named in vaisheshikamsa.ts.
  const at = (name: string, longitude: number) => ({ name, longitude });
  const howrah: ShadbalaChartLike = {
    ascendant: { sign: 10, longitude: 272.3622 },
    planets: [at('Sun', 227.5194), at('Moon', 348.2311), at('Mars', 289.4851), at('Mercury', 246.9144), at('Jupiter', 261.3543), at('Venus', 269.281), at('Saturn', 208.0106), at('Rahu', 33.0284), at('Ketu', 213.0284)],
  };
  // The Lagna lord Saturn is in Libra, the 10th from Capricorn: the Āruḍha is the 10th from Libra, Cancer, and being the 7th from the Lagna gives way to its 10th, Aries. Its lord is Mars.
  assert.equal(arudhaLagnaLord(howrah), 'Mars');
  const six = (result: ReturnType<typeof calculateJhoraVaisheshikamsa>) => result.rows.map(row => row.counts.shadvarga);
  const ten = (result: ReturnType<typeof calculateJhoraVaisheshikamsa>) => result.rows.map(row => row.counts.dasavarga);
  // Jupiter is in Upaveśana, a bad state: its kendras do not count.
  const video = calculateJhoraVaisheshikamsa(howrah, ['Jupiter']);
  assert.deepEqual(video.rows.map(row => row.planet), ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu']);
  assert.deepEqual(six(video), [3, 4, 5, 2, 2, 3, 3, 2, 3]);
  assert.deepEqual(ten(video), [5, 6, 8, 2, 3, 5, 4, 4, 4]);
  // With the other sunrise of the program Venus was in a bad state too: only its own triṁśāṁśa is left.
  assert.deepEqual(six(calculateJhoraVaisheshikamsa(howrah, ['Jupiter', 'Venus'])), [3, 4, 5, 2, 2, 1, 3, 2, 3]);
  // No bad state at all: Jupiter keeps the dreṣkāṇa and the dvādaśāṁśa in Leo, where Mars is in a kendra.
  assert.deepEqual(six(calculateJhoraVaisheshikamsa(howrah)), [3, 4, 5, 2, 4, 3, 3, 2, 3]);
  const cell = (planet: string, key: string) => video.rows.find(row => row.planet === planet)!.vargas[key];
  // Mars is always in a kendra from itself; in the navāṁśa it is in Gemini with Mercury, an adhiśatru there.
  assert.equal(cell('Mars', 'D9').cancelled, 'enemy');
  assert.equal(cell('Mars', 'D2').good, true);
  // Venus is debilitated in the daśāṁśa (Virgo), opposite Mars in Pisces.
  assert.equal(cell('Venus', 'D10').cancelled, 'debilitated');
  assert.equal(cell('Jupiter', 'D3').cancelled, 'avastha');
  assert.equal(cell('Jupiter', 'D2').dignity, 'exalted');
  assert.equal(cell('Rahu', 'D12').dignity, 'exalted');
  assert.equal(cell('Ketu', 'D1').dignity, 'own');
}

console.log('Vaisheshikamsa tests passed');
