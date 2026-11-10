// Dignity in a divisional chart (D9 above all), after a modern teacher's lessons on dignity and the Navāṁśa (a method, not a rule of a classic; the page says
// so, and docs/varga-dignity.md has what the lessons give and what was chosen here).
//
// The lessons give:
//  – a spectrum from exalted (the challenge met actively) and own sign (it does not come) down through the great friend (adhimitra), the friend, the neutral,
//    the enemy and the great enemy (adhiśatru) to the fall; the four upper states are read well and the rest as undignified;
//  – the dignity is recursive: a graha stands in the sign of a host (its dispositor), whose own dignity decides what it can offer the guest, and so on down the chain;
//  – the Navāṁśa's average dignity (a pulse of the chart) and a dominance list of the grahas in it with the signs ∇ (high dominance, low dignity: strong and
//    troubled), Δ (low dominance, good dignity: a resource seldom used) and a flag (a sharp turn between two different grahas in the list).
//
// What the lessons do not give, and was chosen here: the eight steps 7 to 0 (the compound relation of BPHS 3.55–58 as in Vimśopaka Bala); the weight of
// the host, 0.4 of the effective dignity of the dispositor against 0.6 of the graha's own, worked out to a fixed point (so that an exchange of signs
// settles); the dominance of a graha as the number of the grahas and the Lagna in the dispositor tree under it, itself counted; ties by the dignity,
// then the order of the week; the upper and the lower three of the seven for "high" and "low"; the flag between a benefic and a malefic next to each
// other. Conjunctions and aspects, which the lesson names as a part of the recursion, are not worked in.

import { getVargaSignIndex } from './varga';
import { getCompoundRelation, getDignity, type RasiSigns, type ShadbalaPlanet } from './shadbala';
import { SIGN_LORDS } from './signs';

export const DIGNITY_GRAHAS: readonly ShadbalaPlanet[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
export type DignityLevel = 'exalted' | 'own' | 'adhimitra' | 'mitra' | 'sama' | 'shatru' | 'adhishatru' | 'debilitated';
export const DIGNITY_SCORE: Record<DignityLevel, number> = { exalted: 7, own: 6, adhimitra: 5, mitra: 4, sama: 3, shatru: 2, adhishatru: 1, debilitated: 0 };
/** The effective score from which a dignity is read as good: the four upper states are 4 and over. */
export const GOOD_DIGNITY = 4;
export const HOST_WEIGHT = 0.4;
const BENEFICS: readonly string[] = ['Moon', 'Mercury', 'Jupiter', 'Venus'];

export interface VargaGraha {
  name: ShadbalaPlanet;
  /** The sign (0 = Aries) in the division. */
  sign: number;
  level: DignityLevel;
  score: number;
  /** The host: the lord of the sign (the graha itself in its own sign). */
  host: ShadbalaPlanet;
  /** The score with the host's effective dignity worked in. */
  effective: number;
  /** The grahas and the Lagna in the dispositor tree under it, itself counted. */
  dominance: number;
  symbol: 'inverted' | 'upright' | null;
}

export interface VargaDignity {
  division: number;
  ascendantSign: number;
  /** In the order of dominance, highest first. */
  grahas: VargaGraha[];
  /** The mean effective score of the seven out of 7, and the mean of the plain scores. */
  average: number;
  plainAverage: number;
  /** Positions i of `grahas` with a flag between i and i + 1. */
  flags: number[];
  /** The chain of hosts of a graha, from it to where it stops (a graha in its own sign, or one that comes round). */
  chains: Record<string, ShadbalaPlanet[]>;
}

export interface DignityBody { name: string; longitude: number }

const levelOf = (name: ShadbalaPlanet, sign: number, signs: RasiSigns): DignityLevel => {
  const dignity = getDignity(name, sign);
  if (dignity === 'exalted') return 'exalted';
  if (dignity === 'own' || dignity === 'moolatrikona') return 'own';
  if (dignity === 'debilitated') return 'debilitated';
  return getCompoundRelation(name, SIGN_LORDS[sign] as ShadbalaPlanet, signs);
};

export function vargaDignity(bodies: DignityBody[], ascendantLongitude: number, division: number): VargaDignity | null {
  const signs: RasiSigns = {};
  for (const name of DIGNITY_GRAHAS) {
    const body = bodies.find(item => item.name === name);
    if (!body) return null;
    signs[name] = getVargaSignIndex(body.longitude, division);
  }
  const ascendantSign = getVargaSignIndex(ascendantLongitude, division);
  const hostOf = (name: ShadbalaPlanet) => SIGN_LORDS[signs[name] as number] as ShadbalaPlanet;
  const level = Object.fromEntries(DIGNITY_GRAHAS.map(name => [name, levelOf(name, signs[name] as number, signs)])) as Record<ShadbalaPlanet, DignityLevel>;
  const score = Object.fromEntries(DIGNITY_GRAHAS.map(name => [name, DIGNITY_SCORE[level[name]]])) as Record<ShadbalaPlanet, number>;

  // The recursion worked out to its fixed point: e = (1 − w) · own + w · e(host); a graha in its own sign stands on its own.
  let effective = { ...score };
  for (let step = 0; step < 200; step++) {
    const next = { ...effective };
    for (const name of DIGNITY_GRAHAS) {
      const host = hostOf(name);
      next[name] = host === name ? score[name] : (1 - HOST_WEIGHT) * score[name] + HOST_WEIGHT * effective[host];
    }
    effective = next;
  }

  const chains: Record<string, ShadbalaPlanet[]> = {};
  for (const name of DIGNITY_GRAHAS) {
    const chain: ShadbalaPlanet[] = [name];
    for (let host = hostOf(name); !chain.includes(host); host = hostOf(host)) chain.push(host);
    chains[name] = chain;
  }
  // The dominance: the grahas, and the Lagna, whose chain of hosts reaches the graha.
  const lagnaChain: ShadbalaPlanet[] = [];
  for (let host = SIGN_LORDS[ascendantSign] as ShadbalaPlanet; !lagnaChain.includes(host); host = hostOf(host)) lagnaChain.push(host);
  const dominance = (name: ShadbalaPlanet) => DIGNITY_GRAHAS.filter(other => chains[other].includes(name)).length + (lagnaChain.includes(name) ? 1 : 0);

  const grahas: VargaGraha[] = DIGNITY_GRAHAS.map(name => ({
    name, sign: signs[name] as number, level: level[name], score: score[name], host: hostOf(name), effective: effective[name], dominance: dominance(name), symbol: null,
  })).sort((a, b) => b.dominance - a.dominance || b.effective - a.effective || DIGNITY_GRAHAS.indexOf(a.name) - DIGNITY_GRAHAS.indexOf(b.name));

  grahas.forEach((item, index) => {
    if (index < 3 && item.effective < GOOD_DIGNITY) item.symbol = 'inverted';
    else if (index >= grahas.length - 3 && item.effective >= GOOD_DIGNITY) item.symbol = 'upright';
  });
  const flags = grahas.slice(0, -1).flatMap((item, index) => (BENEFICS.includes(item.name) !== BENEFICS.includes(grahas[index + 1].name) ? [index] : []));
  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    division, ascendantSign, grahas, flags, chains,
    average: mean(grahas.map(item => item.effective)),
    plainAverage: mean(grahas.map(item => item.score)),
  };
}
