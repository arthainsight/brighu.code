// True signs: where a person's grahas stand in the signs when the divisional charts are counted too, after a video lesson on Vic DiCara's True Signs
// report (not a rule of a classic, and the page says so). Every graha is put in its sign in the six divisions D1, D7, D9, D10, D12 and D16 and each
// sign gets the weight of the division it came from. The weights were not given in the lesson but found from a chart it shows: the Venus of one chart
// with 30.8 %, 23.1 %, 15.4 %, 15.4 %, 7.7 % and 7.7 % (thirteenths) is the signs of its six divisions with the weights 4, 3, 2, 2, 1 and 1: D1 4, D9 3
// (the lesson: three quarters of the D1), D7 2, D12 2, D10 1, D16 1 (docs/true-signs.md). The divisions are the Parāśara ones, from the longitudes
// the chart is cast with (sidereal, or tropical when the chart's ayanāṁśa is none).

import { getVargaSignIndex } from './varga';

export const TRUE_SIGN_WEIGHTS = { 1: 4, 9: 3, 7: 2, 12: 2, 10: 1, 16: 1 } as const;
export type TrueSignDivision = keyof typeof TRUE_SIGN_WEIGHTS;
export const TRUE_SIGN_DIVISIONS = [1, 9, 7, 12, 10, 16] as const satisfies readonly TrueSignDivision[];
export const TRUE_SIGN_TOTAL = TRUE_SIGN_DIVISIONS.reduce((sum, division) => sum + TRUE_SIGN_WEIGHTS[division], 0);

export interface TrueSignBody { name: string; longitude: number }

export interface TrueSignPlacement {
  name: string;
  /** The sign (1 = Aries … 12 = Pisces) in each division. */
  signs: Record<TrueSignDivision, number>;
  /** The share of each sign (index 0 = Aries) out of 1, from the weights. */
  share: number[];
}

export function trueSignPlacement(body: TrueSignBody): TrueSignPlacement {
  const signs = {} as Record<TrueSignDivision, number>;
  const share = Array<number>(12).fill(0);
  for (const division of TRUE_SIGN_DIVISIONS) {
    const sign = getVargaSignIndex(body.longitude, division);
    signs[division] = sign + 1;
    share[sign] += TRUE_SIGN_WEIGHTS[division] / TRUE_SIGN_TOTAL;
  }
  return { name: body.name, signs, share };
}

export interface TrueSigns {
  placements: TrueSignPlacement[];
  /** The share of each sign (index 0 = Aries) out of 1 over all the grahas given; they sum to 1. */
  overall: number[];
}

export function trueSigns(bodies: TrueSignBody[]): TrueSigns {
  const placements = bodies.map(trueSignPlacement);
  const overall = Array<number>(12).fill(0);
  for (const placement of placements) placement.share.forEach((value, sign) => { overall[sign] += value / Math.max(1, placements.length); });
  return { placements, overall };
}
