// Two strengths of the Tājika annual chart that the Pañcavargīya Bala (varshaphala.ts) leaves out: the Dvādaśavargīya Bala and
// the Harṣa Bala.
//
// Source: Balabhadra's Hāyanaratna (the English translation of Martin Gansten, 2020), chapter 2 §8 and §9, which quotes the
// Tājika texts: for the twelve dignities Vāmana, the Saṃjñātantra (Nīlakaṇṭha), Maṇittha's Varṣaphala 51–60 and the
// Tājikayogasudhānidhi 4.10; for the joys Tejaḥsiṃha's Daivajñālaṅkṛti 7.1–2, Samarasiṃha's Tājikaśāstra, the Paddhatibhūṣaṇa 20
// and the Tājikayogasudhānidhi 4.36–37. The rules are written out in docs/tajika-bala-sources.md.

import { normalizeDegrees } from './angles';
import { SIGN_LORDS } from './signs';
import { DEBILITATION, EXALTATION, NATURAL_ENEMIES, NATURAL_FRIENDS, OWN_SIGNS } from './dignity';

export const SEVEN_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type SevenGraha = typeof SEVEN_GRAHAS[number];

// ── The twelve dignities (dvādaśavargī) ────────────────────────────────

export type TajikaDivisionKey =
  | 'griha' | 'hora' | 'dreshkana' | 'padamsa' | 'panchamsa' | 'shashthamsa'
  | 'saptamsa' | 'ashtamsa' | 'navamsa' | 'dashamsa' | 'rudramsa' | 'dvadasamsa';

export interface TajikaDivision {
  key: TajikaDivisionKey;
  /** How many parts a sign is divided in. */
  parts: number;
  /** The part of the sign the longitude stands in, from 1. */
  part: number;
  /** The graha that rules the part. */
  ruler: SevenGraha;
  /** The sign of the part (1–12) where the division gives one; the hora and the fifth-part give a ruler only. */
  sign?: number;
}

const DIVISIONS: [TajikaDivisionKey, number][] = [
  ['griha', 1], ['hora', 2], ['dreshkana', 3], ['padamsa', 4], ['panchamsa', 5], ['shashthamsa', 6],
  ['saptamsa', 7], ['ashtamsa', 8], ['navamsa', 9], ['dashamsa', 10], ['rudramsa', 11], ['dvadasamsa', 12],
];

const FIFTH_PART_ODD: SevenGraha[] = ['Mars', 'Saturn', 'Jupiter', 'Mercury', 'Venus'];
const lordOf = (signIndex: number): SevenGraha => SIGN_LORDS[((signIndex % 12) + 12) % 12] as SevenGraha;

/**
 * The twelve divisions of a longitude by the verses of the Hāyanaratna §8. The sixth, eighth, tenth and eleventh parts (and the
 * ninth) run on in one cycle round the zodiac from Aries: the part k of the zodiac belongs to the sign k mod 12.
 */
export function tajikaDivisions(longitude: number): TajikaDivision[] {
  const lon = normalizeDegrees(longitude);
  const sign = Math.floor(lon / 30);
  const within = lon - sign * 30;
  const odd = sign % 2 === 0; // Aries, Gemini … are the odd signs
  return DIVISIONS.map(([key, parts]) => {
    const index = Math.min(parts - 1, Math.floor(within / (30 / parts)));
    const make = (target: number): TajikaDivision => ({ key, parts, part: index + 1, ruler: lordOf(target), sign: ((target % 12) + 12) % 12 + 1 });
    switch (key) {
      case 'griha': return make(sign);
      case 'hora': return { key, parts, part: index + 1, ruler: (odd ? index === 0 : index === 1) ? 'Sun' : 'Moon' };
      case 'dreshkana': return make(sign + 4 * index); // the signs of the 1st, 5th and 9th
      case 'padamsa': return make(sign + 3 * index); // the signs of the angles
      case 'panchamsa': return { key, parts, part: index + 1, ruler: odd ? FIFTH_PART_ODD[index] : FIFTH_PART_ODD[4 - index] };
      case 'saptamsa': return make(odd ? sign + index : sign + 6 + index);
      case 'dvadasamsa': return make(sign + index);
      default: return make(sign * parts + index);
    }
  });
}

export interface DvadashavargiyaItem extends TajikaDivision {
  /** Why the division is good for the graha (it may be both good and evil). */
  good: string[];
  evil: string[];
}

export interface DvadashavargiyaBala {
  planet: SevenGraha;
  divisions: DvadashavargiyaItem[];
  good: number;
  evil: number;
  /** The good divisions less the evil ones: −12 to 12. */
  total: number;
}

/** The natural benefics for this reading: Jupiter, Venus and Mercury, and the Moon while she waxes; the others are malefic. */
export function isBeneficGraha(planet: SevenGraha, moonWaxing: boolean): boolean {
  if (planet === 'Moon') return moonWaxing;
  return planet === 'Jupiter' || planet === 'Venus' || planet === 'Mercury';
}

/**
 * The Dvādaśavargīya Bala of a graha. In each of its twelve divisions the ruler is judged against it (Hāyanaratna §8): the
 * divisions of its own ruling, of a friend, of a benefic or of its exaltation are good; those of its fall, of an enemy or of a
 * malefic are evil, "examining both kinds of results and subtracting the one from the other". One division can be both (a friend
 * who is a malefic). The text gives the points as a hundred in the domicile, half in a friend's and so on (Tājikayogasudhānidhi 4.10)
 * but the sentence is not clear enough to weigh the divisions by it, so they are counted.
 */
export function dvadashavargiyaBala(planet: SevenGraha, longitude: number, moonWaxing: boolean): DvadashavargiyaBala {
  const divisions = tajikaDivisions(longitude).map<DvadashavargiyaItem>((division) => {
    const good: string[] = [];
    const evil: string[] = [];
    if (division.ruler === planet) good.push('own');
    if (NATURAL_FRIENDS[planet].includes(division.ruler)) good.push('friend');
    if (NATURAL_ENEMIES[planet].includes(division.ruler)) evil.push('enemy');
    if (division.ruler !== planet) (isBeneficGraha(division.ruler, moonWaxing) ? good : evil).push(isBeneficGraha(division.ruler, moonWaxing) ? 'benefic' : 'malefic');
    if (division.sign === EXALTATION[planet]) good.push('exaltation');
    if (division.sign === DEBILITATION[planet]) evil.push('fall');
    return { ...division, good, evil };
  });
  const good = divisions.filter((division) => division.good.length > 0).length;
  const evil = divisions.filter((division) => division.evil.length > 0).length;
  return { planet, divisions, good, evil, total: good - evil };
}

// ── The joys (harṣa) ───────────────────────────────────────────────────

/** The house of joy of each graha, in the order Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn (Tājikayogasudhānidhi 4.36). */
export const HARSHA_HOUSES: Record<SevenGraha, number> = { Sun: 9, Moon: 3, Mars: 6, Mercury: 1, Jupiter: 11, Venus: 5, Saturn: 12 };

/** The male grahas; the others (the Moon, Mercury, Venus and Saturn) are female for the joys, as in the worked example of P.V.R. Narasimha Rao. */
export const MALE_GRAHAS: readonly SevenGraha[] = ['Sun', 'Mars', 'Jupiter'];

/** The houses "by threes from the ascendant": 1–3 and 7–9 for the female grahas, 4–6 and 10–12 for the male. */
const FEMALE_HOUSES = [1, 2, 3, 7, 8, 9];

export interface HarshaBala {
  planet: SevenGraha;
  /** In its house of joy. */
  sthana: number;
  /** In its own sign (or, by Tejaḥsiṃha, its exaltation). */
  svagriha: number;
  /** In its group of three houses by its sex. */
  trika: number;
  /** A male graha in a year that begins by day, a female graha in one that begins by night. */
  dinaRatri: number;
  /** At most 20. */
  total: number;
}

export interface HarshaOptions {
  /** Whether the exaltation sign gives the second joy as well as the own sign (Tejaḥsiṃha); Samarasiṃha allows the own sign only. */
  exaltationCounts?: boolean;
}

export const HARSHA_POINTS = 5; // Paddhatibhūṣaṇa 20

/**
 * The Harṣa Bala of a graha from its house (counted from the lagna of the annual chart) and sign: five points for each of
 * the four places of joy it stands in.
 */
export function harshaBala(planet: SevenGraha, house: number, sign: number, dayYear: boolean, options: HarshaOptions = {}): HarshaBala {
  const male = MALE_GRAHAS.includes(planet);
  const sthana = HARSHA_HOUSES[planet] === house ? HARSHA_POINTS : 0;
  const own = OWN_SIGNS[planet].includes(sign) || ((options.exaltationCounts ?? true) && EXALTATION[planet] === sign);
  const svagriha = own ? HARSHA_POINTS : 0;
  const inFemaleHouses = FEMALE_HOUSES.includes(house);
  const trika = (male ? !inFemaleHouses : inFemaleHouses) ? HARSHA_POINTS : 0;
  const dinaRatri = (male ? dayYear : !dayYear) ? HARSHA_POINTS : 0;
  return { planet, sthana, svagriha, trika, dinaRatri, total: sthana + svagriha + trika + dinaRatri };
}
