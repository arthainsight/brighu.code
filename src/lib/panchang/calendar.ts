// The parts of the sankalpa that the five limbs do not carry: the year of the sixty-year cycle (Samvatsara), the Ayana, the Ritu, the Paksha and the Kāla of the day.
// Choices made here are named where they are made (docs/panchang-calendar.md).

import { normalizeDegrees } from '../angles';

/** The sixty samvatsaras of the cycle, Prabhava first. */
export const SAMVATSARA_NAMES = [
  'Prabhava', 'Vibhava', 'Shukla', 'Pramoda', 'Prajotpatti', 'Angirasa', 'Shrimukha', 'Bhava', 'Yuva', 'Dhatri',
  'Ishvara', 'Bahudhanya', 'Pramathi', 'Vikrama', 'Vrisha', 'Chitrabhanu', 'Subhanu', 'Tarana', 'Parthiva', 'Vyaya',
  'Sarvajit', 'Sarvadhari', 'Virodhi', 'Vikrita', 'Khara', 'Nandana', 'Vijaya', 'Jaya', 'Manmatha', 'Durmukhi',
  'Hevilambi', 'Vilambi', 'Vikari', 'Sharvari', 'Plava', 'Shubhakrit', 'Shobhakrit', 'Krodhi', 'Vishvavasu', 'Parabhava',
  'Plavanga', 'Kilaka', 'Saumya', 'Sadharana', 'Virodhikrit', 'Paridhavi', 'Pramadi', 'Ananda', 'Rakshasa', 'Nala',
  'Pingala', 'Kalayukti', 'Siddharthi', 'Raudra', 'Durmati', 'Dundubhi', 'Rudhirodgari', 'Raktakshi', 'Krodhana', 'Akshaya',
] as const;

export interface Samvatsara {
  /** 1–60. */
  number: number;
  name: string;
  /** The Śaka year of the lunar year that has the date, and the Gregorian year its Chaitra begins in. */
  shaka: number;
  startYear: number;
  /** True when the lunar month was not known and the year is told from the date only (within a few weeks of Ugadi it can be a year off). */
  approximate: boolean;
}

/**
 * The lunar year a date is in: it begins with Chaitra (the amānta month after the new moon before Mesha), in March or April. The month (0 Chaitra … 11 Phālguna), when known,
 * says whether a date in January to March still belongs to the year that began the spring before: Magha and Phālguna do, and so does Pausha in January. Without the month
 * a date before 14 April counts as the old year (the day the Sun enters sidereal Aries), which is a few weeks wrong at Ugadi.
 */
export function lunarYearStart(year: number, month: number, day: number, masaIndex: number | null): { startYear: number; approximate: boolean } {
  const position = month + (day - 1) / 31;
  if (masaIndex === null) return { startYear: position < 4.45 ? year - 1 : year, approximate: true };
  // Where in the calendar year the month begins, about: Chaitra at the turn of March and April, a month on for each.
  const expected = 3.5 + masaIndex;
  return { startYear: expected - position > 6 ? year - 1 : year, approximate: false };
}

/**
 * The samvatsara of the sixty-year cycle that runs with the Śaka year (the Chandramāna cycle of the South: (Śaka + 11) mod 60, the 38th, Krodhi, from Ugadi 2024). The
 * Bṛhaspati cycle of the North goes by Jupiter's own sign and skips a year every eighty-five or so; it is not this.
 */
export function samvatsaraOf(year: number, month: number, day: number, masaIndex: number | null): Samvatsara {
  const { startYear, approximate } = lunarYearStart(year, month, day, masaIndex);
  const shaka = startYear - 78;
  const number = ((shaka + 11) % 60) + 1;
  return { number, name: SAMVATSARA_NAMES[number - 1], shaka, startYear, approximate };
}

export type Ayana = 'Uttarayana' | 'Dakshinayana';
const ayanaAt = (longitude: number): Ayana => {
  const lon = normalizeDegrees(longitude);
  return lon >= 270 || lon < 90 ? 'Uttarayana' : 'Dakshinayana';
};

/**
 * The Ayana: Uttarayana while the Sun is in sidereal Makara to Mithuna (from the Makara saṅkrānti to the Karka one), Dakshinayana from Karka to Dhanu. `tropicalSun` gives the
 * sāyana Ayana as well, which turns at the solstices a month earlier (about 22 December and 21 June).
 */
export function ayanaOf(siderealSun: number, tropicalSun?: number): { ayana: Ayana; sayana?: Ayana } {
  const ayana = ayanaAt(siderealSun);
  if (tropicalSun === undefined) return { ayana };
  const sayana = ayanaAt(tropicalSun);
  return sayana === ayana ? { ayana } : { ayana, sayana };
}

export const RITU_NAMES = ['Vasanta', 'Grishma', 'Varsha', 'Sharad', 'Hemanta', 'Shishira'] as const;

/**
 * The Ritu: two lunar months each from Chaitra (Vasanta Chaitra and Vaishakha … Shishira Magha and Phālguna), which is what the sankalpa names; the solar Ritu goes by the
 * sidereal sign of the Sun (Vasanta Mīna and Meṣa … Shishira Makara and Kumbha), about a month later at the start. Adhika months take the Ritu of their own name.
 */
export function rituOf(masaIndex: number | null, siderealSun: number): { ritu: string; solar: string } {
  const sign = Math.floor(normalizeDegrees(siderealSun) / 30);
  const solar = RITU_NAMES[Math.floor(((sign + 1) % 12) / 2)];
  return { ritu: masaIndex === null ? solar : RITU_NAMES[Math.floor(masaIndex / 2)], solar };
}

/** The Kāla names, with what they mean (English; the page translates). */
export const KALA_MEANING: Record<string, string> = {
  'Pratyūsha': 'dawn', 'Sūryodaya': 'sunrise', 'Prātaḥ': 'morning', 'Saṅgava': 'forenoon', 'Madhyāhna': 'midday', 'Parāhna': 'afternoon', 'Sāyankāla': 'evening / twilight', 'Rātri': 'night',
};
export const KALA_NIGHT = ['Pradosha', 'Nishitha', 'Ushah'] as const;

export interface Kala {
  name: string;
  day: boolean;
  /** The part in local hours, from and to (past 24 for the night that runs through midnight). */
  from: number;
  to: number;
  /** Of the night, the third (Pradosha, Nishitha, Ushah) the moment is in. */
  third?: string;
}

/**
 * The Kāla of the moment for a sankalpa, eight parts that run into one another all round the day:
 *   Sūryodaya   the first muhūrta of the day (a fifteenth of the day) from sunrise;
 *   Prātaḥ      the rest of the first fifth of the day;
 *   Saṅgava, Madhyāhna, Parāhna   the second, third and fourth fifths (the Aparāhṇa of the dharmaśāstra is the Parāhna here);
 *   Sāyankāla   the fifth fifth to sunset and on through the twilight, a fifteenth of the night (a night muhūrta);
 *   Rātri       the night after that, with its third (Pradosha, Nishitha, Ushah) told beside it;
 *   Pratyūsha   the last two muhūrtas of the night before sunrise (the Brahma muhūrta).
 * The fifths of the day, the muhūrta of the day and of the night and the thirds of the night are choices made here (docs/panchang-calendar.md); a birth before sunrise is in the
 * night before. Null when the Sun does not rise and set.
 */
export function kalaOf(local: number, sunrise: number | null, sunset: number | null, nextSunrise: number | null, previousSunset: number | null): Kala | null {
  if (sunrise === null || sunset === null) return null;
  const night = (from: number, to: number): Kala => {
    const length = to - from;
    const muhurta = length / 15;
    if (local < from + muhurta && from === sunset) return { name: 'Sāyankāla', day: true, from: sunset - (sunset - sunrise) / 5, to: from + muhurta };
    if (local >= to - 2 * muhurta) return { name: 'Pratyūsha', day: false, from: to - 2 * muhurta, to };
    const index = Math.max(0, Math.min(2, Math.floor(((local - from) / length) * 3)));
    return { name: 'Rātri', day: false, from: from + muhurta, to: to - 2 * muhurta, third: KALA_NIGHT[index] };
  };
  if (local < sunrise) return previousSunset === null ? null : night(previousSunset, sunrise);
  if (local >= sunset) return nextSunrise === null ? null : night(sunset, nextSunrise);
  const day = sunset - sunrise;
  const fifth = day / 5;
  const muhurta = day / 15;
  const at = (name: string, from: number, to: number): Kala => ({ name, day: true, from, to });
  if (local < sunrise + muhurta) return at('Sūryodaya', sunrise, sunrise + muhurta);
  const index = Math.min(4, Math.floor((local - sunrise) / fifth));
  const names = ['Prātaḥ', 'Saṅgava', 'Madhyāhna', 'Parāhna', 'Sāyankāla'] as const;
  const from = sunrise + index * fifth;
  return at(names[index], index === 0 ? sunrise + muhurta : from, index === 4 && nextSunrise !== null ? sunset + (nextSunrise - sunset) / 15 : from + fifth);
}

/** Local decimal hours as HH:MM, rounded to the minute (past 24 wraps to the next day). */
export function clockMinutes(hours: number): string {
  const total = Math.round(hours * 60);
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${String(Math.floor(wrapped / 60)).padStart(2, '0')}:${String(wrapped % 60).padStart(2, '0')}`;
}
