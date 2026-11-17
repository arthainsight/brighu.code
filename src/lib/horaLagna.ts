// Surya Hora Lagna and Lagna Hora Lagna, with the avatāra of the birth hour: after a lesson on the Hora Lagna, the 24 avatāras of the Garuḍa Purāṇa and
// the two kinds of wealth (not a rule of BPHS, and the page says so; docs/hora-lagna.md).
//
// The lesson counts the Hora Lagna from two starting points, each moved by the time from sunrise to birth at 30° an hour (a sign an hour, the Hora Lagna's
// double speed against the 15° of the Bhāva Lagna):
//   Surya HL  starts from the Sun  (the material wealth, Kubera: cash, cars, property; it ends with the life)
//   Lagna HL  starts from the Lagna (the intellectual wealth, Gaṇeśa and Śiva: knowledge, the occult, insight; it outlives the death)
// The direction follows the sign of the starting point: the savya (forward) signs add the arc, the apasavya (reversed) signs take it away.
//   savya:    Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius
//   apasavya: Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces
// The standard Parāśara Hora Lagna (the Sun + 12° a ghaṭī, always forward) is the Surya HL of a Sun in a savya sign; it is given beside them.

import { normalizeDegrees as normalize } from './angles';

/** Degrees a Hora Lagna moves in an hour. */
export const HL_DEGREES_PER_HOUR = 30;

export type Direction = 'savya' | 'apasavya';

/** The direction of the count for a sign counted from 1 (Aries). */
export function directionOfSign(sign: number): Direction {
  return [1, 2, 3, 7, 8, 9].includes(sign) ? 'savya' : 'apasavya';
}

export interface HoraLagnaPoint {
  /** What the count started from. */
  from: 'Sun' | 'Lagna';
  startLongitude: number;
  startSign: number;
  direction: Direction;
  /** The arc taken, in degrees (not reduced to a circle). */
  arc: number;
  longitude: number;
  /** Sign 1–12. */
  sign: number;
  /** Degrees within the sign. */
  degree: number;
}

function horaLagnaFrom(from: 'Sun' | 'Lagna', start: number, hours: number): HoraLagnaPoint {
  const startLongitude = normalize(start);
  const startSign = Math.floor(startLongitude / 30) + 1;
  const direction = directionOfSign(startSign);
  const arc = hours * HL_DEGREES_PER_HOUR;
  const longitude = normalize(startLongitude + (direction === 'savya' ? arc : -arc));
  return { from, startLongitude, startSign, direction, arc, longitude, sign: Math.floor(longitude / 30) + 1, degree: longitude % 30 };
}

export interface HoraLagnaResult {
  /** The hours from sunrise to birth. */
  hours: number;
  surya: HoraLagnaPoint;
  lagna: HoraLagnaPoint;
  /** The standard Parāśara Hora Lagna, the Sun + 30° an hour whatever the sign. */
  standard: { longitude: number; sign: number; degree: number };
  /** True when the Surya HL and the standard one are the same point (a Sun in a savya sign). */
  suryaIsStandard: boolean;
}

/** The two Hora Lagnas from the Sun and the Lagna, and the hours (not the ghaṭīs) from sunrise to birth. */
export function horaLagnas(sunLongitude: number, ascendantLongitude: number, hoursFromSunrise: number): HoraLagnaResult {
  const surya = horaLagnaFrom('Sun', sunLongitude, hoursFromSunrise);
  const lagna = horaLagnaFrom('Lagna', ascendantLongitude, hoursFromSunrise);
  const standardLongitude = normalize(sunLongitude + HL_DEGREES_PER_HOUR * hoursFromSunrise);
  return {
    hours: hoursFromSunrise,
    surya,
    lagna,
    standard: { longitude: standardLongitude, sign: Math.floor(standardLongitude / 30) + 1, degree: standardLongitude % 30 },
    suryaIsStandard: surya.direction === 'savya',
  };
}

/** The distance in degrees between two longitudes, 0–180. */
export const separation = (a: number, b: number) => {
  const d = Math.abs(normalize(a) - normalize(b));
  return d > 180 ? 360 - d : d;
};

// --- The 24 avatāras of the Garuḍa Purāṇa, two to a sign of the day -----------------------------------------------------------------------------

export interface AvataraPair {
  sign: number;
  /** The first and the second hour of the two. */
  avatars: [string, string];
  role: string;
}

/**
 * The day is cut into twelve signs of two hours from 06:00; each sign has two avatāras, the first named for its first hour. The order inside a pair is
 * the order the lesson names them, which fits what it says of Kṛṣṇa (just after midnight), Hayagrīva (just before sunrise), Mohinī (just after
 * sunset) and Dhanvantari (before it).
 */
export const AVATARA_PAIRS: readonly AvataraPair[] = [
  { sign: 1, avatars: ['Chatushana', 'Varaha'], role: 'Dawn, the impulse of creation and the lighting of the metabolism.' },
  { sign: 2, avatars: ['Narada', 'Nara-Narayana'], role: 'Devotion (bhakti), right action and spiritual discipline.' },
  { sign: 3, avatars: ['Kapila', 'Dattatreya'], role: 'Sankhya philosophy, the intellect and the inner teacher.' },
  { sign: 4, avatars: ['Rishabha', 'Yagya'], role: 'Protection, nourishment and the act of sacrifice.' },
  { sign: 5, avatars: ['Prithu', 'Matsya'], role: 'The rule of the earth, resources and the rescue of souls.' },
  { sign: 6, avatars: ['Kachhapa', 'Dhanvantari'], role: 'Healing, health and the preparing of the Amrit before sunset.' },
  { sign: 7, avatars: ['Mohini', 'Narasimha'], role: 'The edge of sunset: the Amrit goes to the powers of light, and protection from the dark.' },
  { sign: 8, avatars: ['Vamana', 'Parasurama'], role: 'Occult powers, the crossing of thresholds and the breaking of maya.' },
  { sign: 9, avatars: ['Vyasa', 'Rama'], role: 'Dharma, the scriptures and righteous kingship.' },
  { sign: 10, avatars: ['Krishna', 'Balarama'], role: 'The deepest protection of midnight: the dark overcome, and Abhijit Muhurta.' },
  { sign: 11, avatars: ['Buddha', 'Kalki'], role: 'The denial of the illusory world and the cleansing renewal.' },
  { sign: 12, avatars: ['Yajna', 'Hayagriva'], role: 'Brahma Muhurta: the rescue of the Vedas from the dark before the new morning.' },
];

/** The sign of the day (1 = Aries) a clock hour falls in, with the day starting at `startHour`. */
export function avataraOfHour(clockHours: number, startHour = 6): { sign: number; avatar: string; companion: string; window: [number, number]; pair: AvataraPair } {
  const since = (((clockHours - startHour) % 24) + 24) % 24;
  const hourIndex = Math.min(23, Math.floor(since));
  const pair = AVATARA_PAIRS[Math.floor(hourIndex / 2)];
  const second = hourIndex % 2;
  const begin = (startHour + hourIndex) % 24;
  return { sign: pair.sign, avatar: pair.avatars[second], companion: pair.avatars[1 - second], window: [begin, (begin + 1) % 24], pair };
}

/** Decimal hours as HH:MM. */
export const clockText = (hours: number) => {
  const total = Math.round((((hours % 24) + 24) % 24) * 60) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

/** What each protector stands for in the lesson; only the ones it describes. */
export const AVATARA_NOTES: Record<string, string> = {
  Hayagriva: 'Guardian of the Vedas and the highest knowledge; a drive to protect pure knowledge and the spiritual heritage against the dark.',
  Krishna: 'Protection in the deepest dark of Kali Yuga: repeated attacks but a lasting shelter through the power of the Moon.',
  Parasurama: 'The power to rise again when buried or crushed by circumstance (the lesson ties it to the Venus exalted in Pisces).',
  Mohini: 'The Amrit given to the powers of light just after sunset; the spiritual elixir spread through dance and mantra.',
  Dhanvantari: 'The healer and the bearer of the Amrit vessel, before sunset.',
};
