// The chart search: which of the saved charts have a graha in a sign, a house or a nakṣatra, or two grahas together, and so on.
// The charts are those the research already calculates; the search only reads them.

import type { ChartData } from '@/types';
import { NAKSHATRA_SIZE } from '../nakshatras';

export const SEARCH_POINTS = ['Lagna', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
export type SearchPoint = typeof SEARCH_POINTS[number];

/** One condition of the search. Signs and houses count from 1, nakṣatras from 1 (Aśvinī). */
export type Criterion =
  | { kind: 'sign'; point: SearchPoint; value: number }
  | { kind: 'house'; point: SearchPoint; value: number }
  | { kind: 'nakshatra'; point: SearchPoint; value: number }
  | { kind: 'together'; point: SearchPoint; other: SearchPoint }
  | { kind: 'retrograde'; point: SearchPoint };

export interface PointFacts {
  longitude: number;
  sign: number;
  /** The house of the rāśi chart, whole signs from the Lagna. */
  house: number;
  /** 1 to 27. */
  nakshatra: number;
  retrograde: boolean;
}

/** Where a point of a chart stands, or null when the chart has no such point. */
export function pointFacts(chart: Pick<ChartData, 'ascendant' | 'planets'>, point: SearchPoint): PointFacts | null {
  const lagnaSign = chart.ascendant.sign;
  const make = (longitude: number, retrograde: boolean): PointFacts => {
    const sign = Math.floor((((longitude % 360) + 360) % 360) / 30) + 1;
    return {
      longitude, sign, house: ((sign - lagnaSign + 12) % 12) + 1,
      nakshatra: Math.min(26, Math.floor((((longitude % 360) + 360) % 360) / NAKSHATRA_SIZE)) + 1, retrograde,
    };
  };
  if (point === 'Lagna') return make(chart.ascendant.longitude, false);
  const planet = chart.planets.find(item => item.name === point);
  return planet ? make(planet.longitude, planet.isRetrograde === true) : null;
}

/** Whether a chart meets a condition. */
export function meets(chart: Pick<ChartData, 'ascendant' | 'planets'>, criterion: Criterion): boolean {
  const facts = pointFacts(chart, criterion.point);
  if (!facts) return false;
  switch (criterion.kind) {
    case 'sign': return facts.sign === criterion.value;
    case 'house': return facts.house === criterion.value;
    case 'nakshatra': return facts.nakshatra === criterion.value;
    case 'retrograde': return facts.retrograde;
    case 'together': {
      if (criterion.other === criterion.point) return false;
      const other = pointFacts(chart, criterion.other);
      return other !== null && other.sign === facts.sign;
    }
  }
}

export interface SearchItem {
  id: string;
  name: string;
  client: string;
  chart: Pick<ChartData, 'ascendant' | 'planets'>;
}

export type SearchMode = 'all' | 'any';

export interface SearchHit {
  id: string;
  name: string;
  client: string;
  /** The indexes of the conditions the chart meets. */
  met: number[];
}

/** The charts that meet all of the conditions (or any of them); with no condition nothing is found. */
export function searchCharts(items: readonly SearchItem[], criteria: readonly Criterion[], mode: SearchMode, text = ''): SearchHit[] {
  const needle = text.trim().toLocaleLowerCase();
  if (criteria.length === 0 && !needle) return [];
  const hits: SearchHit[] = [];
  for (const item of items) {
    if (needle && !`${item.name} ${item.client}`.toLocaleLowerCase().includes(needle)) continue;
    const met = criteria.flatMap((criterion, index) => (meets(item.chart, criterion) ? [index] : []));
    const ok = criteria.length === 0 || (mode === 'all' ? met.length === criteria.length : met.length > 0);
    if (ok) hits.push({ id: item.id, name: item.name, client: item.client, met });
  }
  return hits;
}
