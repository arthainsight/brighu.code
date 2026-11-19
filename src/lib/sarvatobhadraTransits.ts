// Transits over the natal planets on the Sarvatobhadra chakra: for each natal graha, which transiting grahas stand in its nakṣatra (conjunction), have vedha on
// its nakṣatra (the line across the chakra or on a diagonal ends there), aspect its sign (the graha's own aspects, the conjunction in the sign left to the
// first column), or have their lattā fall on its nakṣatra; and a verdict. After a table another program shows; the verdict is read from its examples, not from a
// classic: every hit is counted for or against by the nature of the graha that makes it (Moon, Mercury, Jupiter and Venus for; the Sun, Mars, Saturn, Rāhu and
// Ketu against), the lattā too, and the verdict is supported when only benefics reach the graha, afflicted when only malefics do, mixed when both do and clear
// when none does (docs/sarvatobhadra-periods.md).

import { normalizeDegrees } from './angles';
import { NAKSHATRA_SIZE, padaOfLongitude } from './nakshatras';
import { lattaNakshatra, type TransitGraha } from './phaladipikaGochara';
import { sbcCellOf, sbcVedha } from './sarvatobhadra';
import { transitRelationsOf } from './transitHits';
import { BENEFIC_GRAHAS } from './sarvatobhadraPeriods';

export interface BodyPlace { name: string; longitude: number }
export type Verdict = 'clear' | 'supported' | 'afflicted' | 'mixed';

export interface NatalTransitRow {
  natal: string;
  /** The nakṣatra of the natal graha among the 27 (0–26). */
  star: number;
  conjunction: string[];
  vedha: string[];
  aspects: string[];
  latta: string[];
  /** The hits by benefics and by malefics. */
  good: string[];
  bad: string[];
  verdict: Verdict;
}

const signOf = (longitude: number) => Math.floor(normalizeDegrees(longitude) / 30) + 1;
const star27 = (longitude: number) => Math.min(26, Math.floor(normalizeDegrees(longitude) / NAKSHATRA_SIZE));
const sameCell = (a: readonly [number, number], b: readonly [number, number]) => a[0] === b[0] && a[1] === b[1];

/**
 * The row of every natal graha. `adjust` is the nakṣatra offset of the chart; `ketuLatta` gives Ketu the lattā of Rāhu (the 9th behind), which the verses do not.
 * `kickPart` 'pada': the lattā counts only when the natal graha stands in the pada with the number of the kicker's pada.
 * A graha is not listed as aspecting or having vedha on itself by standing still, but a transiting graha over its own natal place is a conjunction like any other.
 */
export function transitsOverNatal(natal: readonly BodyPlace[], transit: readonly BodyPlace[], adjust = 0, ketuLatta = false, kickPart: 'nakshatra' | 'pada' = 'nakshatra'): NatalTransitRow[] {
  return natal.map(planet => {
    const cell = sbcCellOf(planet.longitude + adjust);
    const star = star27(planet.longitude + adjust);
    const sign = signOf(planet.longitude);
    const row: NatalTransitRow = { natal: planet.name, star, conjunction: [], vedha: [], aspects: [], latta: [], good: [], bad: [], verdict: 'clear' };
    for (const mover of transit) {
      const moverCell = sbcCellOf(mover.longitude + adjust);
      if (sameCell(moverCell, cell)) row.conjunction.push(mover.name);
      const lines = sbcVedha(moverCell);
      if (lines && lines.some(line => sameCell(line.target, cell))) row.vedha.push(mover.name);
      const houses = ((sign - signOf(mover.longitude) + 12) % 12) + 1;
      if (houses !== 1 && transitRelationsOf(mover.name).some(relation => relation === houses)) row.aspects.push(mover.name);
      const kicked = mover.name === 'Ketu'
        ? (ketuLatta ? (star27(mover.longitude + adjust) - 8 + 27) % 27 : null)
        : lattaNakshatra(mover.name as TransitGraha, mover.longitude + adjust);
      // With the pada chosen the kick bites only the pada with the number of the kicker's pada (the Muhūrtacintāmaṇi 6.62).
      if (kicked === star && (kickPart === 'nakshatra' || padaOfLongitude(planet.longitude + adjust) === padaOfLongitude(mover.longitude + adjust))) row.latta.push(mover.name);
    }
    const hitters = [...new Set([...row.conjunction, ...row.vedha, ...row.aspects, ...row.latta])];
    row.good = hitters.filter(name => BENEFIC_GRAHAS.includes(name));
    row.bad = hitters.filter(name => !BENEFIC_GRAHAS.includes(name));
    row.verdict = row.good.length && row.bad.length ? 'mixed' : row.good.length ? 'supported' : row.bad.length ? 'afflicted' : 'clear';
    return row;
  });
}
