// Good and difficult periods on the Sarvatobhadra chakra: while a transiting graha stands in the square of one nakṣatra, its lines of vedha (across and
// the two diagonals) pierce the squares they cross, and the lattā (its "kick") falls on one nakṣatra. A stretch of time in which the lines reach a point of
// the birth (the Moon's nakṣatra, the Moon's sign, the Lagna's sign, the birth tithi and weekday, the syllable of the name) is an impact period, good when a
// benefic reaches it and difficult when a malefic does, and difficult when the lattā falls on the birth nakṣatra.
//
// The teaching of the chakra is that a malefic's vedha harms and a benefic's helps; it gives no scale. The weights, the benefics and the day windows are
// choices made here and named on the page (docs/sarvatobhadra-periods.md); they are not a rule of a classic.

import { NAKSHATRA_NAMES, NAKSHATRA_SIZE } from './nakshatras';
import { normalizeDegrees } from './angles';
import { lattaNakshatra, type TransitGraha } from './phaladipikaGochara';
import { SBC_KEY_SPECIALS, sbcCellOf, sbcNakshatra, sbcPierces, sbcVedha, specialOf, type SbcPierce, type SbcPoint, type SbcPointId } from './sarvatobhadra';
import type { LongitudeSeries } from './transitHits';

export const BENEFIC_GRAHAS: readonly string[] = ['Moon', 'Mercury', 'Jupiter', 'Venus'];
/** What a point of the birth weighs when a line reaches it. */
export const POINT_WEIGHT: Record<SbcPointId, number> = { janma: 3, karma: 2, abhisheka: 2, moonSign: 2, lagnaSign: 2, tithi: 1, vara: 1, name: 1 };
/** What the lattā on the Janma, the Karma or the Abhiṣeka nakṣatra weighs (always against). */
export const LATTA_WEIGHT: Record<string, number> = { Janma: 3, Karma: 2, 'Abhiṣeka': 2 };
export const LATTA_ON_JANMA_WEIGHT = LATTA_WEIGHT.Janma;

export type Quality = 'good' | 'difficult';

export interface Stretch {
  body: string;
  /** ms since the epoch. */
  start: number;
  end: number;
  /** The square the graha stands in, by its nakṣatra among the 28. */
  nakshatra: string;
  hits: SbcPierce[];
  /** The nakṣatra the graha kicks (the lattā), whether it is the birth nakṣatra and which of Janma, Karma and Abhiṣeka it is, if any; null for Ketu, which the text does not name. */
  latta: { nakshatra: string; onJanma: boolean; key: string | null } | null;
  /** The benefit (+) or the harm (−) of the stretch: the weights of the points reached, for or against by the graha, and the lattā on the birth nakṣatra. */
  score: number;
}

const nakshatra27 = (longitude: number) => Math.min(26, Math.floor(normalizeDegrees(longitude) / NAKSHATRA_SIZE));

/**
 * The stretches of one graha's series in which it stays in one square (and one nakṣatra of the 27, which the Abhijit square can span two of), with what its
 * lines reach. `adjust` is the chart's nakṣatra offset; `janma` is the Moon's nakṣatra, 0–26, in the same zodiac. Stretches that reach nothing are left out.
 */
export function grahaStretches(body: string, series: LongitudeSeries, points: readonly SbcPoint[], janma: number | null, adjust = 0): Stretch[] {
  const { longitudes, start, step } = series;
  if (longitudes.length === 0) return [];
  const benefic = BENEFIC_GRAHAS.includes(body);
  const groups: { key: string; first: number; last: number }[] = [];
  longitudes.forEach((longitude, index) => {
    const lon = longitude + adjust;
    const cell = sbcCellOf(lon);
    const key = `${cell[0]}-${cell[1]}-${nakshatra27(lon)}`;
    const group = groups[groups.length - 1];
    if (group && group.key === key) group.last = index;
    else groups.push({ key, first: index, last: index });
  });
  const result: Stretch[] = [];
  groups.forEach((group, index) => {
    const from = index === 0 ? start : start + ((groups[index - 1].last + group.first) / 2) * step;
    const to = index === groups.length - 1 ? start + group.last * step : start + ((group.last + groups[index + 1].first) / 2) * step;
    const lon = longitudes[group.first] + adjust;
    const lines = sbcVedha(sbcCellOf(lon));
    const hits = lines ? sbcPierces(lines, points) : [];
    const kicked = body === 'Ketu' ? null : lattaNakshatra(body as TransitGraha, lon);
    const special = kicked === null || janma === null ? null : specialOf(janma, kicked);
    const key = special && SBC_KEY_SPECIALS.includes(special) ? special : null;
    const latta = kicked === null ? null : { nakshatra: NAKSHATRA_NAMES[kicked], onJanma: janma !== null && kicked === janma, key };
    const reach = hits.reduce((sum, hit) => sum + POINT_WEIGHT[hit.point.id], 0) * (benefic ? 1 : -1);
    const score = reach - (key ? LATTA_WEIGHT[key] : 0);
    if (hits.length === 0 && !key) return;
    result.push({ body, start: from, end: to, nakshatra: sbcNakshatra(lon), hits, latta, score });
  });
  return result;
}

export interface Window {
  from: number;
  to: number;
  quality: Quality;
  /** The strongest net score of a day in the window. */
  peak: number;
  /** The stretches that run in it, strongest first, each once. */
  causes: Stretch[];
}

const DAY = 86_400_000;

/**
 * The days (counted from `start`, each at its middle) with their net score, run together into windows of good or difficult days. A day with a net score of 0
 * is neither and ends the window. `stretches` should leave the Moon out when the windows are to be read in days: it crosses a square in a day or so.
 */
export function impactWindows(stretches: readonly Stretch[], start: number, days: number): Window[] {
  const windows: Window[] = [];
  let open: { quality: Quality; from: number; to: number; peak: number; causes: Set<Stretch> } | null = null;
  const close = () => {
    if (open) windows.push({ from: open.from, to: open.to, quality: open.quality, peak: open.peak, causes: [...open.causes].sort((a, b) => Math.abs(b.score) - Math.abs(a.score)) });
    open = null;
  };
  for (let day = 0; day < days; day++) {
    const from = start + day * DAY;
    const middle = from + DAY / 2;
    const running = stretches.filter(item => item.start <= middle && middle < item.end);
    const net = running.reduce((sum, item) => sum + item.score, 0);
    const quality: Quality | null = net > 0 ? 'good' : net < 0 ? 'difficult' : null;
    if (!quality || (open && open.quality !== quality)) close();
    if (!quality) continue;
    if (!open) open = { quality, from, to: from + DAY, peak: net, causes: new Set() };
    open.to = from + DAY;
    open.peak = Math.abs(net) > Math.abs(open.peak) ? net : open.peak;
    running.filter(item => Math.sign(item.score) === Math.sign(net)).forEach(item => open!.causes.add(item));
  }
  close();
  return windows;
}

/** The nakṣatra (0–26) of a longitude in the zodiac the chart reads, for the Moon of the birth. */
export const janmaNakshatra = (moonLongitude: number, adjust = 0) => nakshatra27(moonLongitude + adjust);
