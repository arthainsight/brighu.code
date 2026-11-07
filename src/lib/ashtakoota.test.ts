import assert from 'node:assert/strict';
import { ashtakoota, countSigns, countStars, kujaBalance, kujaDosha, moonSign, vashyaOf, VEDHA_PAIRS } from './ashtakoota';
import { NAKSHATRA_SIZE } from './nakshatras';

const star = (number: number, inStar = 1) => (number - 1) * NAKSHATRA_SIZE + inStar; // a longitude in a star

// The star, the quarter and the sign of a longitude.
assert.deepEqual(moonSign(0.5), { nakshatra: 1, pada: 1, rasi: 1, degree: 0.5 });
assert.equal(moonSign(13.34).nakshatra, 2, 'Bharani begins at 13°20′');
assert.equal(moonSign(359.99).nakshatra, 27);
assert.equal(moonSign(359.99).pada, 4);
assert.equal(moonSign(-0.5).rasi, 12, 'a longitude is taken round the circle');
assert.equal(countStars(1, 1), 1); assert.equal(countStars(1, 2), 2); assert.equal(countStars(2, 1), 27); assert.equal(countStars(27, 1), 2);
assert.equal(countSigns(1, 1), 1); assert.equal(countSigns(12, 1), 2); assert.equal(countSigns(1, 12), 12);

// A pair worked by hand: the boy's Moon in Ashwini (5° Aries), the girl's in Bharani (21° Aries).
const pair = ashtakoota(5, 21);
const kuta = (key: string) => pair.kutas.find(item => item.key === key)!;
assert.deepEqual([pair.boy.nakshatra, pair.girl.nakshatra, pair.girl.pada], [1, 2, 3]);
assert.equal(kuta('varna').points, 1, 'both Kshatriya: the boy’s is not lower');
assert.equal(kuta('vashya').points, 2, 'both quadruped');
assert.equal(kuta('tara').points, 3, 'the boy’s star is the 27th from the girl’s (remainder 0) and hers the 2nd from his: both good');
assert.equal(kuta('yoni').points, 2, 'horse and elephant');
assert.equal(kuta('maitri').points, 5, 'the same lord, Mars');
assert.equal(kuta('gana').points, 5, 'the boy Deva, the girl Manushya');
assert.equal(kuta('bhakoot').points, 7, 'the same sign');
assert.equal(kuta('nadi').points, 8, 'Ādi and Madhya');
assert.equal(pair.total, 33);
assert.deepEqual(pair.doshas, { nadi: false, bhakoot: false, gana: false });
// The four extra matchings: the girl's star is the 2nd from hers (not 4, 7, …), so no Mahendra; no Vedha pair; the two Rajjus differ (foot, waist); the count 27 is over 13.
assert.deepEqual(pair.extras, { mahendra: false, vedha: true, rajju: true, striDirgha: true });
assert.equal(pair.counts.fromGirl, 27); assert.equal(pair.counts.fromBoy, 2);

// The kūṭas one at a time.
// Varṇa: the boy must not be lower than the girl. Water (Cancer 4) is Brahmin, air (Gemini 3) Shudra.
assert.equal(ashtakoota(100, 70).kutas[0].points, 1, 'a Brahmin boy with a Shudra girl');
assert.equal(ashtakoota(70, 100).kutas[0].points, 0, 'a Shudra boy with a Brahmin girl');
assert.equal(ashtakoota(40, 70).kutas[0].boy, 'Vaishya', 'Taurus is earth: Vaishya');
assert.equal(ashtakoota(70, 40).kutas[0].boy, 'Shudra', 'Gemini is air: Shudra');
// Vaśya: Sagittarius is human in the first half and quadruped in the second; Capricorn quadruped in the first and water in the second.
assert.equal(vashyaOf(9, 10), 1); assert.equal(vashyaOf(9, 20), 0); assert.equal(vashyaOf(10, 10), 0); assert.equal(vashyaOf(10, 20), 2);
assert.equal(vashyaOf(5, 5), 3, 'Leo is wild'); assert.equal(vashyaOf(8, 5), 4, 'Scorpio is an insect');
// The other published table is there to compare.
assert.equal(ashtakoota(5, 21).vashyaOther.table, 'astroyogi');
assert.equal(ashtakoota(5, 21, { vashyaTable: 'astroyogi' }).vashyaOther.table, 'saravali');
// Tārā: counts with the remainder 3, 5, 7 are bad, and each way round that is not bad gives 1.5. Boy Krittika (3), girl Ashwini (1): the boy's star is the 3rd from hers
// (Vipat, bad) and hers the 26th from his (remainder 8, good).
const tara = ashtakoota(star(3), star(1));
assert.deepEqual([tara.counts.fromGirl, tara.counts.fromBoy], [3, 26]);
assert.equal(tara.kutas.find(item => item.key === 'tara')!.points, 1.5);
assert.equal(ashtakoota(star(2), star(1)).kutas.find(item => item.key === 'tara')!.points, 3, 'the 2nd and the 27th (remainder 0): both good');
assert.equal(ashtakoota(star(5), star(3)).counts.fromGirl, 3, 'Mrigashira from Krittika: 3, bad');
// Yoni: the sworn enemies get nothing: Ashwini (horse) and Hasta (buffalo).
assert.equal(ashtakoota(star(1), star(13)).kutas.find(item => item.key === 'yoni')!.points, 0);
assert.equal(ashtakoota(star(1), star(24)).kutas.find(item => item.key === 'yoni')!.points, 4, 'Ashwini and Shatabhisha are both horses');
// Bhakoot: 2/12, 5/9 and 6/8 are the doshas, the others give 7.
const bhakoot = (boySign: number, girlSign: number) => ashtakoota((boySign - 1) * 30 + 5, (girlSign - 1) * 30 + 5).kutas.find(item => item.key === 'bhakoot')!.points;
for (const gap of [2, 12, 5, 9, 6, 8]) assert.equal(bhakoot(((gap - 1) % 12) + 1, 1), 0, `sign ${gap} from Aries`);
for (const gap of [1, 3, 4, 7, 10, 11]) assert.equal(bhakoot(gap, 1), 7, `sign ${gap} from Aries`);
// … and it does not depend on which of the two is the boy.
for (let a = 1; a <= 12; a += 1) for (let b = 1; b <= 12; b += 1) assert.equal(bhakoot(a, b), bhakoot(b, a), `${a} ${b}`);
// Nāḍī: the same Nāḍī (Ashwini and Ardra are both Ādi) is 0 and the dosha.
const nadi = ashtakoota(star(1), star(6));
assert.equal(nadi.kutas.find(item => item.key === 'nadi')!.points, 0);
assert.equal(nadi.doshas.nadi, true);
// Gaṇa by Muhūrta Cintāmaṇi (the default): the same gaṇa 6; Deva with Manuṣya 5, 4 where the woman is the Deva and the man the human; Deva or Manuṣya with a Rākṣasa
// woman nothing; a Rākṣasa man with a Deva woman 2 and with a human woman 1.
const gana = (boy: number, girl: number, ganaTable?: 'muhurta' | 'common') => ashtakoota(star(boy), star(girl), { ganaTable }).kutas.find(item => item.key === 'gana')!.points;
const DEVA = 1, MANUSHYA = 2, RAKSHASA = 3; // Ashwini, Bharani, Krittika
assert.deepEqual([gana(DEVA, DEVA), gana(MANUSHYA, MANUSHYA), gana(RAKSHASA, RAKSHASA)], [6, 6, 6]);
assert.equal(gana(DEVA, MANUSHYA), 5, 'the boy a Deva, the girl a human');
assert.equal(gana(MANUSHYA, DEVA), 4, 'the girl a Deva, the boy a human');
assert.equal(gana(RAKSHASA, DEVA), 2, 'a Rākṣasa man with a Deva woman');
assert.equal(gana(RAKSHASA, MANUSHYA), 1, 'a Rākṣasa man with a human woman');
assert.equal(gana(DEVA, RAKSHASA), 0, 'a Deva man with a Rākṣasa woman');
assert.equal(gana(MANUSHYA, RAKSHASA), 0, 'a human man with a Rākṣasa woman (his death, say Nārada and Kaśyapa)');
// The common table (PyJHora's) differs in four cells.
assert.deepEqual([gana(MANUSHYA, DEVA, 'common'), gana(RAKSHASA, DEVA, 'common'), gana(RAKSHASA, MANUSHYA, 'common'), gana(DEVA, RAKSHASA, 'common')], [6, 0, 0, 1]);
assert.equal(ashtakoota(star(DEVA), star(RAKSHASA)).ganaOther.table, 'common');
assert.equal(ashtakoota(star(DEVA), star(RAKSHASA)).ganaOther.points, 1);
assert.equal(ashtakoota(star(RAKSHASA), star(DEVA)).doshas.gana, false, 'two points are not the dosha');
assert.equal(ashtakoota(star(DEVA), star(RAKSHASA)).doshas.gana, true, 'a Deva man with a Rākṣasa woman: 0, the dosha');

// Maitri: Sun with Venus (enemies) 0; Mars and Jupiter (friends) 5; Mercury–Jupiter 0.5.
const maitri = (boySign: number, girlSign: number) => ashtakoota((boySign - 1) * 30 + 5, (girlSign - 1) * 30 + 5).kutas.find(item => item.key === 'maitri')!.points;
assert.equal(maitri(5, 2), 0, 'Leo (Sun) and Taurus (Venus)');
assert.equal(maitri(1, 9), 5, 'Aries (Mars) and Sagittarius (Jupiter)');
assert.equal(maitri(3, 9), 0.5, 'Gemini (Mercury) and Sagittarius (Jupiter)');

// The extras. Mahendra: 4, 7, 10 … 25 from the girl's star. Vedha: the fourteen pairs, both ways round. Rajju: the same part of the body fails. Strī-dīrgha: over 13.
assert.equal(ashtakoota(star(5), star(2)).extras.mahendra, true, 'the 4th');
assert.equal(ashtakoota(star(4), star(2)).extras.mahendra, false, 'the 3rd');
assert.equal(ashtakoota(star(25), star(1)).extras.mahendra, true, 'the 25th');
assert.equal(ashtakoota(star(26), star(1)).extras.mahendra, false, 'the 26th');
for (const [a, b] of VEDHA_PAIRS) {
  assert.equal(ashtakoota(star(a), star(b)).extras.vedha, false, `${a} and ${b}`);
  assert.equal(ashtakoota(star(b), star(a)).extras.vedha, false, `${b} and ${a}`);
}
assert.equal(VEDHA_PAIRS.length, 14);
assert.equal(ashtakoota(star(1), star(2)).extras.vedha, true);
assert.equal(ashtakoota(star(1), star(9)).extras.rajju, false, 'Ashwini and Ashlesha are both the foot');
assert.equal(ashtakoota(star(1), star(2)).extras.rajju, true);
assert.equal(ashtakoota(star(15), star(1)).extras.striDirgha, true, 'the boy’s star the 15th from hers');
assert.equal(ashtakoota(star(13), star(1)).extras.striDirgha, false, 'the 13th is not over 13');
assert.equal(ashtakoota(star(14), star(1)).extras.striDirgha, true, 'the 14th is');

// Whatever the pair, the total is the sum of the eight and within 36; the best possible is 36.
for (let boy = 0; boy < 360; boy += 7.3) for (let girl = 0; girl < 360; girl += 11.7) {
  const result = ashtakoota(boy, girl);
  assert.equal(result.kutas.length, 8);
  assert.equal(result.total, result.kutas.reduce((sum, item) => sum + item.points, 0));
  assert.ok(result.total >= 0 && result.total <= 36);
  assert.ok(result.kutas.every(item => item.points >= 0 && item.points <= item.max), 'each kūṭa within its maximum');
}
assert.equal(ashtakoota(5, 5).kutas.reduce((sum, item) => sum + item.max, 0), 36);

// Kuja dosha (the popular rule): Mars in the 1st, 2nd, 4th, 7th, 8th or 12th from the Lagna or the Moon.
const dosha = kujaDosha({ lagna: 1, moon: 5, venus: 7, mars: 4 }); // Mars in the 4th from the Lagna, the 12th from the Moon, the 10th from Venus
assert.deepEqual([dosha.fromLagna, dosha.fromMoon, dosha.fromVenus, dosha.lagna, dosha.moon, dosha.any], [4, 12, 10, true, true, true]);
const none = kujaDosha({ lagna: 1, moon: 1, venus: 1, mars: 3 }); // the 3rd
assert.equal(none.any, false);
assert.equal(kujaBalance(none, none), 'none');
assert.equal(kujaBalance(dosha, dosha), 'balanced');
assert.equal(kujaBalance(dosha, none), 'one-sided');
assert.equal(kujaBalance(none, dosha), 'one-sided');
// Only from the Moon counts when the Lagna has none: Mars in the 7th from the Moon.
assert.deepEqual([kujaDosha({ lagna: 1, moon: 5, venus: 1, mars: 11 }).lagna, kujaDosha({ lagna: 1, moon: 5, venus: 1, mars: 11 }).moon], [false, true]);

console.log('Ashtakoota tests passed');
