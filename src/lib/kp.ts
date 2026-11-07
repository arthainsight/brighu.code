// Krishnamurti Paddhati: every point of the zodiac has a sign lord, a star lord (the lord of its nakshatra), a sub lord and a
// sub-sub lord. The nakshatra is divided among the nine Vimshottari lords in proportion to their years, beginning with the
// lord of the nakshatra itself; the sub is divided the same way, beginning with the sub lord. These are the 243 subs (249
// when the six that a sign border splits are counted twice) of the KP table.

import { NAKSHATRA_SIZE } from './nakshatras';
import { normalizeDegrees } from './angles';
import { VIMSHOTTARI_LORDS, VIMSHOTTARI_YEARS } from './vimshottari';
import { SIGN_LORDS } from './signs';

export interface KpLords {
  sign: number;
  signLord: string;
  starLord: string;
  subLord: string;
  subSubLord: string;
}

const TOTAL_YEARS = 120;

/** The lord whose share of a span (0 to 1) holds the fraction, the lords counted on from `first`; also gives where its share begins and its size. */
function lordAt(first: string, fraction: number): { lord: string; from: number; size: number } {
  const start = VIMSHOTTARI_LORDS.indexOf(first as (typeof VIMSHOTTARI_LORDS)[number]);
  let from = 0;
  for (let step = 0; step < 9; step += 1) {
    const lord = VIMSHOTTARI_LORDS[(start + step) % 9];
    const size = VIMSHOTTARI_YEARS[lord] / TOTAL_YEARS;
    if (fraction < from + size || step === 8) return { lord, from, size };
    from += size;
  }
  /* istanbul ignore next */
  throw new Error('unreachable');
}

/** The sign, star, sub and sub-sub lords of a sidereal longitude. */
export function kpLords(longitude: number): KpLords {
  const lon = normalizeDegrees(longitude);
  const sign = Math.floor(lon / 30) + 1;
  const nakshatra = Math.min(26, Math.floor(lon / NAKSHATRA_SIZE));
  const starLord = VIMSHOTTARI_LORDS[nakshatra % 9];
  const inStar = (lon - nakshatra * NAKSHATRA_SIZE) / NAKSHATRA_SIZE;
  const sub = lordAt(starLord, inStar);
  const inSub = Math.min(1, Math.max(0, (inStar - sub.from) / sub.size));
  const subSub = lordAt(sub.lord, inSub);
  return { sign, signLord: SIGN_LORDS[sign - 1], starLord, subLord: sub.lord, subSubLord: subSub.lord };
}

/** The lords of a longitude as "Mars–Ketu–Venus" style text, for tables. */
export const kpChain = (lords: KpLords): string => `${lords.starLord} · ${lords.subLord} · ${lords.subSubLord}`;

