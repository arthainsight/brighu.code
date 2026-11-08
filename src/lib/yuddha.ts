// Yuddha Bala: the strength gained or lost by a graha in a planetary war (graha-yuddha).
//
// What each source says, read in the Sanskrit:
//   * BPHS 27.20  "atha tāra-grahāṇāṃ tu yuddhyatoś ca dvayor mithaḥ / balāntaraṃ vijetuḥ svaṃ nirjitasya bale tv ṛṇam": of the star-grahas
//                 (Mars, Mercury, Jupiter, Venus, Saturn) fighting one another, the difference of their strengths is added to the victor's
//                 strength and is a debt (subtracted) in the vanquished's. The verse gives the amount, and neither when two grahas fight nor
//                 who wins.
//   * Sūrya Siddhānta 7.19  "aṃśād ūne apasavyākhyaṃ yuddhaṃ": a war is when the grahas are less than a degree apart.
//   * Sūrya Siddhānta 7.21  "udak-stho dīptimān sthūlo jayī yāmye 'pi yo balī": the one in the north, bright and large, is the victor, and the
//                 one in the south too if it is strong (balin).
//   * Bṛhat Saṃhitā 17.9–10  "dakṣiṇa-dik-sthaḥ … aṇuḥ … niṣprabho vivarṇaś ca yaḥ sa jitaḥ" (the one in the south, small, dim or discoloured is
//                 vanquished) and "vipulaḥ snigdho dyutimān dakṣiṇa-dik-stho 'pi jaya-yuktaḥ" (the large, smooth and bright one wins even in the south).
//
// So the app reads the victor as the two Sanskrit texts agree: the graha farther north (the greater ecliptic latitude) wins, unless the one in the
// south is both larger and brighter, which wins in the south as well. Larger is the greater apparent diameter of the disc and brighter the smaller
// apparent magnitude, at the moment of the chart (swe_pheno_ut). Without those numbers (a chart saved before v4.27) the graha farther north wins.
// There is nothing in these texts for the winner by longitude, and the rule of B. V. Raman (the smaller longitude) was taken out for that reason.
//
//   * verse    the amount of BPHS 27.20: the difference of the two Ṣaḍbalas as it is.
//   * sripati  the difference over the difference of the discs, after Sūryadeva Yajvan's commentary on Śrīpati's Jātakakarmapaddhati as it is quoted
//              ("the difference is divided by the difference of the bimba-parimāṇas"); the original was not read.
//
// The Ṣaḍbala compared is the total of the six without Yuddha Bala itself (Sūryadeva counts the parts as far as Ayana Bala; the app takes the whole,
// as the verse's "strengths" reads).

export const WAR_GRAHAS = ['Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
export type WarGraha = typeof WAR_GRAHAS[number];

export type YuddhaRule = 'off' | 'verse' | 'sripati';
export const YUDDHA_RULES: readonly YuddhaRule[] = ['off', 'verse', 'sripati'];

/** The grahas are at war when they are closer than this, in degrees of longitude. */
export const WAR_ORB_DEGREES = 1;

/** The discs of the five, in seconds of arc (the Sūrya Siddhānta's figures, as JHora and Raman use them). */
export const DISC_DIAMETER: Record<WarGraha, number> = { Mars: 9.4, Mercury: 6.6, Jupiter: 190.4, Venus: 16.6, Saturn: 158 };

export interface WarBody {
  name: string;
  longitude: number;
  /** The ecliptic latitude, degrees; without it the victor cannot be told. */
  latitude?: number;
  /** The apparent magnitude (smaller is brighter) and the apparent diameter of the disc, in seconds of arc. */
  magnitude?: number;
  diameter?: number;
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
  /** Why the winner won; null when there is none. */
  basis: WarBasis | null;
  /** The strength passed from the loser to the winner, in the unit of the totals given; 0 when there is no winner. */
  amount: number;
}

/** Why the winner won. */
export type WarBasis = 'north' | 'south-larger-brighter' | 'north-no-brightness';

/**
 * Who wins a war, by Sūrya Siddhānta 7.21 and Bṛhat Saṃhitā 17.9–10: the graha farther north, unless the one in the south is both larger and brighter. Null
 * when it cannot be told (no latitude, or the same latitude).
 */
function victor(war: PlanetaryWar, bodies: readonly WarBody[]): { winner: WarGraha; basis: WarBasis } | null {
  const a = bodies.find(item => item.name === war.a);
  const b = bodies.find(item => item.name === war.b);
  if (!a || !b || a.latitude === undefined || b.latitude === undefined || a.latitude === b.latitude) return null;
  const [north, south] = a.latitude > b.latitude ? [a, b] : [b, a];
  const known = [north.magnitude, south.magnitude, north.diameter, south.diameter].every(value => value !== undefined);
  if (!known) return { winner: north.name as WarGraha, basis: 'north-no-brightness' };
  const southWins = south.magnitude! < north.magnitude! && south.diameter! > north.diameter!;
  return southWins ? { winner: south.name as WarGraha, basis: 'south-larger-brighter' } : { winner: north.name as WarGraha, basis: 'north' };
}

/**
 * The wars of a chart and what each passes on. `totals` are the Ṣaḍbala of the grahas without Yuddha Bala (any unit; the amount
 * comes out in it). Under 'off' nothing is passed.
 */
export function resolveWars(bodies: readonly WarBody[], totals: Partial<Record<string, number>>, rule: YuddhaRule): WarResult[] {
  if (rule === 'off') return [];
  return findPlanetaryWars(bodies).map(war => {
    const result = victor(war, bodies);
    const ta = totals[war.a];
    const tb = totals[war.b];
    if (!result || ta === undefined || tb === undefined) return { ...war, winner: null, loser: null, basis: null, amount: 0 };
    const { winner, basis } = result;
    const loser = winner === war.a ? war.b : war.a;
    let amount = Math.abs(ta - tb);
    if (rule !== 'verse') {
      const discs = Math.abs(DISC_DIAMETER[war.a] - DISC_DIAMETER[war.b]);
      amount = discs > 0 ? amount / discs : 0;
    }
    return { ...war, winner, loser, basis, amount };
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
