// Aṣṭakavarga: a simple reading of money, after a lesson on the Aṣṭakavarga and finances (a summary of it given by the user). It is a
// modern teacher's method and not a rule of BPHS: BPHS 72 has the classes of the Sarvāṣṭakavarga (ashtakavargaPhala.ts), not these
// comparisons and limits. The lesson calls its two rules sūtras:
//
//  1. Houses compared by their Sarvāṣṭakavarga: the Lagna against the 12th (the self against the losses; the Lagna also over 28),
//     the 11th against the 12th (income against expenses), the 2nd against the 11th (saving against earning).
//  2. Sums: the houses 1, 2, 4, 9, 10 and 11 over 164 promise a steady flow of money; the houses 6, 8 and 12 over 76 warn of large
//     expenses, and the one of the three with the most bindus shows where the money goes.
//
// With them the lesson reads the grahas of money by the bindus of the sign they stand in, in their own Bhinnāṣṭakavarga: many bindus
// give material gain even to a debilitated or combust graha. It shows 7 as strong and calls 4 average; the classes between are taken
// here (5 or more many, 4 average, 3 or fewer few). The grahas read are the kārakas it names (Jupiter wealth, Venus luxury and the
// flow of money, Mars land and fixed property) and the lords of the 2nd and the 11th.

import { buildAshtakavarga, type AshtakavargaChartLike, type AshtakavargaPlanet, type AshtakavargaSystem } from './ashtakavarga';
import { combustionOf } from './combustion';
import { DEBILITATION, EXALTATION, OWN_SIGNS } from './dignity';
import { SIGN_LORDS } from './signs';

export const WEALTH_HOUSES = [1, 2, 4, 9, 10, 11] as const;
export const LOSS_HOUSES = [6, 8, 12] as const;
export const WEALTH_LIMIT = 164;
export const LOSS_LIMIT = 76;
export const LAGNA_LIMIT = 28;

export interface FinanceComparison {
  key: 'lagna12' | 'income12' | 'saving11';
  /** The two houses compared and their bindus. */
  left: { house: number; bindus: number };
  right: { house: number; bindus: number };
  /** The left has more. */
  holds: boolean;
}

export interface FinanceSums {
  comparisons: FinanceComparison[];
  /** The Lagna has more than the 12th and more than 28. */
  lagnaAhead: boolean;
  wealthSum: number;
  wealthPromise: boolean;
  lossSum: number;
  lossHeavy: boolean;
  /** The house or houses of 6, 8 and 12 with the most bindus. */
  leak: number[];
}

/** The two sūtras from the Sarvāṣṭakavarga of the twelve houses (the Lagna first). */
export function financeFromHouses(sav: readonly number[]): FinanceSums {
  const of = (house: number) => sav[house - 1] ?? 0;
  const compare = (key: FinanceComparison['key'], left: number, right: number): FinanceComparison =>
    ({ key, left: { house: left, bindus: of(left) }, right: { house: right, bindus: of(right) }, holds: of(left) > of(right) });
  const comparisons = [compare('lagna12', 1, 12), compare('income12', 11, 12), compare('saving11', 2, 11)];
  const wealthSum = WEALTH_HOUSES.reduce((sum, house) => sum + of(house), 0);
  const lossSum = LOSS_HOUSES.reduce((sum, house) => sum + of(house), 0);
  const most = Math.max(...LOSS_HOUSES.map(of));
  return {
    comparisons,
    lagnaAhead: comparisons[0].holds && of(1) > LAGNA_LIMIT,
    wealthSum, wealthPromise: wealthSum > WEALTH_LIMIT,
    lossSum, lossHeavy: lossSum > LOSS_LIMIT,
    leak: LOSS_HOUSES.filter(house => of(house) === most),
  };
}

export type BinduClass = 'many' | 'average' | 'few';
export const binduClass = (bindus: number): BinduClass => (bindus >= 5 ? 'many' : bindus === 4 ? 'average' : 'few');

export interface FinanceGraha {
  planet: AshtakavargaPlanet;
  /** Why it is read: a kāraka, or the lord of the 2nd or the 11th (a graha can be several). */
  roles: ('karaka' | 'lord2' | 'lord11')[];
  /** The sign it stands in (1–12) and its house from the Lagna. */
  sign: number;
  house: number;
  /** The bindus of that sign in its own Bhinnāṣṭakavarga. */
  bindus: number;
  kind: BinduClass;
  dignity: 'exalted' | 'own' | 'debilitated' | null;
  combust: boolean;
}

export interface Finance extends FinanceSums {
  /** The Sarvāṣṭakavarga of the twelve houses. */
  houses: number[];
  grahas: FinanceGraha[];
}

const KARAKAS: readonly AshtakavargaPlanet[] = ['Jupiter', 'Venus', 'Mars'];

/** The chart as the Aṣṭakavarga reads it, with the retrograde mark that narrows the orb of combustion. */
export type FinanceChartLike = Omit<AshtakavargaChartLike, 'planets'> & { planets?: { name: string; house?: number; sign?: number; longitude?: number; isRetrograde?: boolean }[] };

export function buildFinance(chart: FinanceChartLike, system: AshtakavargaSystem = 'Parashara'): Finance {
  const { bav, sav } = buildAshtakavarga(chart, system);
  const lagnaSign = chart.ascendant?.sign ?? 1;
  const find = (name: string) => chart.planets?.find(item => item.name === name);
  const signOf = (name: string): number | null => {
    const planet = find(name);
    if (typeof planet?.sign === 'number') return planet.sign;
    return typeof planet?.longitude === 'number' ? Math.floor((((planet.longitude % 360) + 360) % 360) / 30) + 1 : null;
  };
  const lordOf = (house: number) => SIGN_LORDS[(lagnaSign - 1 + house - 1) % 12] as AshtakavargaPlanet;
  const lord2 = lordOf(2);
  const lord11 = lordOf(11);
  const sun = find('Sun');
  const grahas: FinanceGraha[] = [];
  for (const planet of [...new Set<AshtakavargaPlanet>([...KARAKAS, lord2, lord11])]) {
    const sign = signOf(planet);
    const row = bav.find(item => item.planet === planet);
    if (sign === null || !row) continue;
    const house = ((sign - lagnaSign + 12) % 12) + 1;
    const bindus = row.houses[house - 1] ?? 0;
    const roles: FinanceGraha['roles'] = [];
    if (KARAKAS.includes(planet)) roles.push('karaka');
    if (planet === lord2) roles.push('lord2');
    if (planet === lord11) roles.push('lord11');
    const body = find(planet);
    grahas.push({
      planet, roles, sign, house, bindus, kind: binduClass(bindus),
      dignity: EXALTATION[planet] === sign ? 'exalted' : DEBILITATION[planet] === sign ? 'debilitated' : OWN_SIGNS[planet]?.includes(sign) ? 'own' : null,
      combust: typeof body?.longitude === 'number' && typeof sun?.longitude === 'number' && combustionOf(planet, body.longitude, sun.longitude, body.isRetrograde ?? false) !== null,
    });
  }
  return { houses: [...sav.houses], grahas, ...financeFromHouses(sav.houses) };
}
