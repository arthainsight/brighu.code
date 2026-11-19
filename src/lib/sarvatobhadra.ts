import { normalizeDegrees } from './angles';
import { NAKSHATRA_NAMES, NAKSHATRA_SIZE, padaOfLongitude } from './nakshatras';

// The Sarvatobhadra Chakra: nine rows of nine squares. The nakṣatras (28, with Abhijit) go round the edge, the
// vowels, the consonants and the twelve rāśis inside it, and the five groups of tithis with the days of the week
// in the middle. The grahas are placed in the square of the nakṣatra they are in. The squares are the ones of the
// JHora chart this was made from; two squares hold the same vowel (a), as they do there.

export type SbcKind = 'nakshatra' | 'vowel' | 'consonant' | 'sign' | 'tithi';

export interface SbcCell {
  kind: SbcKind;
  /** What the square shows. */
  label: string;
  /** Nakṣatra: its name, one of NAKSHATRA_NAMES or 'Abhijit'. */
  nakshatra?: string;
  /** Rāśi: 1 (Aries) to 12 (Pisces). */
  sign?: number;
  /** Tithi group: its name, and the days of the week it goes with (0 is Sunday). */
  group?: TithiGroup;
  weekdays?: number[];
}

export type TithiGroup = 'Nanda' | 'Bhadra' | 'Jaya' | 'Rikta' | 'Poorna';

const n = (label: string, nakshatra: string): SbcCell => ({ kind: 'nakshatra', label, nakshatra });
const v = (label: string): SbcCell => ({ kind: 'vowel', label });
const c = (label: string): SbcCell => ({ kind: 'consonant', label });
const s = (label: string, sign: number): SbcCell => ({ kind: 'sign', label, sign });
const t = (group: TithiGroup, weekdays: number[]): SbcCell => ({ kind: 'tithi', label: group, group, weekdays });

/** The 9 × 9 squares, the top row first, the left square first. */
export const SBC_GRID: readonly (readonly SbcCell[])[] = [
  [v('ii'), n('Dhan', 'Dhanishtha'), n('Sata', 'Shatabhisha'), n('PBha', 'Purva Bhadrapada'), n('UBha', 'Uttara Bhadrapada'), n('Reva', 'Revati'), n('Aswi', 'Ashwini'), n('Bhar', 'Bharani'), v('a')],
  [n('Srav', 'Shravana'), v('rii'), c('g'), c('s'), c('d'), c('ch'), c('l'), v('u'), n('Krit', 'Krittika')],
  [n('Abhi', 'Abhijit'), c('kh'), v('ai'), s('Aq', 11), s('Pi', 12), s('Ar', 1), v('lu'), v('a'), n('Rohi', 'Rohini')],
  [n('USha', 'Uttara Ashadha'), c('j'), s('Cp', 10), v('ah'), t('Rikta', [5]), v('o'), s('Ta', 2), c('v'), n('Mrig', 'Mrigashira')],
  [n('PSha', 'Purva Ashadha'), c('bh'), s('Sg', 9), t('Jaya', [4]), t('Poorna', [6]), t('Nanda', [0, 2]), s('Ge', 3), c('k'), n('Ardr', 'Ardra')],
  [n('Mool', 'Mula'), c('y'), s('Sc', 8), v('am'), t('Bhadra', [1, 3]), v('au'), s('Cn', 4), c('h'), n('Puna', 'Punarvasu')],
  [n('Jye', 'Jyeshtha'), c('n'), v('e'), s('Li', 7), s('Vi', 6), s('Le', 5), v('luu'), c('d'), n('Push', 'Pushya')],
  [n('Anu', 'Anuradha'), v('ri'), c('t'), c('r'), c('p'), c('t~'), c('m'), v('uu'), n('Asre', 'Ashlesha')],
  [v('i'), n('Visa', 'Vishakha'), n('Swat', 'Swati'), n('Chit', 'Chitra'), n('Hast', 'Hasta'), n('UPha', 'Uttara Phalguni'), n('PPha', 'Purva Phalguni'), n('Magh', 'Magha'), v('aa')],
];

export type SbcPosition = readonly [row: number, column: number];

/** The square (row, column, from 0) of every nakṣatra. */
export const SBC_NAKSHATRA_CELLS: Readonly<Record<string, SbcPosition>> = Object.fromEntries(
  SBC_GRID.flatMap((row, r) => row.flatMap((cell, col) => (cell.nakshatra ? [[cell.nakshatra, [r, col] as SbcPosition]] : []))),
);

/** The square of each rāśi (1 to 12). */
export const SBC_SIGN_CELLS: Readonly<Record<number, SbcPosition>> = Object.fromEntries(
  SBC_GRID.flatMap((row, r) => row.flatMap((cell, col) => (cell.sign ? [[cell.sign, [r, col] as SbcPosition]] : []))),
);

/** The square of each group of tithis. */
export const SBC_TITHI_CELLS: Readonly<Record<TithiGroup, SbcPosition>> = Object.fromEntries(
  SBC_GRID.flatMap((row, r) => row.flatMap((cell, col) => (cell.group ? [[cell.group, [r, col] as SbcPosition]] : []))),
) as Record<TithiGroup, SbcPosition>;

// --- Abhijit -----------------------------------------------------------------------------------------------------
// Abhijit is the stretch from 6°40' to 10°53'20" of Capricorn (276°40' to 280°53'20"): the last part of
// Uttara Ashadha and the first part of Shravana, which are shortened by it.

export const ABHIJIT_START = 276 + 40 / 60;
export const ABHIJIT_END = 280 + 53 / 60 + 20 / 3600;

/** The nakṣatra of a longitude among the 28: one of NAKSHATRA_NAMES, or 'Abhijit'. */
export function sbcNakshatra(longitude: number): string {
  const lon = normalizeDegrees(longitude);
  if (lon >= ABHIJIT_START && lon < ABHIJIT_END) return 'Abhijit';
  return NAKSHATRA_NAMES[Math.min(Math.floor(lon / NAKSHATRA_SIZE), 26)];
}

/** The square a longitude is in, by its nakṣatra; `adjust` is the nakṣatra zodiac's offset from the grahas' own. */
export function sbcCellOf(longitude: number, adjust = 0): SbcPosition {
  return SBC_NAKSHATRA_CELLS[sbcNakshatra(longitude + adjust)];
}

// --- Tithi and weekday -----------------------------------------------------------------------------------------

export const TITHI_GROUPS: readonly TithiGroup[] = ['Nanda', 'Bhadra', 'Jaya', 'Rikta', 'Poorna'];

/** The tithi (1 to 30) of the Moon and the Sun's longitudes, and the group it belongs to: 1, 6, 11 … are Nanda, 2, 7, 12 … Bhadra, and so on. */
export function tithiOf(sunLongitude: number, moonLongitude: number): { tithi: number; group: TithiGroup } {
  const tithi = Math.min(30, Math.floor(normalizeDegrees(moonLongitude - sunLongitude) / 12) + 1);
  return { tithi, group: TITHI_GROUPS[(tithi - 1) % 5] };
}

/** The group of a day of the week (0 is Sunday): Sunday and Tuesday Nanda, Monday and Wednesday Bhadra, Thursday Jaya, Friday Rikta, Saturday Poorna. */
export function weekdayGroup(weekday: number): TithiGroup {
  const day = ((weekday % 7) + 7) % 7;
  return (Object.entries(SBC_TITHI_CELLS) as [TithiGroup, SbcPosition][])
    .map(([group]) => group)
    .find(group => SBC_GRID[SBC_TITHI_CELLS[group][0]][SBC_TITHI_CELLS[group][1]].weekdays?.includes(day))!;
}

/**
 * The weekday (0 is Sunday) of a birth as the Vedic day counts it: the day begins at sunrise, so a birth before
 * sunrise belongs to the day before. `date` is the local date and `localHours` and `sunriseHours` are local decimal hours.
 */
export function vedicWeekday(date: { year: number; month: number; day: number }, localHours: number, sunriseHours: number | undefined): number {
  const weekday = new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
  return sunriseHours !== undefined && localHours < sunriseHours ? (weekday + 6) % 7 : weekday;
}

// --- The grahas inside a square ---------------------------------------------------------------------------------

/** The room a square leaves for its grahas below the name, in the 100 × 100 of a square. */
const MARKS_WIDTH = 92;
const MARKS_HEIGHT = 56;
/** A letter of the chart's font is about this wide as a fraction of its size. */
const LETTER_WIDTH = 0.62;

/**
 * How the grahas of one square are laid out inside it: how many to a line, the size of the letters and the
 * height of a line. The letters shrink and the rows wrap as more grahas stand together, so that they stay in the
 * square. `longest` is the number of characters of the longest one.
 */
export function sbcMarkLayout(count: number, longest: number): { perLine: number; size: number; lineHeight: number } {
  const perLine = count <= 1 ? 1 : count <= 4 ? 2 : count <= 9 ? 3 : 4;
  const lines = Math.max(1, Math.ceil(count / perLine));
  const byCount = count <= 1 ? 26 : count <= 4 ? 21 : count <= 6 ? 18 : count <= 9 ? 15 : 13;
  const byWidth = Math.floor(MARKS_WIDTH / (perLine * Math.max(2, longest) * LETTER_WIDTH));
  const byHeight = Math.floor(MARKS_HEIGHT / (lines * 1.15));
  const size = Math.max(6, Math.min(byCount, byWidth, byHeight));
  return { perLine, size, lineHeight: size * 1.15 };
}

// --- Vedha ---------------------------------------------------------------------------------------------------------
// A graha has vedha on the nakṣatra directly across the chart from the one it stands in, and on the two nakṣatras
// on the diagonals from it: three lines run from its square into the chart, one straight and two at 45°, and each
// ends on the nakṣatra at the edge where it leaves the chart.

export type VedhaDirection = 'across' | 'diagonal';

export interface VedhaLine {
  direction: VedhaDirection;
  /** The squares the line crosses, from the one next to the graha's to the nakṣatra at its end. */
  path: SbcPosition[];
  /** The nakṣatra at the end of the line, which has the vedha. */
  target: SbcPosition;
}

/** The three lines of vedha from a nakṣatra square on the edge of the chart; null for a square that is not a nakṣatra's. */
export function sbcVedha(from: SbcPosition): VedhaLine[] | null {
  const [row, column] = from;
  if (!SBC_GRID[row]?.[column]?.nakshatra) return null;
  // Into the chart from the edge the square is on.
  const inward: readonly [number, number] = row === 0 ? [1, 0] : row === 8 ? [-1, 0] : column === 0 ? [0, 1] : [0, -1];
  const side: readonly [number, number] = [inward[1], inward[0]];
  const directions: [VedhaDirection, number, number][] = [
    ['across', inward[0], inward[1]],
    ['diagonal', inward[0] + side[0], inward[1] + side[1]],
    ['diagonal', inward[0] - side[0], inward[1] - side[1]],
  ];
  return directions.map(([direction, stepRow, stepColumn]) => {
    const path: SbcPosition[] = [];
    let r = row + stepRow;
    let c = column + stepColumn;
    while (r >= 0 && r < 9 && c >= 0 && c < 9) {
      path.push([r, c]);
      r += stepRow;
      c += stepColumn;
    }
    return { direction, path, target: path[path.length - 1] };
  });
}

// --- The name, and what a graha pierces ---------------------------------------------------------------------------

/** The squares of the chart that a letter or syllable of a name stands for (vowels and consonants), ignoring case: 'ch' is one square, 'd' two. */
export function sbcLetterSquares(text: string): SbcPosition[] {
  const wanted = text.trim().toLowerCase();
  if (!wanted) return [];
  return SBC_GRID.flatMap((row, r) => row.flatMap((cell, column) => ((cell.kind === 'vowel' || cell.kind === 'consonant') && cell.label.toLowerCase() === wanted ? [[r, column] as SbcPosition] : [])));
}

/** The points of a birth that the chakra is read for. */
export type SbcPointId = 'janma' | 'karma' | 'abhisheka' | 'moonSign' | 'lagnaSign' | 'tithi' | 'vara' | 'name';

/**
 * The special nakṣatras (the tārās of the Narapatijayacaryā, Vyāsa's Trailokyadīpaka, Nārada and the Phaladīpikā) counted from the Moon's nakṣatra, the list a user
 * found: Janma 1, Naidhana 7, Karma 10, Saṅghātika 16, Sāmudāyika 18, Ādhāna 19, Vaināśika 23, Mānasa 25 and the king's three, Jāti 26, Deśa 27 and Abhiṣeka 28, which
 * only come out in a count of the 28 nakṣatras with Abhijit (the Svaracintāmaṇi's 26, 27 and 28 of the Phaladīpikā editor's note). The others the user's list gives as
 * alternatives (Jāti 4, Deśa 12, Mānasa 11) and the 25, 26, 27 of Vyāsa v. 282 are not used (docs/sarvatobhadra-periods.md). Mānasa 25 and Jāti 26 are the same nakṣatra
 * (three before the Janma). The Janma, the Karma and the Abhiṣeka are the three another program marks red; no text does (the texts give Janma death, Karma distress,
 * Abhiṣeka bonds).
 */
export const SBC_SPECIAL_NAKSHATRAS = [
  { name: 'Janma', count: 1, cycle: 27 }, { name: 'Naidhana', count: 7, cycle: 27 }, { name: 'Karma', count: 10, cycle: 27 },
  { name: 'Saṅghātika', count: 16, cycle: 27 }, { name: 'Sāmudāyika', count: 18, cycle: 27 }, { name: 'Ādhāna', count: 19, cycle: 27 },
  { name: 'Vaināśika', count: 23, cycle: 27 }, { name: 'Mānasa', count: 25, cycle: 27 },
  { name: 'Jāti', count: 26, cycle: 28 }, { name: 'Deśa', count: 27, cycle: 28 }, { name: 'Abhiṣeka', count: 28, cycle: 28 },
] as const;
export type SbcSpecialName = (typeof SBC_SPECIAL_NAKSHATRAS)[number]['name'];
/** The three marked red. */
export const SBC_KEY_SPECIALS: readonly SbcSpecialName[] = ['Janma', 'Karma', 'Abhiṣeka'];

/** The 28 nakṣatras in order, Abhijit between Uttara Āṣāḍhā (the 21st) and Śravaṇa. */
const NAKSHATRAS_28: readonly string[] = [...NAKSHATRA_NAMES.slice(0, 21), 'Abhijit', ...NAKSHATRA_NAMES.slice(21)];

/** The nakṣatra of a special nakṣatra (its name: one of the 27 or Abhijit), from the Moon's nakṣatra (0–26). */
export function specialNakshatraName(janma: number, item: (typeof SBC_SPECIAL_NAKSHATRAS)[number]): string {
  if (item.cycle === 27) return NAKSHATRA_NAMES[(janma + item.count - 1) % 27];
  const start = janma < 21 ? janma : janma + 1;
  return NAKSHATRAS_28[(start + item.count - 1) % 28];
}
/** The special nakṣatras a nakṣatra (0–26) is, counted from the Moon's: none, one or two (Mānasa and Jāti are the same). */
export const specialsOf = (janma: number, nakshatra: number): SbcSpecialName[] =>
  SBC_SPECIAL_NAKSHATRAS.filter(item => specialNakshatraName(janma, item) === NAKSHATRA_NAMES[nakshatra]).map(item => item.name);

/** The names of the points of a birth, as the page writes them. */
export const SBC_POINT_LABELS: Record<SbcPointId, string> = {
  janma: 'Janma nakshatra', karma: 'Karma nakshatra', abhisheka: 'Abhisheka nakshatra', moonSign: 'Moon sign', lagnaSign: 'Lagna sign', tithi: 'Birth tithi', vara: 'Birth day', name: 'Name syllable',
};

export interface SbcPoint {
  id: SbcPointId;
  position: SbcPosition;
}

export interface SbcPierce {
  point: SbcPoint;
  direction: VedhaDirection;
  /** 'end' when the point is the nakṣatra a line ends on, 'line' when the line only crosses its square. */
  at: 'end' | 'line';
}

/** Which of the points a graha's lines reach: the points whose square lies on one of its three lines, in the order of `points`. */
export function sbcPierces(lines: readonly VedhaLine[], points: readonly SbcPoint[]): SbcPierce[] {
  const hits: SbcPierce[] = [];
  for (const point of points) {
    for (const line of lines) {
      if (line.path.some(([r, column]) => r === point.position[0] && column === point.position[1])) {
        hits.push({ point, direction: line.direction, at: line.target[0] === point.position[0] && line.target[1] === point.position[1] ? 'end' : 'line' });
        break;
      }
    }
  }
  return hits;
}

// --- The pada a vedha reaches --------------------------------------------------------------------------------------------------------------------------

export interface VedhaPada {
  /** The pada (1–4) of the target nakṣatra that is pierced; null for Abhijit, which has no pada of its own in the texts. */
  pada: number | null;
  /** The rāśi (1–12) the pierced pada lies in, and the navāṁśa sign of that pada (the sign the pada is). */
  sign: number;
  navamsaSign: number | null;
}

/**
 * The part of a nakṣatra a graha's vedha reaches: the pada with the number of the pada the graha stands in ("the part pierced is of the same number as the part the
 * graha is in", the Muhūrtadīpikā quoted in the Muhūrtacintāmaṇi commentary on 6.62, for the vedhas of the Upagraha, the Lattā and the Caṇḍāyudha). It is the reading
 * used here for the lines of the chakra: the texts of the chakra give the nakṣatra at the end of a line and only a corner rule for padas (docs/sarvatobhadra-periods.md).
 * `longitude` is the graha's, `adjust` the nakṣatra zodiac's offset from the chart's, and `target` one of the 28 names (Abhijit included).
 */
export function vedhaPadaOf(longitude: number, target: string, adjust = 0): VedhaPada {
  if (target === 'Abhijit') return { pada: null, sign: 10, navamsaSign: null };
  const pada = padaOfLongitude(longitude + adjust);
  const index = (NAKSHATRA_NAMES as readonly string[]).indexOf(target);
  const middle = index * NAKSHATRA_SIZE + (pada - 0.5) * (NAKSHATRA_SIZE / 4);
  return { pada, sign: Math.floor(normalizeDegrees(middle - adjust) / 30) + 1, navamsaSign: ((index * 4 + pada - 1) % 12) + 1 };
}
