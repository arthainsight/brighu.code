// A reading of self-earned wealth in three steps and a confirmation, after a modern teacher's article on the Horā chart and wealth (given by the
// user; docs/wealth-assessment-sources.md has the verses it names and what could be checked). The article is a method, not a rule of one text:
// the parts that rest on a verse say which (Bṛhajjātaka 13.1 and the Phaladīpikā's horā verse, BPHS 7 for the horā itself); the rest are the teacher's
// readings, and the view says so. "Strong" is the Ṣaḍbala of the graha at or over what it needs (as in the topic yogas); aspects are by whole signs.
//
//  1. The structure of the Sun and the Moon: the Moon's house counted from the Sun (kendra, paṇapara, āpoklima).
//  2. The horā: a graha is in the Sun's horā (Leo) or the Moon's (Cancer) and nothing else: odd signs the first 15° the Sun's, even signs the Moon's.
//     Malefics in the Sun's horā of an odd sign, benefics in the Moon's horā of an even sign, are the grahas that help; the reverse hinders.
//  3. The houses 2, 11, 9, 5 and their lords and Jupiter; the pattern behind the dhana yogas (a relationship of the lords of 2 and 5, 2 and 11, 5 in 5
//     and 9 in 9, 2 in 2 and 11 in 11), its spoilers (the lords of 6, 8, 12) and the lord of the Lagna.
//  Then the same from the Moon, and the grahas of the money in the vargas D9, D3, D2, D12 and D30.

import {
  aspectsSign, find, houseOf, houseOfSign, isStrong, lordOfHouse, lordOfSign, seesSign, SEVEN, signOfHouse, type SevenGraha, type TopicContext,
} from './topicCore';
import { DEBILITATION, EXALTATION, NATURAL_FRIENDS, OWN_SIGNS } from './dignity';
import { angularSeparation } from './combustion';
import { getVargaSignIndex } from './varga';
import { SIGN_LORDS } from './signs';

export type { TopicContext };

const isOdd = (sign: number) => sign % 2 === 1;
const BENEFICS_OF_THE_VERSE = ['Moon', 'Mercury', 'Jupiter', 'Venus'];
const MALEFICS_OF_THE_VERSE = ['Sun', 'Mars', 'Saturn'];

// ── Step 1: the Moon from the Sun ─────────────────────────────────────────────────────────────────────────────
export type SunMoonKind = 'kendra' | 'panaphara' | 'apoklima';
export interface SunMoonStructure {
  /** The Moon's house counted from the Sun (1–12). */
  house: number;
  kind: SunMoonKind;
  /** The 6th and the 9th from the Sun: the Moon is farthest from it and the reading is the best. */
  best: boolean;
  /** The lord of the Lagna is stronger than the Sun and the Moon and a benefic aspects it: the exception. null when a strength is missing. */
  lagnaLordOvercomes: boolean | null;
  lagnaLordBeneficAspect: boolean;
}

export function sunMoonStructure(context: TopicContext): SunMoonStructure | null {
  const sun = find(context, 'Sun');
  const moon = find(context, 'Moon');
  if (!sun || !moon) return null;
  const house = ((moon.sign - sun.sign + 12) % 12) + 1;
  const kind: SunMoonKind = [1, 4, 7, 10].includes(house) ? 'kendra' : [2, 5, 8, 11].includes(house) ? 'panaphara' : 'apoklima';
  const lord = lordOfHouse(context, 1);
  const lordRatio = context.ratio[lord];
  const sunRatio = context.ratio.Sun;
  const moonRatio = context.ratio.Moon;
  const lordBody = find(context, lord);
  const beneficAspect = lordBody ? ['Jupiter', 'Mercury', 'Venus'].some(name => name !== lord && seesSign(context, name, lordBody.sign)) : false;
  const stronger = lordRatio === undefined || sunRatio === undefined || moonRatio === undefined ? null : lordRatio > sunRatio && lordRatio > moonRatio;
  return { house, kind, best: house === 6 || house === 9, lagnaLordOvercomes: stronger === null ? null : stronger && beneficAspect, lagnaLordBeneficAspect: beneficAspect };
}

// ── Step 2: the horā ──────────────────────────────────────────────────────────────────────────────────────────
export type HoraOwner = 'sun' | 'moon';
export type HoraVerdict = 'helps' | 'hinders' | 'neutral';
export interface HoraRow {
  name: SevenGraha;
  sign: number;
  degree: number;
  /** The sign is an odd one (Aries, Gemini …). */
  odd: boolean;
  owner: HoraOwner;
  /** Leo (the Sun's horā) or Cancer (the Moon's): the only two signs a horā can be. */
  horaSign: 5 | 4;
  nature: 'malefic' | 'benefic' | 'both';
  verdict: HoraVerdict;
  strong: boolean | null;
}

/** The horā of a longitude in a sign: BPHS 7.5–6. Odd signs: the first 15° the Sun's; even signs: the first 15° the Moon's. */
export function horaOf(sign: number, degree: number): { owner: HoraOwner; horaSign: 5 | 4 } {
  const first = degree < 15;
  const sun = isOdd(sign) ? first : !first;
  return sun ? { owner: 'sun', horaSign: 5 } : { owner: 'moon', horaSign: 4 };
}

export function horaTable(context: TopicContext): HoraRow[] {
  const rows: HoraRow[] = [];
  for (const name of SEVEN) {
    const body = find(context, name);
    if (!body) continue;
    const { owner, horaSign } = horaOf(body.sign, body.degree);
    const odd = isOdd(body.sign);
    const nature: HoraRow['nature'] = name === 'Mercury' ? 'both' : MALEFICS_OF_THE_VERSE.includes(name) ? 'malefic' : 'benefic';
    // Malefics are well placed in the Sun's horā of an odd sign, benefics in the Moon's horā of an even sign (Mercury in either); malefics in the
    // Moon's horā of an odd sign and benefics in the Sun's horā of an even sign are the reverse. The rest is neither.
    const goodSun = odd && owner === 'sun';
    const goodMoon = !odd && owner === 'moon';
    const badMalefic = odd && owner === 'moon';
    const badBenefic = !odd && owner === 'sun';
    let verdict: HoraVerdict = 'neutral';
    if (nature === 'malefic') verdict = goodSun ? 'helps' : badMalefic ? 'hinders' : 'neutral';
    else if (nature === 'benefic') verdict = goodMoon ? 'helps' : badBenefic ? 'hinders' : 'neutral';
    else verdict = goodSun || goodMoon ? 'helps' : 'neutral';
    rows.push({ name, sign: body.sign, degree: body.degree, odd, owner, horaSign, nature, verdict, strong: isStrong(context, name) });
  }
  return rows;
}

// ── Step 3: houses, lords, relationships ─────────────────────────────────────────────────────────────────────────
export interface HouseStrength {
  house: number;
  sign: number;
  lord: SevenGraha;
  lordHouse: number | null;
  lordStrong: boolean | null;
  /** The lord is in the house or aspects it. */
  lordJoins: boolean;
  /** Jupiter aspects the house. */
  jupiterAspects: boolean;
  /** The text's rule: the lord is strong and the house has an aspect from its lord or Jupiter. null when the strength is missing. */
  strong: boolean | null;
}

export function houseStrength(context: TopicContext, house: number): HouseStrength {
  const sign = signOfHouse(context, house);
  const lord = lordOfHouse(context, house);
  const lordBody = find(context, lord);
  const lordJoins = lordBody ? lordBody.sign === sign || aspectsSign(lord, lordBody.sign, sign) : false;
  const jupiter = find(context, 'Jupiter');
  const jupiterAspects = jupiter ? lord !== 'Jupiter' && aspectsSign('Jupiter', jupiter.sign, sign) : false;
  const lordStrong = isStrong(context, lord);
  return {
    house, sign, lord, lordHouse: houseOf(context, lord), lordStrong, lordJoins, jupiterAspects,
    strong: lordStrong === null ? null : lordStrong && (lordJoins || jupiterAspects),
  };
}

export interface Relationship { exchange: boolean; conjunct: boolean; mutualAspect: boolean; same: boolean; any: boolean }
/** The three relationships of two grahas: an exchange of signs, a conjunction, a mutual aspect (or the one graha ruling both). */
export function relationship(context: TopicContext, a: string, b: string): Relationship {
  if (a === b) return { exchange: false, conjunct: false, mutualAspect: false, same: true, any: true };
  const x = find(context, a);
  const y = find(context, b);
  if (!x || !y) return { exchange: false, conjunct: false, mutualAspect: false, same: false, any: false };
  const exchange = lordOfSign(x.sign) === b && lordOfSign(y.sign) === a;
  const conjunct = x.sign === y.sign;
  const mutualAspect = (SEVEN as readonly string[]).includes(a) && (SEVEN as readonly string[]).includes(b) && aspectsSign(a, x.sign, y.sign) && aspectsSign(b, y.sign, x.sign);
  return { exchange, conjunct, mutualAspect, same: false, any: exchange || conjunct || mutualAspect };
}

export type YogaKey = 'lord2lord5' | 'lord2lord11' | 'lord5in5lord9in9' | 'lord2in2lord11in11';
export type YogaStatus = 'present' | 'diluted' | 'broken' | 'absent';
export interface DhanaYoga {
  key: YogaKey;
  /** The houses whose lords are in it. */
  houses: number[];
  /** The condition holds (before the spoilers). */
  formed: boolean;
  /** How it holds, for the lines of evidence. */
  how: string[];
  /** The lords of 6, 8 and 12 that join or aspect the grahas of a relationship, as [house, graha]. */
  spoilers: { house: number; graha: SevenGraha }[];
  status: YogaStatus;
}

const spoilersOf = (context: TopicContext, pair: string[]) => {
  const found: { house: number; graha: SevenGraha }[] = [];
  for (const house of [6, 8, 12]) {
    const graha = lordOfHouse(context, house);
    if (pair.includes(graha)) continue;
    const body = find(context, graha);
    if (!body) continue;
    const joins = pair.some(name => {
      const target = find(context, name);
      return target ? target.sign === body.sign || aspectsSign(graha, body.sign, target.sign) : false;
    });
    if (joins && !found.some(item => item.graha === graha && item.house === house)) found.push({ house, graha });
  }
  return found;
};
/** Jupiter alone as the spoiler only lowers the yoga (it is the kāraka of wealth); another graha almost cancels it. */
const statusOf = (formed: boolean, spoilers: { graha: SevenGraha }[]): YogaStatus => (!formed ? 'absent' : spoilers.length === 0 ? 'present' : spoilers.every(item => item.graha === 'Jupiter') ? 'diluted' : 'broken');

export function dhanaYogas(context: TopicContext): DhanaYoga[] {
  const lord = (house: number) => lordOfHouse(context, house);
  const pair = (key: YogaKey, h1: number, h2: number): DhanaYoga => {
    const a = lord(h1);
    const b = lord(h2);
    const rel = relationship(context, a, b);
    const how = [rel.same ? 'one graha rules both' : '', rel.exchange ? 'exchange of signs' : '', rel.conjunct ? 'conjunction' : '', rel.mutualAspect ? 'mutual aspect' : ''].filter(Boolean);
    const spoilers = rel.any ? spoilersOf(context, a === b ? [a] : [a, b]) : [];
    return { key, houses: [h1, h2], formed: rel.any, how, spoilers, status: statusOf(rel.any, spoilers) };
  };
  const sitsOrSees = (house: number) => {
    const body = find(context, lord(house));
    if (!body) return null;
    const sign = signOfHouse(context, house);
    return body.sign === sign ? 'in' : aspectsSign(lord(house), body.sign, sign) ? 'aspects' : null;
  };
  const both = (key: YogaKey, h1: number, h2: number): DhanaYoga => {
    const x = sitsOrSees(h1);
    const y = sitsOrSees(h2);
    const formed = x !== null && y !== null;
    return { key, houses: [h1, h2], formed, how: formed ? [`${h1}:${x}`, `${h2}:${y}`] : [], spoilers: [], status: formed ? 'present' : 'absent' };
  };
  return [pair('lord2lord5', 2, 5), pair('lord2lord11', 2, 11), both('lord5in5lord9in9', 5, 9), both('lord2in2lord11in11', 2, 11)];
}

export interface LagnaLordState {
  lord: SevenGraha;
  house: number | null;
  strong: boolean | null;
  /** In its own, exalted or a friend's sign (not debilitated, not an enemy's). */
  goodSign: boolean | null;
  inDusthana: boolean;
  /** Distance from the Sun in degrees; the text wants more than 10°. */
  sunDistance: number | null;
  nearSun: boolean;
  /** The dispositor of the Lagna lord is strong. */
  dispositor: SevenGraha | null;
  dispositorStrong: boolean | null;
}

/** The sign is the graha's own, its exaltation, or the sign of a natural friend. */
export const inGoodSign = (name: string, sign: number): boolean | null => {
  if (!(name in OWN_SIGNS)) return null;
  if (OWN_SIGNS[name].includes(sign) || EXALTATION[name] === sign) return true;
  if (DEBILITATION[name] === sign) return false;
  return NATURAL_FRIENDS[name]?.includes(SIGN_LORDS[sign - 1]) === true;
};

export function lagnaLordState(context: TopicContext): LagnaLordState {
  const lord = lordOfHouse(context, 1);
  const body = find(context, lord);
  const sun = find(context, 'Sun');
  const house = body ? houseOfSign(context, body.sign) : null;
  const sunDistance = body && sun && lord !== 'Sun' ? angularSeparation(body.longitude, sun.longitude) : null;
  const dispositor = body ? lordOfSign(body.sign) : null;
  return {
    lord, house, strong: isStrong(context, lord), goodSign: body ? inGoodSign(lord, body.sign) : null,
    inDusthana: house !== null && [6, 8, 12].includes(house),
    sunDistance, nearSun: sunDistance !== null && sunDistance <= 10,
    dispositor, dispositorStrong: dispositor ? isStrong(context, dispositor) : null,
  };
}

export type Earning = 'both' | 'earns' | 'keeps' | 'neither' | 'unknown';
/** The 11th and the 2nd together: strong 11th and weak 2nd earns but does not build; the 2nd alone, inherited and saved. */
export const earningOf = (second: HouseStrength, eleventh: HouseStrength): Earning => {
  if (second.strong === null || eleventh.strong === null) return 'unknown';
  return second.strong && eleventh.strong ? 'both' : eleventh.strong ? 'earns' : second.strong ? 'keeps' : 'neither';
};

// ── The reconfirmation ───────────────────────────────────────────────────────────────────────────────────────────
export const VARGAS = [9, 3, 2, 12, 30] as const;
export type MoneyVarga = (typeof VARGAS)[number];
export interface VargaPlace { division: MoneyVarga; sign: number; good: boolean | null; lordStrong: boolean | null }
export interface MoneyGraha {
  name: SevenGraha;
  /** Why it is read: the lords of 1, 2, 11, Jupiter, the grahas the horā of step 2 helps. */
  reasons: ('lagnaLord' | 'lord2' | 'lord11' | 'jupiter' | 'hora')[];
  rasiSign: number;
  vargas: VargaPlace[];
  /** In the same sign in D1 and D9 and not debilitated. */
  vargottama: boolean;
  /** Of the five vargas, the number in a good sign. */
  goodCount: number;
}

/** The lords of the Lagna, 2nd and 11th, Jupiter and the grahas the horā helps, each in the five vargas. */
export function moneyGrahas(context: TopicContext, hora: HoraRow[]): MoneyGraha[] {
  const reasons = new Map<SevenGraha, MoneyGraha['reasons']>();
  const add = (name: SevenGraha, reason: MoneyGraha['reasons'][number]) => reasons.set(name, [...(reasons.get(name) ?? []), reason]);
  add(lordOfHouse(context, 1), 'lagnaLord');
  add(lordOfHouse(context, 2), 'lord2');
  if (!reasons.get(lordOfHouse(context, 11))?.includes('lord11')) add(lordOfHouse(context, 11), 'lord11');
  add('Jupiter', 'jupiter');
  for (const row of hora) if (row.verdict === 'helps') add(row.name, 'hora');
  const result: MoneyGraha[] = [];
  for (const [name, why] of reasons) {
    const body = find(context, name);
    if (!body) continue;
    const vargas = VARGAS.map((division): VargaPlace => {
      const sign = getVargaSignIndex(body.longitude, division) + 1;
      return { division, sign, good: inGoodSign(name, sign), lordStrong: isStrong(context, lordOfSign(sign)) };
    });
    const navamsa = vargas.find(item => item.division === 9)?.sign;
    result.push({
      name, reasons: [...new Set(why)], rasiSign: body.sign, vargas,
      vargottama: navamsa === body.sign && DEBILITATION[name] !== body.sign,
      goodCount: vargas.filter(item => item.good === true).length,
    });
  }
  return result;
}

export interface FromMoon {
  moonStrong: boolean | null;
  second: HouseStrength;
  eleventh: HouseStrength;
  yogas: DhanaYoga[];
}
/** The same houses and yogas counted from the Moon's sign (the experience of the mind). */
export function fromMoon(context: TopicContext): FromMoon | null {
  const moon = find(context, 'Moon');
  if (!moon) return null;
  const view: TopicContext = { ...context, ascendantSign: moon.sign, ascendantLongitude: undefined };
  return { moonStrong: isStrong(context, 'Moon'), second: houseStrength(view, 2), eleventh: houseStrength(view, 11), yogas: dhanaYogas(view) };
}

export interface Comforts {
  /** The lord of the rising navāṁśa and whether it is strong in the rāśi: comforts even with little money. null: no Lagna longitude. */
  navamsaLord: { sign: number; lord: SevenGraha; strong: boolean | null } | null;
  /** The lord of the rising drekkāṇa: status and respect. */
  drekkanaLord: { sign: number; lord: SevenGraha; strong: boolean | null } | null;
  /** Benefics and malefics in the upachaya houses 3, 6, 10 and 11: ease against hard work. */
  upachayaBenefics: string[];
  upachayaMalefics: string[];
}

export function comfortsOf(context: TopicContext): Comforts {
  const longitude = context.ascendantLongitude;
  const rising = (division: 9 | 3) => {
    if (longitude === undefined) return null;
    const sign = getVargaSignIndex(longitude, division) + 1;
    const lord = lordOfSign(sign) as SevenGraha;
    return { sign, lord, strong: isStrong(context, lord) };
  };
  const inUpachaya = context.planets.filter(planet => (SEVEN as readonly string[]).includes(planet.name) && [3, 6, 10, 11].includes(houseOfSign(context, planet.sign)));
  return {
    navamsaLord: rising(9), drekkanaLord: rising(3),
    upachayaBenefics: inUpachaya.filter(planet => BENEFICS_OF_THE_VERSE.includes(planet.name)).map(planet => planet.name),
    upachayaMalefics: inUpachaya.filter(planet => MALEFICS_OF_THE_VERSE.includes(planet.name)).map(planet => planet.name),
  };
}

// ── All together ─────────────────────────────────────────────────────────────────────────────────────────────────
export interface WealthAssessment {
  step1: SunMoonStructure | null;
  hora: HoraRow[];
  houses: Record<2 | 5 | 9 | 11, HouseStrength>;
  yogas: DhanaYoga[];
  /** The lord of the 2nd and of the 11th are one graha (Leo and Aquarius rising): it must be strong with a strong dispositor and join the lord of the 5th or the 9th. */
  singleMoneyLord: { graha: SevenGraha; strong: boolean | null; dispositorStrong: boolean | null; joinsTrikona: boolean } | null;
  lagnaLord: LagnaLordState;
  earning: Earning;
  jupiter: { strong: boolean | null; hora: HoraVerdict | null; house: number | null };
  /** The grahas that show up in the horā of step 2 and again as lords or kāraka in step 3, with how many times. */
  recurring: { name: SevenGraha; times: number }[];
  moon: FromMoon | null;
  money: MoneyGraha[];
  comforts: Comforts;
  tally: { supports: number; hinders: number; open: number };
}

export function assessWealth(context: TopicContext): WealthAssessment {
  const hora = horaTable(context);
  const houses = { 2: houseStrength(context, 2), 5: houseStrength(context, 5), 9: houseStrength(context, 9), 11: houseStrength(context, 11) };
  const yogas = dhanaYogas(context);
  const l2 = lordOfHouse(context, 2);
  const lagnaLord = lagnaLordState(context);
  let singleMoneyLord: WealthAssessment['singleMoneyLord'] = null;
  if (l2 === lordOfHouse(context, 11)) {
    const body = find(context, l2);
    singleMoneyLord = {
      graha: l2,
      strong: isStrong(context, l2),
      dispositorStrong: body ? isStrong(context, lordOfSign(body.sign)) : null,
      joinsTrikona: [5, 9].some(house => { const other = lordOfHouse(context, house); return other !== l2 && relationship(context, l2, other).any; }),
    };
  }
  const jupiterRow = hora.find(row => row.name === 'Jupiter');
  const moneyLords = new Map<SevenGraha, number>();
  for (const house of [1, 2, 5, 9, 11]) { const lord = lordOfHouse(context, house); moneyLords.set(lord, (moneyLords.get(lord) ?? 0) + 1); }
  moneyLords.set('Jupiter', (moneyLords.get('Jupiter') ?? 0) + 1);
  const recurring = hora.filter(row => row.verdict === 'helps' && moneyLords.has(row.name)).map(row => ({ name: row.name, times: (moneyLords.get(row.name) ?? 0) + 1 }));
  const moon = fromMoon(context);
  const comforts = comfortsOf(context);
  const sm = sunMoonStructure(context);

  // The app's own tally of the checks, not the text's: every check that can be judged counts for or against; the rest are left open.
  const marks: (boolean | null)[] = [];
  if (sm) marks.push(sm.kind === 'apoklima' ? true : sm.kind === 'kendra' ? (sm.lagnaLordOvercomes ? true : false) : null);
  marks.push(lagnaLord.strong, lagnaLord.goodSign, lagnaLord.house === null ? null : !lagnaLord.inDusthana, lagnaLord.sunDistance === null ? null : !lagnaLord.nearSun);
  marks.push(houses[2].strong, houses[11].strong);
  marks.push(jupiterRow ? (jupiterRow.verdict === 'helps' ? true : jupiterRow.verdict === 'hinders' ? false : null) : null, isStrong(context, 'Jupiter'));
  for (const yoga of yogas) marks.push(yoga.status === 'present' || yoga.status === 'diluted' ? true : yoga.status === 'broken' ? false : null);
  marks.push(moon ? moon.second.strong : null, moon ? moon.eleventh.strong : null);
  const tally = { supports: marks.filter(mark => mark === true).length, hinders: marks.filter(mark => mark === false).length, open: marks.filter(mark => mark === null).length };

  return {
    step1: sm, hora, houses, yogas, singleMoneyLord, lagnaLord, earning: earningOf(houses[2], houses[11]),
    jupiter: { strong: isStrong(context, 'Jupiter'), hora: jupiterRow?.verdict ?? null, house: houseOf(context, 'Jupiter') },
    recurring, moon, money: moneyGrahas(context, hora), comforts, tally,
  };
}
