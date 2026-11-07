import type { ChartData } from '@/types';
import { normalizeDegrees as normalize } from './angles';

// Bhāva Chalit: the chart cast by bhāvas instead of by whole signs.
//
// Each bhāva has a madhya (its middle point) and runs from the sandhi (border)
// halfway to the madhya before it to the sandhi halfway to the madhya after it.
// A graha belongs to the bhāva whose span it stands in, which may be the house
// before or after the sign-house it is drawn in at the rāśi.
//
//   Śrīpati: the madhyas are the Porphyry cusps. The Lagna, the 4th (IC), the
//            7th (Descendant) and the 10th (Midheaven) are fixed, and each
//            quadrant between them is divided into three equal arcs.
//   Equal:   the Lagna is the madhya of the 1st bhāva and each next one follows
//            thirty degrees on.
//
// The other systems give cusps that are the beginnings of the bhāvas (the way KP and the Western systems read them): each
// bhāva runs from its cusp to the next one, and its madhya is halfway between.
//   Equal from the Lagna: the Lagna is the beginning of the 1st bhāva.
//   Placidus (the cusps KP uses), Koch, Regiomontanus, Campanus and Alcabitius: the cusps of the Swiss Ephemeris,
//            which the chart carries as `houseCusps`.

export type CuspChalitSystem = 'placidus' | 'koch' | 'regiomontanus' | 'campanus' | 'alcabitius';
export type ChalitSystem = 'sripati' | 'equal' | 'equal-start' | CuspChalitSystem;

/** The systems that read their cusps as the beginnings of the bhāvas. */
export const CUSP_CHALIT_SYSTEMS: readonly CuspChalitSystem[] = ['placidus', 'koch', 'regiomontanus', 'campanus', 'alcabitius'];

/** The distance from a forward to b, 0 to 360. */
const forward = (from: number, to: number) => normalize(to - from);

/** The middle points of the twelve bhāvas, the 1st first; null for Śrīpati without a Midheaven. */
export function bhavaMadhyas(ascendant: number, midheaven: number | undefined, system: ChalitSystem): number[] | null {
  if (system === 'equal') return Array.from({ length: 12 }, (_, index) => normalize(ascendant + index * 30));
  if (midheaven === undefined) return null;
  const imumCoeli = normalize(midheaven + 180);
  const descendant = normalize(ascendant + 180);
  // Cusps 1, 4, 7 and 10 are the angles; the arcs between them are divided in three.
  const quadrants = [
    [ascendant, imumCoeli], // 1 → 4
    [imumCoeli, descendant], // 4 → 7
    [descendant, midheaven], // 7 → 10
    [midheaven, ascendant], // 10 → 1
  ];
  const madhyas: number[] = [];
  for (const [from, to] of quadrants) {
    const arc = forward(from, to);
    madhyas.push(from, normalize(from + arc / 3), normalize(from + (2 * arc) / 3));
  }
  // The list starts at the 1st (index 0), the 4th is index 3, the 7th index 6 and the 10th index 9.
  return madhyas;
}

export interface Bhava {
  house: number;
  madhya: number;
  /** Sandhi at the start of the bhāva and at its end (the start of the next one). */
  start: number;
  end: number;
}

/** The twelve bhāvas with their sandhis. */
export function bhavas(madhyas: number[]): Bhava[] {
  return madhyas.map((madhya, index) => {
    const before = madhyas[(index + 11) % 12];
    const after = madhyas[(index + 1) % 12];
    return {
      house: index + 1,
      madhya,
      start: normalize(before + forward(before, madhya) / 2),
      end: normalize(madhya + forward(madhya, after) / 2),
    };
  });
}

/** The bhāvas that begin at the given cusps (the 1st first). */
export function bhavasFromCusps(cusps: number[]): Bhava[] {
  return cusps.map((cusp, index) => {
    const next = cusps[(index + 1) % 12];
    return { house: index + 1, madhya: normalize(cusp + forward(cusp, next) / 2), start: normalize(cusp), end: normalize(next) };
  });
}

/** The twelve bhāvas of a chart by a system, or null when the chart lacks what the system needs (the Midheaven, or the cusps). */
export function chartBhavas(chart: Pick<ChartData, 'ascendant' | 'midheaven' | 'houseCusps'>, system: ChalitSystem): Bhava[] | null {
  if (system === 'equal-start') return bhavasFromCusps(Array.from({ length: 12 }, (_, index) => normalize(chart.ascendant.longitude + index * 30)));
  if (system === 'sripati' || system === 'equal') {
    const madhyas = bhavaMadhyas(chart.ascendant.longitude, chart.midheaven, system);
    return madhyas ? bhavas(madhyas) : null;
  }
  const cusps = chart.houseCusps?.[system];
  return cusps && cusps.length === 12 ? bhavasFromCusps(cusps) : null;
}

/** The bhāva a longitude stands in. */
export function bhavaOf(longitude: number, list: Bhava[]): number {
  const found = list.find(bhava => forward(bhava.start, longitude) < forward(bhava.start, bhava.end));
  return found ? found.house : 1;
}

export interface ChalitPlanet {
  name: string;
  longitude: number;
  /** The house of the rāśi chart (whole signs from the Lagna) and the bhāva. */
  rasiHouse: number;
  bhavaHouse: number;
  moved: boolean;
}

export interface ChalitResult {
  system: ChalitSystem;
  bhavas: Bhava[];
  planets: ChalitPlanet[];
}

/** The planets of a chart placed by bhāva, or null when the system needs a Midheaven the chart lacks. */
export function buildChalit(
  chart: Pick<ChartData, 'ascendant' | 'planets' | 'midheaven' | 'houseCusps'>,
  system: ChalitSystem,
): ChalitResult | null {
  const list = chartBhavas(chart, system);
  if (!list) return null;
  const planets = chart.planets.map(planet => {
    const rasiHouse = ((planet.sign - chart.ascendant.sign + 12) % 12) + 1;
    const bhavaHouse = bhavaOf(planet.longitude, list);
    return { name: planet.name, longitude: planet.longitude, rasiHouse, bhavaHouse, moved: rasiHouse !== bhavaHouse };
  });
  return { system, bhavas: list, planets };
}
