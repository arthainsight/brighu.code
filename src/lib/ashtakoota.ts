// Ashtakoota (Aṣṭakūṭa), the eight-fold matching of two birth charts by their Moons, 36 points, and the four extra matchings
// (Mahendra, Vedha, Rajju, Strī-dīrgha) that the Southern tradition and Kala also show. The tables are those published in the common
// practice of North India; no single classical verse gives all eight, so each choice is named in docs/ashtakoota-sources.md, and the
// cross-check against PyJHora (pyjhoraMatching.test.ts) lists where PyJHora's tables differ and which side the app takes.
//
// A pair is a "boy" and a "girl" because the tables are not symmetric: the groom's varṇa must not be lower than the bride's, the Tārā is
// counted from the bride's star, and so on. The app takes the first chart as the boy and the second as the girl and says so.

import { NAKSHATRA_SIZE } from './nakshatras';
import { normalizeDegrees } from './angles';

export interface MoonSign {
  /** 1 to 27. */
  nakshatra: number;
  /** 1 to 4. */
  pada: number;
  /** 1 (Aries) to 12. */
  rasi: number;
  /** Degrees into the sign. */
  degree: number;
}

/** The star, the quarter and the sign of a sidereal longitude. */
export function moonSign(longitude: number): MoonSign {
  const lon = normalizeDegrees(longitude);
  const nakshatra = Math.min(26, Math.floor(lon / NAKSHATRA_SIZE));
  const pada = Math.min(3, Math.floor((lon - nakshatra * NAKSHATRA_SIZE) / (NAKSHATRA_SIZE / 4)));
  return { nakshatra: nakshatra + 1, pada: pada + 1, rasi: Math.floor(lon / 30) + 1, degree: lon % 30 };
}

/** The count of stars from one to another, both included: the same star is 1, the next 2, the one before 27. */
export const countStars = (from: number, to: number): number => ((to - from + 27) % 27) + 1;
/** The count of signs from one to another, both included. */
export const countSigns = (from: number, to: number): number => ((to - from + 12) % 12) + 1;

// ── The tables ─────────────────────────────────────────────────────────

/** Varṇa of each sign, Aries first: 0 Brahmin (the water signs), 1 Kṣatriya (fire), 2 Vaiśya (earth), 3 Śūdra (air). */
const VARNA_OF_SIGN = [1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0];
export const VARNA_NAMES = ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra'] as const;

/** Vaśya of a sign: 0 quadruped, 1 human, 2 water, 3 wild, 4 insect; Sagittarius and Capricorn change in the middle of the sign. */
export const VASHYA_NAMES = ['Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Keeta'] as const;
export function vashyaOf(rasi: number, degree: number): number {
  if (rasi === 1 || rasi === 2) return 0;
  if (rasi === 3 || rasi === 6 || rasi === 7 || rasi === 11) return 1;
  if (rasi === 4 || rasi === 12) return 2;
  if (rasi === 5) return 3;
  if (rasi === 8) return 4;
  if (rasi === 9) return degree < 15 ? 1 : 0;
  return degree < 15 ? 0 : 2; // Capricorn: the first half quadruped, the second water
}
export type VashyaTable = 'saravali' | 'astroyogi';
/** [girl][boy], 0 to 2. The first is the table of saravali.de (as PyJHora has it), the second that of astroyogi.com. */
const VASHYA_TABLES: Record<VashyaTable, number[][]> = {
  saravali: [[2, 0.5, 1, 0, 2], [0.5, 2, 0, 0, 0], [1, 0, 2, 2, 2], [0, 0, 2, 2, 0], [1, 0, 1, 0, 2]],
  astroyogi: [[2, 1, 1, 1.5, 1], [1, 2, 1.5, 0, 1], [1, 1.5, 2, 1, 1], [0, 0, 0, 2, 0], [1, 1, 1, 0, 2]],
};

/** Gaṇa of the 27 stars: 0 Deva, 1 Manuṣya, 2 Rākṣasa. */
const GANA_OF_STAR = [0, 1, 2, 1, 0, 1, 0, 0, 2, 2, 1, 1, 0, 2, 0, 2, 0, 2, 2, 1, 1, 0, 2, 2, 1, 1, 0];
export const GANA_NAMES = ['Deva', 'Manushya', 'Rakshasa'] as const;
/** [girl][boy]. */
const GANA_TABLE = [[6, 6, 0], [5, 6, 0], [1, 0, 6]];

/** The yoni (the animal) of the 27 stars, an index into YONI_NAMES. */
const YONI_OF_STAR = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1];
export const YONI_NAMES = ['Horse', 'Elephant', 'Sheep', 'Serpent', 'Dog', 'Cat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Deer', 'Monkey', 'Mongoose', 'Lion'] as const;
/** [girl][boy]: 4 for the same animal, 0 for the sworn enemies (horse–buffalo, elephant–lion, sheep–monkey, serpent–mongoose, dog–deer, cat–rat, cow–tiger). */
const YONI_TABLE = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 1, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [1, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4],
];

/** The lord of each sign as an index into MAITRI_TABLE: Sun 0, Moon 1, Mars 2, Mercury 3, Jupiter 4, Venus 5, Saturn 6. */
const LORD_OF_SIGN = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
export const LORD_NAMES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
/** [girl's lord][boy's lord], 0 to 5. */
const MAITRI_TABLE = [
  [5, 5, 5, 4, 5, 0, 0],
  [5, 5, 4, 1, 4, 0.5, 0.5],
  [5, 4, 5, 0.5, 5, 3, 0.5],
  [4, 1, 0.5, 5, 0.5, 5, 4],
  [5, 4, 5, 0.5, 5, 0.5, 3],
  [0, 0.5, 3, 5, 0.5, 5, 5],
  [0, 0.5, 0.5, 4, 3, 5, 5],
];

/** Nāḍī of the 27 stars: 0 Ādi, 1 Madhya, 2 Antya, running to and fro: 0 1 2 2 1 0 0 1 2 2 1 0 … */
const NADI_OF_STAR = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2];
export const NADI_NAMES = ['Adi', 'Madhya', 'Antya'] as const;

/** The Rajju (the part of the body) of each of the stars: 0 foot, 1 waist, 2 stomach, 3 neck, 4 head. */
const RAJJU_OF_STAR = [0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4, 3, 2, 1, 0];
export const RAJJU_NAMES = ['Foot (Pada)', 'Waist (Kati)', 'Stomach (Nabhi)', 'Neck (Kantha)', 'Head (Shiro)'] as const;

/** The pairs of stars that obstruct one another (Vedha), by their numbers: the fourteen of the tradition. */
export const VEDHA_PAIRS: readonly (readonly [number, number])[] = [
  [1, 18], [2, 17], [3, 16], [4, 15], [5, 14], [5, 23], [6, 22], [7, 21], [8, 20], [9, 19], [10, 27], [11, 26], [12, 25], [13, 24],
];

/** The counts of the boy's star from the girl's that give Mahendra. */
export const MAHENDRA_COUNTS: readonly number[] = [4, 7, 10, 13, 16, 19, 22, 25];
/** Strī-dīrgha wants the boy's star more than this many stars from the girl's. */
export const STRI_DIRGHA_MIN_COUNT = 13;

// ── The matching ───────────────────────────────────────────────────────

export type KutaKey = 'varna' | 'vashya' | 'tara' | 'yoni' | 'maitri' | 'gana' | 'bhakoot' | 'nadi';

export interface Kuta {
  key: KutaKey;
  points: number;
  max: number;
  /** What the boy and the girl have in this kūṭa, in words (the varṇa, the animal, …). */
  boy: string;
  girl: string;
}

export interface AshtakootaOptions {
  vashyaTable?: VashyaTable;
}

export interface Ashtakoota {
  boy: MoonSign;
  girl: MoonSign;
  kutas: Kuta[];
  total: number;
  max: 36;
  /** The Vaśya by the other published table, for comparing (the total uses the one chosen). */
  vashyaOther: { table: VashyaTable; points: number };
  doshas: { nadi: boolean; bhakoot: boolean; gana: boolean };
  /** The four matchings of the Southern tradition, each passed or not. */
  extras: { mahendra: boolean; vedha: boolean; rajju: boolean; striDirgha: boolean };
  /** The counts the Tārā, the Mahendra and the Strī-dīrgha read: the boy's star from the girl's and the girl's from the boy's. */
  counts: { fromGirl: number; fromBoy: number };
}

const TARA_BAD = new Set([3, 5, 7]);

export function ashtakoota(boyLongitude: number, girlLongitude: number, options: AshtakootaOptions = {}): Ashtakoota {
  const boy = moonSign(boyLongitude);
  const girl = moonSign(girlLongitude);
  const table = options.vashyaTable ?? 'saravali';
  const otherTable: VashyaTable = table === 'saravali' ? 'astroyogi' : 'saravali';

  const boyVarna = VARNA_OF_SIGN[boy.rasi - 1];
  const girlVarna = VARNA_OF_SIGN[girl.rasi - 1];
  const boyVashya = vashyaOf(boy.rasi, boy.degree);
  const girlVashya = vashyaOf(girl.rasi, girl.degree);
  const fromGirl = countStars(girl.nakshatra, boy.nakshatra);
  const fromBoy = countStars(boy.nakshatra, girl.nakshatra);
  const taraGood = (count: number) => (TARA_BAD.has(count % 9) ? 0 : 1.5);
  const boyGana = GANA_OF_STAR[boy.nakshatra - 1];
  const girlGana = GANA_OF_STAR[girl.nakshatra - 1];
  const boyYoni = YONI_OF_STAR[boy.nakshatra - 1];
  const girlYoni = YONI_OF_STAR[girl.nakshatra - 1];
  const boyLord = LORD_OF_SIGN[boy.rasi - 1];
  const girlLord = LORD_OF_SIGN[girl.rasi - 1];
  const signDistance = countSigns(girl.rasi, boy.rasi);
  const boyNadi = NADI_OF_STAR[boy.nakshatra - 1];
  const girlNadi = NADI_OF_STAR[girl.nakshatra - 1];

  const kutas: Kuta[] = [
    { key: 'varna', points: boyVarna <= girlVarna ? 1 : 0, max: 1, boy: VARNA_NAMES[boyVarna], girl: VARNA_NAMES[girlVarna] },
    { key: 'vashya', points: VASHYA_TABLES[table][girlVashya][boyVashya], max: 2, boy: VASHYA_NAMES[boyVashya], girl: VASHYA_NAMES[girlVashya] },
    { key: 'tara', points: taraGood(fromGirl) + taraGood(fromBoy), max: 3, boy: String(fromBoy), girl: String(fromGirl) },
    { key: 'yoni', points: YONI_TABLE[girlYoni][boyYoni], max: 4, boy: YONI_NAMES[boyYoni], girl: YONI_NAMES[girlYoni] },
    { key: 'maitri', points: MAITRI_TABLE[girlLord][boyLord], max: 5, boy: LORD_NAMES[boyLord], girl: LORD_NAMES[girlLord] },
    { key: 'gana', points: GANA_TABLE[girlGana][boyGana], max: 6, boy: GANA_NAMES[boyGana], girl: GANA_NAMES[girlGana] },
    { key: 'bhakoot', points: [2, 12, 5, 9, 6, 8].includes(signDistance) ? 0 : 7, max: 7, boy: String(boy.rasi), girl: String(girl.rasi) },
    { key: 'nadi', points: boyNadi === girlNadi ? 0 : 8, max: 8, boy: NADI_NAMES[boyNadi], girl: NADI_NAMES[girlNadi] },
  ];
  const points = (key: KutaKey) => kutas.find(kuta => kuta.key === key)!.points;

  return {
    boy,
    girl,
    kutas,
    total: kutas.reduce((sum, kuta) => sum + kuta.points, 0),
    max: 36,
    vashyaOther: { table: otherTable, points: VASHYA_TABLES[otherTable][girlVashya][boyVashya] },
    doshas: { nadi: points('nadi') === 0, bhakoot: points('bhakoot') === 0, gana: points('gana') === 0 },
    extras: {
      mahendra: MAHENDRA_COUNTS.includes(fromGirl),
      vedha: !VEDHA_PAIRS.some(([a, b]) => (a === boy.nakshatra && b === girl.nakshatra) || (b === boy.nakshatra && a === girl.nakshatra)),
      rajju: RAJJU_OF_STAR[boy.nakshatra - 1] !== RAJJU_OF_STAR[girl.nakshatra - 1],
      striDirgha: fromGirl > STRI_DIRGHA_MIN_COUNT,
    },
    counts: { fromGirl, fromBoy },
  };
}

// ── Kuja dosha (Manglik) ───────────────────────────────────────────────

/** The houses from which Mars gives the Kuja dosha of the popular rule: the 1st, 2nd, 4th, 7th, 8th and 12th. */
export const KUJA_DOSHA_HOUSES: readonly number[] = [1, 2, 4, 7, 8, 12];

export interface KujaDosha {
  /** Mars's house counted from the Lagna, from the Moon and from Venus. */
  fromLagna: number;
  fromMoon: number;
  fromVenus: number;
  /** The Kuja dosha is there from the Lagna, from the Moon, or from either. */
  lagna: boolean;
  moon: boolean;
  any: boolean;
}

/** Mars's Kuja dosha from the signs of the Lagna, the Moon, Venus and Mars (1 to 12). */
export function kujaDosha(signs: { lagna: number; moon: number; venus: number; mars: number }): KujaDosha {
  const fromLagna = countSigns(signs.lagna, signs.mars);
  const fromMoon = countSigns(signs.moon, signs.mars);
  const fromVenus = countSigns(signs.venus, signs.mars);
  const lagna = KUJA_DOSHA_HOUSES.includes(fromLagna);
  const moon = KUJA_DOSHA_HOUSES.includes(fromMoon);
  return { fromLagna, fromMoon, fromVenus, lagna, moon, any: lagna || moon };
}

/** How two charts' Kuja doshas stand: none, balanced (both have it) or one-sided (only one has it). */
export function kujaBalance(a: KujaDosha, b: KujaDosha): 'none' | 'balanced' | 'one-sided' {
  if (!a.any && !b.any) return 'none';
  return a.any && b.any ? 'balanced' : 'one-sided';
}
