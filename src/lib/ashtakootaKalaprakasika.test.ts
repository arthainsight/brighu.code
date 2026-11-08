import assert from 'node:assert/strict';
import { ashtakoota, MAHENDRA_COUNTS, RAJJU_EFFECTS, RAJJU_NAMES, STRI_DIRGHA_MIN_COUNT, STRI_DIRGHA_MIN_COUNT_LENIENT, VEDHA_PAIRS } from './ashtakoota';
import { NAKSHATRA_SIZE } from './nakshatras';

// The four matchings of the Southern tradition against the Kālaprakāśikā (the English of N. P. Subramania Iyer, 1982, archive.org `kalaprakasika`), chapter XIII "To determine the
// suitability of a match", the ten considerations. The lists are typed in from that text, not from the code.

const star = (n: number) => (n - 1) * NAKSHATRA_SIZE + 1;
const A = (boy: number, girl: number) => ashtakoota(star(boy), star(girl));

// 3. Mahendra: "The Janma-Nakshathra of the bridegroom should be the 4th, 7th, 10th, 13th, 16th, 19th, 22nd or 25th asterism from that of the bride."
assert.deepEqual([...MAHENDRA_COUNTS], [4, 7, 10, 13, 16, 19, 22, 25]);
for (let girl = 1; girl <= 27; girl += 1) for (let count = 1; count <= 27; count += 1) {
  const boy = ((girl - 1 + count - 1) % 27) + 1;
  assert.equal(A(boy, girl).extras.mahendra, [4, 7, 10, 13, 16, 19, 22, 25].includes(count), `girl ${girl}, the ${count}th`);
  assert.equal(A(boy, girl).extrasDetail.mahendra.count, count);
}

// 4. Sthree-Dheergham: "beyond the 13th asterism from that of the bride … Some writers hold that it is enough if the said asterism be beyond the 7th."
assert.equal(STRI_DIRGHA_MIN_COUNT, 13);
assert.equal(STRI_DIRGHA_MIN_COUNT_LENIENT, 7);
assert.equal(A(14, 1).extras.striDirgha, true); assert.equal(A(13, 1).extras.striDirgha, false);
assert.deepEqual([A(8, 1).extrasDetail.striDirgha.beyondSeven, A(7, 1).extrasDetail.striDirgha.beyondSeven], [true, false]);
assert.equal(A(8, 1).extras.striDirgha, false, 'beyond the 7th but not the 13th: the strict reading fails, the lenient one passes');

// 9. Rajju: five divisions; "the asterisms of the couple should not be in the same division". Padha: Aswini, Aslesha, Magha, Jyeshta, Mula, Revathi. Ooroo: Bharani, Pushya, Purvapalguni, Anuradha,
// Purvashada, Utharabadhrapadha. Nabhi: Krithika, Punarvasu, Utharapalguni, Visakha, Utharashada, Purvabadhrapadha. Kanta: Rohini, Ardhra, Hastha, Swathi, Sravana, Sathabis. Siro: Mrigasirsha, Chithra, Sravishta.
const RAJJUS: number[][] = [[1, 9, 10, 18, 19, 27], [2, 8, 11, 17, 20, 26], [3, 7, 12, 16, 21, 25], [4, 6, 13, 15, 22, 24], [5, 14, 23]];
RAJJUS.forEach((stars, group) => {
  for (const a of stars) for (const b of stars) {
    assert.equal(A(a, b).extras.rajju, false, `${a} and ${b}`);
    assert.equal(A(a, b).extrasDetail.rajju.effect, RAJJU_EFFECTS[group]);
  }
});
assert.equal(RAJJUS.flat().length, 27);
for (let group = 0; group < 5; group += 1) for (let other = 0; other < 5; other += 1) if (group !== other) assert.equal(A(RAJJUS[group][0], RAJJUS[other][0]).extras.rajju, true);
// The effects: foot — travel abroad, thigh — loss of property, navel — loss of offspring, neck — death of the woman, head — death of the man.
assert.deepEqual([...RAJJU_EFFECTS], ['travel in foreign countries', 'loss of property', 'loss of offspring', 'death of the woman', 'death of the man']);
assert.equal(RAJJU_NAMES.length, 5);

// 10. Vedhai: "Aswini and Jyeshta—Bharani and Anuradha—Krithika and Visakha—Rohini and Swathi—Ardhra and Sravana—Punarvasu and Utharashada—Pushya and Purvashada—Aslesha and Mula—Magha and
// Revathi—Purvapalguni and Utharabadhrapadha—Utharapalguni and Purvabadhrapadha—Hastha and Sathabis—Mrigasirsha, Chithra and Sravishta."
const VEDHA_SETS: number[][] = [[1, 18], [2, 17], [3, 16], [4, 15], [6, 22], [7, 21], [8, 20], [9, 19], [10, 27], [11, 26], [12, 25], [13, 24], [5, 14, 23]];
const pairs = VEDHA_SETS.flatMap(set => set.flatMap((a, i) => set.slice(i + 1).map(b => [a, b] as const)));
assert.equal(pairs.length, 15);
for (const [a, b] of pairs) {
  assert.equal(A(a, b).extras.vedha, false, `${a} and ${b}`);
  assert.equal(A(b, a).extras.vedha, false, `${b} and ${a}`);
  assert.deepEqual(A(a, b).extrasDetail.vedha.pair, [Math.min(a, b), Math.max(a, b)]);
}
assert.deepEqual([...VEDHA_PAIRS].map(([a, b]) => [Math.min(a, b), Math.max(a, b)].join('-')).sort(), pairs.map(([a, b]) => [Math.min(a, b), Math.max(a, b)].join('-')).sort());
// Everything else passes.
let passes = 0;
for (let a = 1; a <= 27; a += 1) for (let b = 1; b <= 27; b += 1) if (A(a, b).extras.vedha) passes += 1;
assert.equal(passes, 27 * 27 - 30, 'thirty ordered pairs of 729 obstruct (fifteen pairs, both ways)');

// The exception: "Rajju, Vedhai, Ganam and Rasi—the adverse effects arising from these need not be considered if (1) the lords of the Jenma-Rasis of the man and the woman be the same, (2) they be
// friendly planets and (3) if their Jenma-Rasis be diametrically opposite signs of the zodiac." The lords the same, or the signs opposite, are done; the friendly planets of the
// text are another table of friendships (Mars's friends Mercury and Venus; Venus's friends all but the Sun and the Moon …) that is not applied.
const sign = (n: number) => (n - 1) * 30 + 5;
assert.deepEqual(ashtakoota(sign(1), sign(8)).southernRelief, ['same-lord'], 'Aries and Scorpio: Mars');
assert.deepEqual(ashtakoota(sign(1), sign(7)).southernRelief, ['opposite-signs'], 'Aries and Libra');
assert.deepEqual(ashtakoota(sign(2), sign(7)).southernRelief, ['same-lord'], 'Taurus and Libra: Venus');
assert.deepEqual(ashtakoota(sign(1), sign(2)).southernRelief, []);

console.log('Ashtakoota against Kalaprakasika passed');
