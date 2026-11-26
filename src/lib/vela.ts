// The Vela of birth (Jātakapārijāta 9.123–125 in V. Subrahmanya Sastri's numbering; 124–126 in the Kāśī editions): Sattva, Rajas or Tamas, by the half-yāma (ardha-yāma) of the
// weekday the birth falls in. docs/jataka-parijata-vela-sources.md has what the sources say and what they leave unsettled.
//
// Settled by the text and its commentary (the Sudhāśālinī, Sastri's note, Mishra 2018):
//   * a weekday has 16 half-yāmas ("8 praharas = 16"), and the Velas run Tamas, Sattva, Rajas, Tamas, … in one unbroken cycle from the first half-yāma of Sunday, which is Tamas;
//     the first Velas of Sunday to Saturday are Tamas, Sattva, Rajas, Tamas, Sattva, Rajas, Tamas (the seven words of 9.125) and the last of each day is the same as its first.
// NOT settled, and the program says so (VELA_UNCONFIRMED):
//   * how long a half-yāma is: Sastri and the Gujarati tables say an hour and a half (3¾ ghaṭī), a fixed length; Mishra says an eighth of the day and an eighth of the night, in
//     proportion (as Parāśara's eighths of the day and the night). Both are given.
//   * where the count starts: by the parallel rules (BPHS 3.66–67, Phaladīpikā 25.2) the day's eighths from sunrise and the night's from sunset; the verse says only "from Sunday on".
//   * when the weekday changes: by the Kālahorā of the same chapter, at sunrise; no text says so for the Vela.
//   * how a birth is placed: "the Vela at the time of birth", with no algorithm and no worked example.

export type Guna = 'Sattva' | 'Rajas' | 'Tamas';
export type VelaMethod = 'fixed' | 'proportional';

/** The cycle of the Velas, the Tamas first (the first half-yāma of Sunday). */
export const GUNA_CYCLE: readonly Guna[] = ['Tamas', 'Sattva', 'Rajas'];

/** The half-yāmas of a weekday. */
export const VELA_PARTS = 16;
/** The half-yāma Sastri gives: an hour and a half (3¾ ghaṭī), in hours. */
export const FIXED_VELA_HOURS = 1.5;

/** The Vela of the half-yāma `segment` (1–16) of a weekday (0 Sunday … 6 Saturday): the cycle goes on unbroken through all of them. */
export const velaGuna = (weekday: number, segment: number): Guna => GUNA_CYCLE[(VELA_PARTS * weekday + segment - 1) % 3];

/** What the program cannot take from the text. */
export const VELA_UNCONFIRMED = [
  'The Sanskrit says only "half-yāma" (ardha-yāma). V. Subrahmanya Sastri\'s note makes it an hour and a half (3¾ ghaṭī), Satyendra Mishra\'s commentary (2018) an eighth of the day and an eighth of the night; the text does not decide, so both are given.',
  'The verse says only "from Sunday on": that the count starts at sunrise (the day\'s eight parts) and at sunset (the night\'s eight) is taken from the parallel rule of Parāśara\'s upagrahas (BPHS 3.66–67, Phaladīpikā 25.2), not from a statement about the Vela.',
  'That the weekday changes at sunrise is taken from the Kālahorā of the same chapter; no text says so for the Vela.',
  'The texts give no method and no worked example for placing a birth in a Vela, only "the Vela at the time of birth".',
] as const;

export interface VelaDay {
  /** The weekday of the Vedic day (0 Sunday … 6 Saturday). */
  weekday: number;
  /** Sunrise that opens the day, the sunset of its evening and the sunrise that closes it, in hours on one line (a day before is negative, a day after is past 24). */
  start: number;
  sunset: number;
  end: number;
}

export interface VelaPart {
  /** 1–16. */
  segment: number;
  guna: Guna;
  start: number;
  end: number;
  /** True for the half-yāmas after sunset (the 9th to 16th of the proportional count; those that begin after sunset in the fixed one). */
  night: boolean;
}

/** The sixteen half-yāmas of a day by a method. The last one is shortened or lengthened to end with the day. */
export function velaParts(day: VelaDay, method: VelaMethod): VelaPart[] {
  const parts: VelaPart[] = [];
  for (let k = 1; k <= VELA_PARTS; k++) {
    let start: number;
    let end: number;
    if (method === 'fixed') {
      start = day.start + (k - 1) * FIXED_VELA_HOURS;
      end = k === VELA_PARTS ? day.end : day.start + k * FIXED_VELA_HOURS;
    } else if (k <= 8) {
      const size = (day.sunset - day.start) / 8;
      start = day.start + (k - 1) * size;
      end = day.start + k * size;
    } else {
      const size = (day.end - day.sunset) / 8;
      start = day.sunset + (k - 9) * size;
      end = day.sunset + (k - 8) * size;
    }
    parts.push({ segment: k, guna: velaGuna(day.weekday, k), start, end, night: (start + end) / 2 >= day.sunset });
  }
  return parts;
}

export interface VelaResult {
  method: VelaMethod;
  day: VelaDay;
  part: VelaPart;
  parts: VelaPart[];
  /** Hours from the start of the part to the birth, and the share of the part that had passed (0 at the start, towards 1 at the end). */
  elapsed: number;
  fraction: number;
}

/** The half-yāma a moment is in: a part includes its start and not its end, which belongs to the next. Null when the moment is outside the day. */
export function velaAt(birth: number, day: VelaDay, method: VelaMethod): VelaResult | null {
  const parts = velaParts(day, method);
  const part = parts.find(item => birth >= item.start && birth < item.end);
  if (!part) return null;
  return { method, day, part, parts, elapsed: birth - part.start, fraction: (birth - part.start) / (part.end - part.start) };
}

export interface VelaSky {
  /** The weekday of the calendar date of the birth (0 Sunday … 6 Saturday). */
  weekday: number;
  /** The birth in local hours from midnight of that date. */
  birth: number;
  /** Sunrise and sunset of the date, the sunrise after it, and the sunrise and sunset before it, in local hours from midnight of the date (the ones before are negative). */
  sunrise: number;
  sunset: number;
  nextSunrise: number;
  previousSunrise: number;
  previousSunset: number;
}

/** The Vedic day of a birth: from sunrise to sunrise, so a birth before sunrise is in the weekday before. */
export function vedicDayOf(sky: VelaSky): VelaDay {
  if (sky.birth < sky.sunrise) return { weekday: (sky.weekday + 6) % 7, start: sky.previousSunrise, sunset: sky.previousSunset, end: sky.sunrise };
  return { weekday: sky.weekday, start: sky.sunrise, sunset: sky.sunset, end: sky.nextSunrise };
}

/** The Vela of a birth by both methods. */
export function velaOfBirth(sky: VelaSky): VelaResult[] {
  const day = vedicDayOf(sky);
  return (['fixed', 'proportional'] as const).flatMap(method => velaAt(sky.birth, day, method) ?? []);
}

/** What each Vela gives, from the verses 9.123 and 9.124 (the traditional astrological readings of the text, not an assessment of a person). */
export const VELA_RESULTS: Record<Guna, { verse: string; sanskrit: string; reading: string }> = {
  Sattva: {
    verse: '9.123',
    sanskrit: 'वाग्मी शिष्टाचारधर्मस्तपस्वी नित्योत्साही निर्मलो दानशीलः । तेजोविद्यारूपवान् सत्यवादी वीतारातिः सत्त्ववेलाप्रजातः ॥',
    reading: 'Eloquent, of the conduct and dharma of the good, ascetic, ever energetic, pure, generous, radiant, learned, handsome, truthful and free of enemies.',
  },
  Rajas: {
    verse: '9.124',
    sanskrit: 'रजोवेलाजातः सुखधनयशोरूपबलवान् जितारातिः कामातुरमतिरबन्धुप्रियमनाः ।',
    reading: 'Happiness, wealth, fame, beauty and strength; victory over enemies, but also passion, and an attachment to loved ones rather than to kin (abandhu-priya-manāḥ can also be read "not fond of kin").',
  },
  Tamas: {
    verse: '9.124',
    sanskrit: 'तमोवेलाजातः परधनवधूको गतसुखः शठस्वामी बन्धुद्विजगुरुविरोधी चपलधीः ॥',
    reading: 'A tendency to covet the wealth and the wives of others, a lack of happiness, quarrels with authorities, kin, brahmins and teachers, and a fickle mind.',
  },
};

export const VELA_SOURCE = 'Jātakapārijāta 9.123–125 (V. Subrahmanya Sastri\'s numbering; 124–126 in the Kāśī editions)';

/** The parts of a chart's debug record that the Vela needs (ChartData['debug']). */
export interface VelaDebug {
  inputDateTime?: string;
  sunriseLocalHours?: number;
  sunsetLocalHours?: number;
  nextSunriseLocalHours?: number;
  previousSunriseLocalHours?: number;
  previousSunsetLocalHours?: number;
}

/**
 * The sky of a chart's birth, from the birth moment the chart was cast for (YYYY-MM-DD HH:MM:SS, the clock of the place, in the zone chosen for the birth, so the zone and
 * the summer time of the day are already in it) and the sunrises and sunsets the chart carries for the same clock. Null when the chart has no birth moment; `sky` is null
 * when it has no sunrise and sunset (the Sun does not rise and set, or a chart saved before the times were kept).
 */
export function velaSkyOfChart(debug: VelaDebug | undefined): { date: string; sky: VelaSky | null } | null {
  const parsed = debug?.inputDateTime ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(debug.inputDateTime) : null;
  if (!debug || !parsed) return null;
  const { sunriseLocalHours: sunrise, sunsetLocalHours: sunset, nextSunriseLocalHours: nextSunrise, previousSunriseLocalHours: previousSunrise, previousSunsetLocalHours: previousSunset } = debug;
  if (sunrise === undefined || sunset === undefined || nextSunrise === undefined || previousSunrise === undefined || previousSunset === undefined) return { date: debug.inputDateTime!, sky: null };
  const weekday = new Date(Date.UTC(Number(parsed[1]), Number(parsed[2]) - 1, Number(parsed[3]))).getUTCDay();
  const birth = Number(parsed[4]) + Number(parsed[5]) / 60 + Number(parsed[6]) / 3600;
  return { date: debug.inputDateTime!, sky: { weekday, birth, sunrise, sunset, nextSunrise, previousSunrise, previousSunset } };
}
