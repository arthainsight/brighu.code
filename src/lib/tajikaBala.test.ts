import assert from 'node:assert/strict';
import { dvadashavargiyaBala, harshaBala, tajikaDivisions, type SevenGraha, SEVEN_GRAHAS } from './tajikaBala';
import { getVargaSignIndex } from './varga';
import { SIGN_LORDS } from './signs';

const rulers = (longitude: number) => tajikaDivisions(longitude).map(item => item.ruler);

// The twelve divisions at 0° Aries: everything begins with Mars (Aries), the hora with the Sun (odd sign).
assert.deepEqual(rulers(0), ['Mars', 'Sun', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars', 'Mars']);
// At 0° Taurus (an even sign): the hora begins with the Moon; the fifth-part runs backwards (Venus first); the sixth-parts of Taurus
// begin at Libra (Venus), the seventh-parts of an even sign at its seventh sign (Scorpio, Mars), the eighth at Sagittarius (Jupiter),
// the ninth at Capricorn (Saturn), the tenth at Aquarius (Saturn), the eleventh at Pisces (Jupiter).
assert.deepEqual(rulers(30), ['Venus', 'Moon', 'Venus', 'Venus', 'Venus', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Saturn', 'Jupiter', 'Venus']);
// The first part of the Gemini, Cancer, Leo and Virgo: the sixth-parts at Aries (Gemini: 12), the eighth at Leo (Gemini), the tenth at Sagittarius.
assert.equal(tajikaDivisions(60).find(item => item.key === 'ashtamsa')!.sign, 5, 'the eighth-parts of a dual sign begin at Leo');
assert.equal(tajikaDivisions(60).find(item => item.key === 'dashamsa')!.sign, 9, 'the tenth-parts of Gemini begin at Sagittarius');
assert.equal(tajikaDivisions(90).find(item => item.key === 'ashtamsa')!.sign, 1, 'the eighth-parts of Cancer begin at Aries');
assert.equal(tajikaDivisions(90).find(item => item.key === 'navamsa')!.sign, 4, 'the navamsa of Cancer begins at Cancer');
// The last part of Pisces: the navamsa is Pisces, the decan Scorpio, the hora of an even sign ends with the Sun.
const lastPisces = tajikaDivisions(359.999);
assert.equal(lastPisces.find(item => item.key === 'navamsa')!.sign, 12);
assert.equal(lastPisces.find(item => item.key === 'dreshkana')!.sign, 8);
assert.equal(lastPisces.find(item => item.key === 'hora')!.ruler, 'Sun');
// Every division gives a part within its range, and every ruler is one of the seven.
for (let lon = 0; lon < 360; lon += 0.37) {
  for (const item of tajikaDivisions(lon)) {
    assert.ok(item.part >= 1 && item.part <= item.parts, `${item.key} part ${item.part} at ${lon}`);
    assert.ok((SEVEN_GRAHAS as readonly string[]).includes(item.ruler));
  }
}
// The signs of the divisions are those of the divisional charts: the third, fourth, seventh, ninth and twelfth by the Parāśara rule,
// and the sixth, eighth, tenth and eleventh by the running on of the parts (the cyclic Parivṛtti rule).
const SIGN_AT: Record<string, [number, 'parasara' | 'parivritti-cyclic']> = {
  dreshkana: [3, 'parasara'], padamsa: [4, 'parasara'], saptamsa: [7, 'parasara'], navamsa: [9, 'parasara'], dvadasamsa: [12, 'parasara'],
  shashthamsa: [6, 'parivritti-cyclic'], ashtamsa: [8, 'parivritti-cyclic'], dashamsa: [10, 'parivritti-cyclic'], rudramsa: [11, 'parivritti-cyclic'],
};
for (let lon = 0.013; lon < 360; lon += 0.731) {
  for (const item of tajikaDivisions(lon)) {
    const rule = SIGN_AT[item.key];
    if (!rule) continue;
    assert.equal(item.sign, getVargaSignIndex(lon, rule[0], rule[1]) + 1, `${item.key} at ${lon}`);
    assert.equal(item.ruler, SIGN_LORDS[(item.sign! - 1)], `${item.key} ruler at ${lon}`);
  }
}

// Dvādaśavargīya Bala: the Sun at 0° Aries. Its divisions are all ruled by Mars, a friend, but Mars is a malefic, so each division is good and evil; the hora is
// the Sun's own (good), the fifth-part Mars again; and the Sun is exalted in the Aries divisions, which are good.
const sun = dvadashavargiyaBala('Sun', 0, true);
assert.equal(sun.divisions.length, 12);
assert.deepEqual(sun.divisions[1].good, ['own'], 'the Sun rules its own hora and is not judged a benefic or a malefic there');
assert.deepEqual(sun.divisions[0].good, ['friend', 'exaltation'], 'Aries: Mars is a friend, and it is the Sun’s exaltation');
assert.deepEqual(sun.divisions[0].evil, ['malefic']);
assert.equal(sun.good, 12);
assert.equal(sun.evil, 11);
assert.equal(sun.total, 1);
// The Moon's phase decides whether the Moon is judged a benefic: the Sun in the Moon's hora (Taurus first half, even sign).
assert.deepEqual(dvadashavargiyaBala('Mercury', 30, true).divisions[1].good, ['benefic'], 'a waxing Moon ruling the hora is a benefic for Mercury');
assert.deepEqual(dvadashavargiyaBala('Mercury', 30, false).divisions[1].evil, ['enemy', 'malefic'], 'a waning Moon is a malefic, and the Moon is Mercury’s enemy');
// An evil division is a fall: Saturn in Aries is debilitated.
assert.ok(dvadashavargiyaBala('Saturn', 0, true).divisions[0].evil.includes('fall'));

// Harṣa Bala, the worked example of P.V.R. Narasimha Rao (Example 119 / Chart 66, the year beginning before dawn): the lagna is
// Capricorn; the Sun and Mercury are in Aquarius (2nd), the Moon and Mars in Pisces (3rd), Jupiter and Saturn in Aries (4th),
// Venus in Capricorn (1st).
const chart66: [SevenGraha, number, number][] = [
  ['Sun', 2, 11], ['Moon', 3, 12], ['Mars', 3, 12], ['Mercury', 2, 11], ['Jupiter', 4, 1], ['Venus', 1, 10], ['Saturn', 4, 1],
];
const expected66: Record<SevenGraha, number> = { Sun: 0, Moon: 15, Mars: 0, Mercury: 10, Jupiter: 5, Venus: 10, Saturn: 5 };
for (const [planet, house, sign] of chart66) assert.equal(harshaBala(planet, house, sign, false).total, expected66[planet], `${planet} in the example of the book`);
// The same planets in a year that begins by day: the male grahas gain and the female lose the fourth joy.
assert.equal(harshaBala('Jupiter', 4, 1, true).total, 10);
assert.equal(harshaBala('Moon', 3, 12, true).total, 10);
// Each joy alone. Venus's house is the 5th (the fifth of the nine, three, six, one, eleven, five, twelve), not the 12th.
assert.equal(harshaBala('Venus', 5, 4, true).sthana, 5);
assert.equal(harshaBala('Venus', 12, 4, true).sthana, 0);
assert.equal(harshaBala('Saturn', 12, 4, true).sthana, 5);
assert.equal(harshaBala('Sun', 9, 7, true).sthana, 5);
// Own sign, and the exaltation by Tejaḥsiṃha but not by Samarasiṃha.
assert.equal(harshaBala('Sun', 6, 5, true).svagriha, 5);
assert.equal(harshaBala('Sun', 6, 1, true).svagriha, 5);
assert.equal(harshaBala('Sun', 6, 1, true, { exaltationCounts: false }).svagriha, 0);
// A full 20: Mercury (female) in the 1st house, which is its house of joy and in a group of three houses for the female, in Virgo (own),
// in a year that begins by night. The male Sun can never have 20 (its house of joy, the 9th, is in a female group).
assert.equal(harshaBala('Mercury', 1, 6, false).total, 20);
assert.ok(SEVEN_GRAHAS.every(planet => harshaBala(planet, 9, 5, true).total <= 20));
assert.equal(harshaBala('Sun', 9, 5, true).total, 15, 'the Sun in the 9th, in Leo, by day: 5 + 5 + 0 + 5');

console.log('Tajika bala tests passed');
