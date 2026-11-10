import { buildAshtakavarga } from './ashtakavarga';
import { DEBILITATION, EXALTATION, MOOLATRIKONA, NATURAL_ENEMIES, NATURAL_FRIENDS, OWN_SIGNS } from './dignity';
import { signLord } from './signs';
import { sudarshanaFacts, sudarshanaRings, type SudarshanaRingId } from './sudarshana';
import { calculateVaisheshikamsa } from './vaisheshikamsa';
import type { ChartData, PlanetData } from '@/types';

// The table of the twelve houses of the Sudarśana Chakra, after a worksheet shown in a video on the Sudarśana Chakra paddhati (the channel Revatiraa): for each house number
// the grahas standing in it in the three charts, how strong the lords of its three signs are, the grahas that aspect it and the Sarvāṣṭakavarga of the sign. It is a modern
// worksheet, not a rule of BPHS, and the columns are those of the worksheet. docs/sudarshana-table-sources.md says how each was checked against it.

export const NINE_GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;

/** The natural benefics of the worksheet (Mercury counts as one); the other grahas, the nodes among them, are malefic. */
export const TABLE_BENEFICS: readonly string[] = ['Moon', 'Mercury', 'Jupiter', 'Venus'];

/** The points of the lord of a sign by the state of that lord in its own sign: the legend of the worksheet, with the own sign at 0.5. */
export const LORD_POINTS = { exalted: 1, moolatrikona: 0.75, own: 0.5, friendly: 0.25, neutral: 0.125, hostile: 0 } as const;
export type LordState = keyof typeof LORD_POINTS;

/** The most the three lords can give a house. */
export const MAX_LORD_POINTS = 3 * LORD_POINTS.exalted;

/**
 * The state of a graha in a sign: exalted, in the sign of its moolatrikona (the whole sign, as in BPHS 3), in its own sign, in the sign of a natural friend, a neutral or an enemy (the
 * debilitated is counted with the enemies: both are 0). The friends and enemies are the natural ones.
 */
export function stateInSign(graha: string, sign: number): LordState {
  if (EXALTATION[graha] === sign) return 'exalted';
  if (DEBILITATION[graha] === sign) return 'hostile';
  if (MOOLATRIKONA[graha] === sign) return 'moolatrikona';
  if (OWN_SIGNS[graha]?.includes(sign)) return 'own';
  const host = signLord(sign);
  if (NATURAL_FRIENDS[graha]?.includes(host)) return 'friendly';
  if (NATURAL_ENEMIES[graha]?.includes(host)) return 'hostile';
  return 'neutral';
}

export interface TableOccupant {
  name: string;
  /** The chart the graha is counted in: the house of this number is a sign of it. */
  ring: SudarshanaRingId;
  benefic: boolean;
}

export interface TableDispositor {
  ring: SudarshanaRingId;
  sign: number;
  lord: string;
  state: LordState;
  points: number;
}

export interface TableRow {
  house: number;
  /** The grahas in the three signs of the house, ring by ring (a graha stands once in each ring). */
  occupants: TableOccupant[];
  dispositors: TableDispositor[];
  /** The sum of the points of the three lords, 0 to 3. */
  lordPoints: number;
  /** The lord points as a percent of the most (3). */
  strength: number;
  /** The grahas aspecting the three signs, benefic and malefic; the grahas in the sign are not counted. */
  aspects: { benefic: string[]; malefic: string[] };
  /** The Sarvāṣṭakavarga of the sign of the house counted from the Lagna (Parāśara's), the same for the three charts. */
  sav: number;
  /** The mean auspiciousness of the occupants (the worksheet's V-AMSHA, the Vaiśeṣikāṁśa), 50 for a house with none; a node without a count is left out; null when one of the seven grahas has no count. */
  vamsha: number | null;
}

/** The auspiciousness of a graha in percent: how many of the six divisional charts are good for it, over six. */
export const auspiciousness = (good: number) => (good / 6) * 100;

/** Good counts in the six charts (0 to 6) by graha name. */
export type GoodCounts = Partial<Record<string, number>>;

/**
 * The good counts of the seven grahas as the app counts them: the vargas of the Ṣaḍvarga (D1, D2, D3, D9, D12, D30) in which the graha is in its exaltation, mūlatrikoṇa
 * or own sign (BPHS 6.52, vaisheshikamsa.ts). Rahu and Ketu have none: the verse gives them no sign. These are not the numbers of Jagannatha Hora's view.
 */
export function computedGoodCounts(chart: Pick<ChartData, 'ascendant' | 'planets'>): GoodCounts {
  return Object.fromEntries(calculateVaisheshikamsa(chart).rows.map(row => [row.planet, row.counts.shadvarga]));
}

export function sudarshanaTable(chart: Pick<ChartData, 'ascendant' | 'planets'>, goodCounts: GoodCounts = {}): TableRow[] {
  const grahas = chart.planets.filter(planet => (NINE_GRAHAS as readonly string[]).includes(planet.name));
  const moon = grahas.find(planet => planet.name === 'Moon');
  const sun = grahas.find(planet => planet.name === 'Sun');
  if (!moon || !sun) return [];
  const rings = sudarshanaRings(chart.ascendant.sign, moon.sign, sun.sign, grahas);
  const sav = buildAshtakavarga(chart as Parameters<typeof buildAshtakavarga>[0]).sav.houses;
  const signOf = (name: string) => grahas.find(planet => planet.name === name)?.sign;

  return Array.from({ length: 12 }, (_, index) => {
    const house = index + 1;
    const occupants: TableOccupant[] = [];
    const dispositors: TableDispositor[] = [];
    const benefic = new Set<string>();
    const malefic = new Set<string>();
    for (const ring of rings) {
      const entry = ring.houses[index];
      for (const name of entry.planets) occupants.push({ name, ring: ring.id, benefic: TABLE_BENEFICS.includes(name) });
      const lordSign = signOf(entry.lord);
      const state = lordSign === undefined ? 'hostile' : stateInSign(entry.lord, lordSign);
      dispositors.push({ ring: ring.id, sign: entry.sign, lord: entry.lord, state, points: LORD_POINTS[state] });
      for (const name of sudarshanaFacts(ring, house, grahas as PlanetData[]).aspecting) (TABLE_BENEFICS.includes(name) ? benefic : malefic).add(name);
    }
    const lordPoints = dispositors.reduce((sum, item) => sum + item.points, 0);
    // A node without a count is left out of the mean (the computed counts have none for the nodes); one of the seven grahas without a count leaves the mean open.
    const counted = occupants.filter(item => typeof goodCounts[item.name] === 'number');
    const open = occupants.some(item => typeof goodCounts[item.name] !== 'number' && item.name !== 'Rahu' && item.name !== 'Ketu');
    const vamsha = open ? null : counted.length === 0 ? 50 : counted.reduce((sum, item) => sum + auspiciousness(goodCounts[item.name]!), 0) / counted.length;
    return {
      house,
      occupants,
      dispositors,
      lordPoints,
      strength: (lordPoints / MAX_LORD_POINTS) * 100,
      aspects: { benefic: [...benefic], malefic: [...malefic] },
      sav: sav[index] ?? 0,
      vamsha,
    };
  });
}
