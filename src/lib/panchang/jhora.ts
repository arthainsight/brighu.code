// The fields of Jagannatha Hora's panchanga that the five limbs and the sankalpa do not carry: the Hora Lord and the Mahakala Hora (two sets of equal horas), the Kaala Lord,
// the Janma Ghatis and the sunrise it counts from. What each one is, and how sure that is, is in docs/panchanga-record.md and docs/jhora-panchanga-sources.md: JHora's own help is not
// on the web as text, so the rules here are those the outputs of JHora follow (read from eighteen printed outputs and checked on the user's chart), not a quotation of its manual.
// They are kept apart from the app's own Hora (the unequal horas, day/12 and night/12) and Kāla, and never merged with them.

export const HORA_ORDER = ['Sun', 'Venus', 'Mercury', 'Moon', 'Saturn', 'Jupiter', 'Mars'] as const;
export const WEEKDAY_LORDS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const FIRST_HORA = [0, 3, 6, 2, 5, 1, 4];   // weekday → index of its lord in HORA_ORDER

/** The sign (1 Aries … 12 Pisces) a hora's twelve five-minute parts start from, by lord and by day or night. Mercury by day and Saturn by night are inferred, not seen. */
const FIVE_MINUTE_START: Record<string, { day: number; night: number; inferred?: ('day' | 'night')[] }> = {
  Sun: { day: 5, night: 4 }, Moon: { day: 5, night: 4 }, Mars: { day: 8, night: 1 }, Mercury: { day: 6, night: 3, inferred: ['day'] },
  Jupiter: { day: 12, night: 9 }, Venus: { day: 7, night: 2 }, Saturn: { day: 11, night: 10, inferred: ['night'] },
};

export interface HoraPart {
  lord: string;
  /** 1–24 from the start of the day. */
  number: number;
  /** The hora on the line of the clock it was counted on (hours; local mean time for the Mahakala Hora). */
  start: number;
  end: number;
  /** The twelve parts of five minutes: which one the moment is in (1–12), its sign (1–12), and whether the starting sign of this lord and half is inferred. */
  fivePart: number;
  fiveSign: number;
  fiveInferred: boolean;
  /** The weekday (0 Sunday) the hora count is of. */
  weekday: number;
  /** True for the horas of the day half, false for the night. */
  day: boolean;
}

/**
 * An equal hora: a day from `dayStart` in 24 horas of an hour each, the first belonging to the lord of the weekday and the others to the lords in the order Sun, Venus, Mercury, Moon,
 * Saturn, Jupiter, Mars (the order of the Kālahorā of Jātakapārijāta 9.126–127 too, which is of equal parts of 2½ ghaṭī). `birth` is on the same line of hours as `dayStart`.
 */
export function equalHora(birth: number, dayStart: number, weekday: number, isDay: boolean): HoraPart {
  const since = birth - dayStart;
  const index = Math.min(23, Math.max(0, Math.floor(since)));
  const lord = HORA_ORDER[(FIRST_HORA[weekday] + index) % 7];
  const fivePart = Math.min(11, Math.max(0, Math.floor((since - index) * 12)));
  const start = FIVE_MINUTE_START[lord];
  const half = isDay ? 'day' : 'night';
  return {
    lord, number: index + 1, start: dayStart + index, end: dayStart + index + 1, fivePart: fivePart + 1,
    fiveSign: ((start[half] - 1 + fivePart) % 12) + 1, fiveInferred: Boolean(start.inferred?.includes(half)), weekday, day: isDay,
  };
}

/** The Janma Ghatis: the ghaṭīs (24 minutes each) from the last sunrise to the birth, no scaling to the length of the day. */
export const janmaGhatis = (birth: number, sunrise: number) => (birth - sunrise) / 0.4;

/** The weekday (0 Sunday) of a birth on a day of the calendar when the day changes at `change` (a sunrise): before it the weekday before. */
export const weekdayAt = (calendarWeekday: number, birth: number, change: number) => (birth < change ? (calendarWeekday + 6) % 7 : calendarWeekday);

/**
 * The Mahakala Hora: the same equal horas, counted from 06:00 of local mean time (the clock less the zone plus the longitude in time), the weekday changing at 06:00 and the day
 * half running from 06:00 to 18:00. Returns the hora on the line of local mean time of the day it is counted for.
 */
export function mahakalaHora(birth: number, utcOffset: number, longitude: number, calendarWeekday: number): HoraPart & { lmt: number } {
  const lmtTotal = birth - utcOffset + longitude / 15;
  const shift = Math.floor(lmtTotal / 24);
  const lmt = lmtTotal - shift * 24;
  const weekday = (((calendarWeekday + shift) % 7) + 7) % 7;
  // Before 06:00 it is the weekday before, counted from 06:00 of its day.
  const dayStart = lmt < 6 ? -18 : 6;
  const countWeekday = lmt < 6 ? (weekday + 6) % 7 : weekday;
  const position = lmt < 6 ? lmt : lmt;
  const part = equalHora(position, dayStart, countWeekday, lmt >= 6 && lmt < 18);
  return { ...part, lmt };
}

export const KAALA_ORDER = ['Sun', 'Mars', 'Jupiter', 'Mercury', 'Venus', 'Saturn', 'Moon', 'Rahu'] as const;

export interface KaalaPart {
  lord: string;
  /** 1–8. */
  part: number;
  start: number;
  end: number;
}

/**
 * The Kaala Lord by day: the time from `start` to `end` (sunrise to sunset) in eight equal parts, the first belonging to the lord of the weekday and the others to the lords in the
 * order Sun, Mars, Jupiter, Mercury, Venus, Saturn, Moon, Rahu on from it. The part of Rahu is then the Rahu Kāla of the almanacs on every weekday. Null for a moment outside the span:
 * the rule for the night is not known.
 */
export function kaalaLord(birth: number, start: number, end: number, weekday: number): KaalaPart | null {
  if (!(birth >= start && birth < end)) return null;
  const size = (end - start) / 8;
  const part = Math.min(7, Math.floor((birth - start) / size));
  const first = KAALA_ORDER.indexOf(WEEKDAY_LORDS[weekday] as (typeof KAALA_ORDER)[number]);
  return { lord: KAALA_ORDER[(first + part) % 8], part: part + 1, start: start + part * size, end: start + (part + 1) * size };
}
