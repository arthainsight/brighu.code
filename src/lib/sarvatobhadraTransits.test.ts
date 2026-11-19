import assert from 'node:assert/strict';
import { transitsOverNatal } from './sarvatobhadraTransits';
import { lattaNakshatra } from './phaladipikaGochara';
import { sbcCellOf, sbcVedha } from './sarvatobhadra';

const SIZE = 360 / 27;
const mid = (star: number) => (star + 0.5) * SIZE;   // the middle of a nakshatra (0 = Ashwini)

// A transiting graha in the nakshatra of a natal graha is a conjunction, and counts by its nature.
const natal = [{ name: 'Venus', longitude: mid(9) }];            // Magha
const conjunct = transitsOverNatal(natal, [{ name: 'Jupiter', longitude: mid(9) + 1 }, { name: 'Ketu', longitude: mid(9) + 2 }], 0)[0];
assert.deepEqual(conjunct.conjunction, ['Jupiter', 'Ketu']);
assert.deepEqual(conjunct.good, ['Jupiter']);
assert.deepEqual(conjunct.bad, ['Ketu']);
assert.equal(conjunct.verdict, 'mixed');

// Nothing there: clear.
const quiet = transitsOverNatal([{ name: 'Sun', longitude: mid(6) }], [{ name: 'Moon', longitude: mid(20) }], 0)[0];
assert.equal(quiet.verdict, 'clear');

// The vedha: the nakshatra a line of a transiting graha ends on.
const mover = { name: 'Venus', longitude: mid(14) };           // Chitra
const target = sbcVedha(sbcCellOf(mover.longitude))![0].target;
const struck = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26].find(star => {
  const cell = sbcCellOf(mid(star));
  return cell[0] === target[0] && cell[1] === target[1];
});
assert.ok(struck !== undefined, 'the across line ends on a nakshatra of the 27');
const vedha = transitsOverNatal([{ name: 'Moon', longitude: mid(struck!) }], [mover], 0)[0];
assert.deepEqual(vedha.vedha, ['Venus']);
assert.equal(vedha.verdict, 'supported', 'a benefic with vedha supports');

// The lattā: the Sun in Vishakha (16) kicks 12 on, Revati (26) — the example of the page this was made after.
assert.equal(lattaNakshatra('Sun', mid(15)), 26);
const latta = transitsOverNatal([{ name: 'Saturn', longitude: mid(26) }], [{ name: 'Sun', longitude: mid(15) }], 0)[0];
assert.deepEqual(latta.latta, ['Sun']);
assert.equal(latta.verdict, 'afflicted', 'a malefic kick afflicts');
// Ketu has no lattā unless the variant is asked for (9 behind: Magha (9) kicks Bharani (1)).
const ketu = (variant: boolean) => transitsOverNatal([{ name: 'Moon', longitude: mid(1) }], [{ name: 'Ketu', longitude: mid(9) }], 0, variant)[0];
assert.deepEqual(ketu(false).latta, []);
assert.deepEqual(ketu(true).latta, ['Ketu']);

// With the pada chosen the lattā bites only the pada of the kicker's number: the Sun in the 2nd pada of Vishakha-side (nakshatra 15) kicks Revati (26); a natal graha
// there counts in its 2nd pada and not in its 1st.
const secondPada = (star: number) => star * SIZE + 1.5 * (SIZE / 4);
const firstPada = (star: number) => star * SIZE + 0.5 * (SIZE / 4);
const kick = (natalLongitude: number, part: 'nakshatra' | 'pada') => transitsOverNatal([{ name: 'Saturn', longitude: natalLongitude }], [{ name: 'Sun', longitude: secondPada(15) }], 0, false, part)[0].latta;
assert.deepEqual(kick(secondPada(26), 'pada'), ['Sun']);
assert.deepEqual(kick(firstPada(26), 'pada'), []);
assert.deepEqual(kick(firstPada(26), 'nakshatra'), ['Sun']);

// The aspects by sign: Mars in Aries (sign 1) aspects the 4th, 7th and 8th (Cancer, Libra, Scorpio), not the 5th; Jupiter the 5th, 7th and 9th.
const aspected = (name: string, from: number, to: number) => transitsOverNatal([{ name: 'Sun', longitude: (to - 1) * 30 + 15 }], [{ name, longitude: (from - 1) * 30 + 5 }], 0)[0].aspects;
assert.deepEqual(aspected('Mars', 1, 4), ['Mars']);
assert.deepEqual(aspected('Mars', 1, 5), []);
assert.deepEqual(aspected('Jupiter', 1, 5), ['Jupiter']);
assert.deepEqual(aspected('Venus', 1, 7), ['Venus']);
assert.deepEqual(aspected('Venus', 1, 4), []);
assert.deepEqual(aspected('Saturn', 1, 1), [], 'the same sign is the conjunction, not an aspect');
