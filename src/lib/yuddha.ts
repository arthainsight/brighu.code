// Yuddha Bala: the strength gained or lost by a graha in a planetary war (graha-yuddha).
//
// BPHS 27.20: "Of the star-grahas (Mars, Mercury, Jupiter, Venus, Saturn) fighting one another, the difference of their strengths
// is added to the victor's strength and subtracted from the vanquished's." The verse says neither when two grahas fight nor who
// wins, so those come from the other sources, and the sources disagree (docs/shadbala-sources.md, choice point C12):
//
//   * A war is a conjunction closer than one degree of longitude, the same for every source.
//   * verse     the difference of the two Ṣaḍbalas as it is, the victor the graha farther north (the rule of the Sūrya Siddhānta
//               and the Bṛhat Saṃhitā, which the verse does not give).
//   * sripati   the difference over the difference of the discs, the victor farther north (Sūryadeva Yajvan on Śrīpati's
//               Jātakakarmapaddhati: "the difference is divided by the difference of the bimba-parimāṇas").
//   * raman     the difference over the difference of the discs, the victor the one with the smaller longitude (B. V. Raman).
//
// The Ṣaḍbala compared is the total of the six without Yuddha Bala itself. (Sūryadeva counts the parts as far as Ayana Bala and
// Raman as far as Horā Bala; the app takes the whole, as the verse's "strengths" reads.)

export const WAR_GRAHAS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type WarGraha = typeof WAR_GRAHAS[number];

export type YuddhaRule = 'off' | 'verse' | 'sripati' | 'raman';
export const YUDDHA_RULES: readonly YuddhaRule[] = ['off', 'verse', 'sripati', 'raman'];

/** The grahas are at war when they are closer than this, in degrees of longitude. */
export const WAR_ORB_DEGREES = 1;

/** The discs of the five, in seconds of arc (the Sūrya Siddhānta's figures, as JHora and Raman use them). */
export const DISC_DIAMETER: Record<WarGraha, number> = { Mars: 9.4, Mercury: 6.6, Jupiter: 190.4, Venus: 16.6, Saturn: 158 };

export interface WarBody {
  name: string;
  longitude: number;
  /** The ecliptic latitude, degrees; without it the victor by latitude cannot be told. */
  latitude?: number;
}

export interface PlanetaryWar {
  a: WarGraha;
  b: WarGraha;
  /** The distance in longitude, degrees. */
  distance: number;
}

const isWarGraha = (name: string): name is WarGraha => (WAR_GRAHAS as readonly string[]).includes(name);

/** The pairs of the five grahas closer than the orb, in the order of WAR_GRAHAS. */
export function findPlanetaryWars(bodies: readonly WarBody[]): PlanetaryWar[] {
  const fighters = WAR_GRAHAS.flatMap(name => {
    const body = bodies.find(item => item.name === name);
    return body && Number.isFinite(body.longitude) ? [{ name, longitude: body.longitude }] : [];
  });
  const wars: PlanetaryWar[] = [];
  for (let i = 0; i < fighters.length; i += 1) {
    for (let j = i + 1; j < fighters.length; j += 1) {
      const apart = Math.abs(fighters[i].longitude - fighters[j].longitude) % 360;
      const distance = Math.min(apart, 360 - apart);
      if (distance < WAR_ORB_DEGREES) wars.push({ a: fighters[i].name, b: fighters[j].name, distance });
    }
  }
  return wars;
}

export interface WarResult extends PlanetaryWar {
  winner: WarGraha | null;
  loser: WarGraha | null;
  /** The strength passed from the loser to the winner, in the unit of the totals given; 0 when there is no winner. */
  amount: number;
}

/** Who wins a war by a rule, or null when it cannot be told (no latitude, or the same latitude or longitude). */
function victor(war: PlanetaryWar, bodies: readonly WarBody[], rule: Exclude<YuddhaRule, 'off'>): WarGraha | null {
  const a = bodies.find(item => item.name === war.a);
  const b = bodies.find(item => item.name === war.b);
  if (!a || !b) return null;
  if (rule === 'raman') {
    // The smaller longitude, counted across 0° Aries as the shorter way round.
    const delta = ((a.longitude - b.longitude + 540) % 360) - 180;
    return delta === 0 ? null : delta < 0 ? war.a : war.b;
  }
  if (a.latitude === undefined || b.latitude === undefined || a.latitude === b.latitude) return null;
  return a.latitude > b.latitude ? war.a : war.b;
}

/**
 * The wars of a chart and what each passes on. `totals` are the Ṣaḍbala of the grahas without Yuddha Bala (any unit; the amount
 * comes out in it). Under 'off' nothing is passed.
 */
export function resolveWars(bodies: readonly WarBody[], totals: Partial<Record<string, number>>, rule: YuddhaRule): WarResult[] {
  if (rule === 'off') return [];
  return findPlanetaryWars(bodies).map(war => {
    const winner = victor(war, bodies, rule);
    if (!winner) return { ...war, winner: null, loser: null, amount: 0 };
    const loser = winner === war.a ? war.b : war.a;
    const ta = totals[war.a];
    const tb = totals[war.b];
    if (ta === undefined || tb === undefined) return { ...war, winner: null, loser: null, amount: 0 };
    let amount = Math.abs(ta - tb);
    if (rule !== 'verse') {
      const discs = Math.abs(DISC_DIAMETER[war.a] - DISC_DIAMETER[war.b]);
      amount = discs > 0 ? amount / discs : 0;
    }
    return { ...war, winner, loser, amount };
  });
}

/** What each graha gains (+) or loses (−) in all its wars. */
export function yuddhaBalaOf(results: readonly WarResult[]): Partial<Record<WarGraha, number>> {
  const bala: Partial<Record<WarGraha, number>> = {};
  for (const result of results) {
    if (!result.winner || !result.loser) continue;
    bala[result.winner] = (bala[result.winner] ?? 0) + result.amount;
    bala[result.loser] = (bala[result.loser] ?? 0) - result.amount;
  }
  return bala;
}

export { isWarGraha };
