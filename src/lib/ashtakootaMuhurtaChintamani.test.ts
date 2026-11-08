import assert from 'node:assert/strict';
import { ashtakoota, countStars } from './ashtakoota';
import { NATURAL_ENEMIES, NATURAL_FRIENDS } from './dignity';
import { SIGN_LORDS } from './signs';
import { NAKSHATRA_SIZE } from './nakshatras';

// The Ashtakoota against what Muhūrta Cintāmaṇi says in its Vivāha Prakaraṇa (6.21–6.34), read in the scan of the Nirṇaya Sāgara edition (the Pīyūṣadhārā
// of Govinda, 1603, on archive.org: in.ernet.dli.2015.553968) and in the Hindi commentary of Mahīdhara Śarmā. The lists below are typed in from those pages,
// not taken from the code, so a table that drifts from the text fails here.

const star = (n: number) => (n - 1) * NAKSHATRA_SIZE + 1;
const sign = (n: number) => (n - 1) * 30 + 5;
const kuta = (key: string, boyLongitude: number, girlLongitude: number) => ashtakoota(boyLongitude, girlLongitude).kutas.find(item => item.key === key)!;
const boySide = (key: string, longitude: number) => kuta(key, longitude, longitude).boy;

// 6.21: "varṇo vaśyaṃ tathā tārā yoniś ca grahamaitrakam / gaṇamaitraṃ bhakūṭaṃ ca nāḍī caite guṇādhikāḥ": one, two, three … eight points, 36 in all.
const best = ashtakoota(star(1), star(1));
assert.deepEqual(best.kutas.map(item => item.key), ['varna', 'vashya', 'tara', 'yoni', 'maitri', 'gana', 'bhakoot', 'nadi']);
assert.deepEqual(best.kutas.map(item => item.max), [1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(best.max, 36);

// 6.22 Varṇa: Pisces, Scorpio, Cancer Brahmin; Aries, Leo, Sagittarius Kṣatriya; Taurus, Virgo, Capricorn Vaiśya; Gemini, Libra, Aquarius Śūdra.
const VARNAS: Record<string, number[]> = { Brahmin: [12, 8, 4], Kshatriya: [1, 5, 9], Vaishya: [2, 6, 10], Shudra: [3, 7, 11] };
for (const [name, signs] of Object.entries(VARNAS)) for (const n of signs) assert.equal(boySide('varna', sign(n)), name, `sign ${n}`);
// The groom's varṇa must not be lower than the bride's ("varasya varṇato 'dhikā vadhūr na śasyate budhaiḥ"): a Brahmin groom with a Śūdra bride 1, the reverse 0; the same varṇa 1.
assert.equal(kuta('varna', sign(12), sign(3)).points, 1);
assert.equal(kuta('varna', sign(3), sign(12)).points, 0);
assert.equal(kuta('varna', sign(1), sign(5)).points, 1);

// 6.24 Tārā: the stars counted from the bride's to the groom's and from the groom's to the bride's, each count divided by nine; the remainders 3, 5 and 7 are not good.
// Three points when neither is bad, half of that when one is (Daivajñamanohara), nothing when both are.
for (let girl = 1; girl <= 27; girl += 1) for (let boy = 1; boy <= 27; boy += 1) {
  const good = (count: number) => ![3, 5, 7].includes(count % 9);
  const expected = (good(countStars(girl, boy)) ? 1.5 : 0) + (good(countStars(boy, girl)) ? 1.5 : 0);
  assert.equal(kuta('tara', star(boy), star(girl)).points, expected, `boy ${boy}, girl ${girl}`);
}

// 6.25–26 Yoni (the stars by the animal): Ashwini and Shatabhisha horse; Swati and Hasta buffalo; Dhanishta and Purva Bhadrapada lion; Bharani and Revati elephant; Pushya and
// Krittika sheep; Shravana and Purva Ashadha monkey; Uttara Ashadha (and Abhijit) mongoose; Rohini and Mrigashira serpent; Jyeshtha and Anuradha deer; Mula and Ardra dog;
// Punarvasu and Ashlesha cat; Magha and Purva Phalguni rat; Vishakha and Chitra tiger; Uttara Phalguni and Uttara Bhadrapada cow.
const YONIS: Record<string, number[]> = {
  Horse: [1, 24], Buffalo: [15, 13], Lion: [23, 25], Elephant: [2, 27], Sheep: [8, 3], Monkey: [22, 20], Mongoose: [21], Serpent: [4, 5],
  Deer: [18, 17], Dog: [19, 6], Cat: [7, 9], Rat: [10, 11], Tiger: [16, 14], Cow: [12, 26],
};
for (const [animal, stars] of Object.entries(YONIS)) for (const n of stars) assert.equal(boySide('yoni', star(n)), animal, `star ${n}`);
assert.equal(Object.values(YONIS).flat().length, 27, 'all 27 stars have a yoni');
// The sworn enemies (Vasiṣṭha): horse–buffalo, elephant–lion, sheep–monkey, serpent–mongoose, dog–deer, cat–rat, cow–tiger: nothing; the same yoni is the most.
const ENEMIES: [string, string][] = [['Horse', 'Buffalo'], ['Elephant', 'Lion'], ['Sheep', 'Monkey'], ['Serpent', 'Mongoose'], ['Dog', 'Deer'], ['Cat', 'Rat'], ['Cow', 'Tiger']];
const starOf = (animal: string) => YONIS[animal][0];
for (const [a, b] of ENEMIES) {
  assert.equal(kuta('yoni', star(starOf(a)), star(starOf(b))).points, 0, `${a} and ${b}`);
  assert.equal(kuta('yoni', star(starOf(b)), star(starOf(a))).points, 0, `${b} and ${a}`);
}
for (const animal of Object.keys(YONIS)) assert.equal(kuta('yoni', star(starOf(animal)), star(starOf(animal))).points, 4, `${animal} with itself`);

// 6.27–28 Graha Maitrī: the friendships of the grahas, typed from the verses (Sun's friends Moon, Mars, Jupiter, enemies Venus, Saturn; …), and they are those of the app.
const FRIENDS: Record<string, string[]> = {
  Sun: ['Moon', 'Mars', 'Jupiter'], Moon: ['Sun', 'Mercury'], Mars: ['Sun', 'Moon', 'Jupiter'], Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'], Venus: ['Mercury', 'Saturn'], Saturn: ['Mercury', 'Venus'],
};
const FOES: Record<string, string[]> = {
  Sun: ['Venus', 'Saturn'], Moon: [], Mars: ['Mercury'], Mercury: ['Moon'], Jupiter: ['Mercury', 'Venus'], Venus: ['Sun', 'Moon'], Saturn: ['Sun', 'Moon', 'Mars'],
};
for (const planet of Object.keys(FRIENDS)) {
  assert.deepEqual([...NATURAL_FRIENDS[planet]].sort(), [...FRIENDS[planet]].sort(), `${planet}'s friends`);
  assert.deepEqual([...NATURAL_ENEMIES[planet]].sort(), [...FOES[planet]].sort(), `${planet}'s enemies`);
}
// The points (Daivajñamanohara in the Pīyūṣadhārā): the same lord or friends both ways 5; a friend and a neutral 4; two neutrals 3; a friend and an enemy 1; a neutral and
// an enemy a half; enemies both ways nothing.
const relation = (from: string, to: string) => (FRIENDS[from].includes(to) ? 'friend' : FOES[from].includes(to) ? 'enemy' : 'neutral');
const maitriPoints = (a: string, b: string): number => {
  if (a === b) return 5;
  const pair = [relation(a, b), relation(b, a)].sort().join('+');
  return ({ 'friend+friend': 5, 'friend+neutral': 4, 'neutral+neutral': 3, 'enemy+friend': 1, 'enemy+neutral': 0.5, 'enemy+enemy': 0 } as Record<string, number>)[pair];
};
for (let boy = 1; boy <= 12; boy += 1) for (let girl = 1; girl <= 12; girl += 1) {
  assert.equal(kuta('maitri', sign(boy), sign(girl)).points, maitriPoints(SIGN_LORDS[boy - 1], SIGN_LORDS[girl - 1]), `boy sign ${boy}, girl sign ${girl}`);
}

// 6.29 Gaṇa: Rākṣasa Magha, Ashlesha, Dhanishta, Jyeshtha, Mula, Shatabhisha, Krittika, Chitra, Vishakha; Manuṣya the three Pūrva and the three Uttara, Rohini, Bharani,
// Ardra; Deva Anuradha, Punarvasu, Mrigashira, Shravana, Revati, Swati, Ashwini, Pushya, Hasta.
const GANAS: Record<string, number[]> = {
  Rakshasa: [10, 9, 23, 18, 19, 24, 3, 14, 16], Manushya: [11, 20, 25, 12, 21, 26, 4, 2, 6], Deva: [17, 7, 5, 22, 27, 15, 1, 8, 13],
};
for (const [name, stars] of Object.entries(GANAS)) for (const n of stars) assert.equal(boySide('gana', star(n)), name, `star ${n}`);
assert.equal(Object.values(GANAS).flat().length, 27);

// 6.31 Bhakoot: death at the sixth and eighth, the loss of children at the fifth and ninth, poverty at the second and twelfth; the other places give happiness.
for (const place of [6, 8, 5, 9, 2, 12]) assert.equal(kuta('bhakoot', sign(1), sign(place)).points, 0, `sign ${place} from Aries`);
for (const place of [1, 3, 4, 7, 10, 11]) assert.equal(kuta('bhakoot', sign(1), sign(place)).points, 7, `sign ${place} from Aries`);

// 6.34 Nāḍī: Ādi Ashwini, Ardra, Punarvasu, Uttara Phalguni, Hasta, Jyeshtha, Mula, Shatabhisha, Purva Bhadrapada; Madhya Bharani, Mrigashira, Pushya, Purva Phalguni, Chitra,
// Anuradha, Purva Ashadha, Dhanishta, Uttara Bhadrapada; Antya Krittika, Rohini, Ashlesha, Magha, Swati, Vishakha, Uttara Ashadha, Shravana, Revati.
const NADIS: Record<string, number[]> = {
  Adi: [1, 6, 7, 12, 13, 18, 19, 24, 25], Madhya: [2, 5, 8, 11, 14, 17, 20, 23, 26], Antya: [3, 4, 9, 10, 15, 16, 21, 22, 27],
};
for (const [name, stars] of Object.entries(NADIS)) for (const n of stars) assert.equal(boySide('nadi', star(n)), name, `star ${n}`);
assert.equal(Object.values(NADIS).flat().length, 27);
// One Nāḍī is the dosha ("daṃpatyor eka-nāḍyāṃ pariṇayanam asat"): nothing for the same, eight for different ones.
assert.equal(kuta('nadi', star(1), star(6)).points, 0);
assert.equal(kuta('nadi', star(1), star(2)).points, 8);

console.log('Ashtakoota against Muhurta Chintamani passed');
