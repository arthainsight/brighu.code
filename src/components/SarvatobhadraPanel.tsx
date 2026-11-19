'use client';

import { useMemo, useState } from 'react';
import type { CalculationSettings, ChartData, PlanetData } from '@/types';
import {
  SBC_GRID, SBC_KEY_SPECIALS, SBC_NAKSHATRA_CELLS, SBC_POINT_LABELS, SBC_SPECIAL_NAKSHATRAS, specialNakshatraIndex, specialOf, SBC_SIGN_CELLS, SBC_TITHI_CELLS,
  sbcCellOf, sbcLetterSquares, sbcMarkLayout, sbcNakshatra, sbcPierces, sbcVedha, tithiOf, vedicWeekday, weekdayGroup, type SbcCell, type SbcKind, type SbcPoint, type SbcPosition,
} from '@/lib/sarvatobhadra';
import { SIGN_ABBR } from '@/lib/signs';
import { NAKSHATRA_NAMES, NAKSHATRA_SIZE, padaOfLongitude } from '@/lib/nakshatras';
import { LATTA, lattaNakshatra, LATTA_RESULT, type TransitGraha } from '@/lib/phaladipikaGochara';
import { BENEFIC_GRAHAS, janmaNakshatra } from '@/lib/sarvatobhadraPeriods';
import { transitsOverNatal, type Verdict } from '@/lib/sarvatobhadraTransits';
import SarvatobhadraPeriods from './SarvatobhadraPeriods';
import { formatDms } from '@/lib/specialSphutas';
import { useGrahaNames } from '@/lib/grahaNames';
import { useLanguage, useT } from '@/lib/i18n';

type Props = {
  chart: ChartData;
  transitPlanets?: PlanetData[];
  nakshatraAdjust?: number;
  /** The start of the periods (YYYY-MM-DD): the target date. */
  targetDate?: string;
  calculationSettings?: CalculationSettings;
};

const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];

const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  fi: ['sunnuntai', 'maanantai', 'tiistai', 'keskiviikko', 'torstai', 'perjantai', 'lauantai'],
};
const WEEKDAYS_SHORT = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  fi: ['Su', 'Ma', 'Ti', 'Ke', 'To', 'Pe', 'La'],
};

/** What colours a square: the text of its kind, and the fill and the edge of a square that a role marks. */
const KIND_TEXT: Record<SbcKind, string> = {
  nakshatra: 'fill-emerald-700 dark:fill-green-400',
  vowel: 'fill-amber-700 dark:fill-amber-400',
  consonant: 'fill-pink-600 dark:fill-pink-400',
  sign: 'fill-blue-700 dark:fill-blue-400',
  tithi: 'fill-violet-600 dark:fill-violet-400',
};

type Role = 'janma' | 'moonSign' | 'lagnaSign' | 'tithi' | 'vara' | 'name';
const ROLE_FILL: Record<Role, string> = {
  janma: 'fill-amber-200 dark:fill-amber-900/60',
  moonSign: 'fill-sky-200 dark:fill-sky-900/60',
  lagnaSign: 'fill-emerald-200 dark:fill-emerald-900/60',
  tithi: 'fill-violet-200 dark:fill-violet-900/60',
  vara: 'fill-violet-200 dark:fill-violet-900/60',
  name: 'fill-teal-200 dark:fill-teal-900/60',
};
const ROLE_EDGE: Record<Role, string> = {
  janma: 'stroke-amber-500',
  moonSign: 'stroke-sky-500',
  lagnaSign: 'stroke-emerald-500',
  tithi: 'stroke-violet-500',
  vara: 'stroke-fuchsia-500',
  name: 'stroke-teal-500',
};


interface Mark { name: string; label: string; retrograde: boolean; transit: boolean }

/** A graha (or the Lagna) in its square, natal or transiting. */
interface Entry extends Mark { id: string; position: SbcPosition; longitude: number }

const VERDICT_CLASS: Record<Verdict, string> = {
  clear: 'text-zinc-400 dark:text-zinc-500',
  supported: 'text-emerald-600 dark:text-emerald-400',
  afflicted: 'text-rose-600 dark:text-rose-400',
  mixed: 'text-amber-600 dark:text-amber-400',
};

const keyOf = (position: SbcPosition) => `${position[0]}-${position[1]}`;
const centre = (position: SbcPosition) => ({ x: position[1] * 100 + 50, y: position[0] * 100 + 50 });

/**
 * The Sarvatobhadra chakra: the 28 nakṣatras round the edge, the vowels, consonants and signs inside and the
 * tithi groups with the weekdays in the middle, each graha in the square of its nakṣatra. The Moon's nakṣatra and
 * the squares of the Moon's sign, the Lagna's sign and the birth tithi and weekday are marked.
 */
export default function SarvatobhadraPanel({ chart, transitPlanets = [], nakshatraAdjust = 0, targetDate, calculationSettings }: Props) {
  const t = useT();
  const language = useLanguage();
  const { code, name: grahaFullName } = useGrahaNames();
  const [showTransit, setShowTransit] = useState(false);
  // The lattā, the kick of each graha, marked on the nakṣatra it falls on.
  const [showLatta, setShowLatta] = useState(false);
  // Ketu has no lattā in the verses; some read the Sarvatobhadra's as the 9th behind, like Rāhu.
  const [ketuLatta, setKetuLatta] = useState(false);
  // Whether a kick bites the whole nakṣatra or only the pada with the number of the kicker's pada (the Muhūrtacintāmaṇi 6.62).
  const [kickPart, setKickPart] = useState<'nakshatra' | 'pada'>('nakshatra');
  // The graha whose vedha is drawn: the id of an entry ('n:Sun' natal, 't:Sun' transiting).
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The first letter or syllable of the name, as the chart writes it ('ch', 'kh', 'a' …): its squares are marked.
  const [nameText, setNameText] = useState('');

  const moon = chart.planets.find(planet => planet.name === 'Moon');
  const sun = chart.planets.find(planet => planet.name === 'Sun');

  const model = useMemo(() => {
    // The grahas in their squares.
    const entries: Entry[] = [];
    const add = (name: string, longitude: number, retrograde: boolean, transit: boolean) => {
      entries.push({ id: `${transit ? 't' : 'n'}:${name}`, name, label: code(name), retrograde, transit, longitude, position: sbcCellOf(longitude, nakshatraAdjust) });
    };
    add('Asc', chart.ascendant.longitude, false, false);
    const isRetro = (planet: PlanetData) => Boolean(planet.isRetrograde) && planet.name !== 'Rahu' && planet.name !== 'Ketu';
    for (const planet of chart.planets.filter(item => GRAHAS.includes(item.name))) add(planet.name, planet.longitude, isRetro(planet), false);
    if (showTransit) for (const planet of transitPlanets.filter(item => GRAHAS.includes(item.name))) add(planet.name, planet.longitude, isRetro(planet), true);
    const marks = new Map<string, Mark[]>();
    for (const entry of entries) marks.set(keyOf(entry.position), [...(marks.get(keyOf(entry.position)) ?? []), entry]);

    // The vedha of every graha: the three nakṣatras it pierces, and who stands in them.
    const vedha = new Map<string, { lines: NonNullable<ReturnType<typeof sbcVedha>>; occupants: Map<string, Entry[]> }>();
    for (const entry of entries) {
      const lines = sbcVedha(entry.position);
      if (!lines) continue;
      vedha.set(entry.id, {
        lines,
        occupants: new Map(lines.map(line => [keyOf(line.target), entries.filter(other => other.id !== entry.id && keyOf(other.position) === keyOf(line.target))])),
      });
    }

    // The squares the birth marks.
    const roles = new Map<string, Role[]>();
    const mark = (position: SbcPosition | undefined, role: Role) => {
      if (!position) return;
      const key = `${position[0]}-${position[1]}`;
      roles.set(key, [...(roles.get(key) ?? []), role]);
    };
    const janma = moon ? sbcNakshatra(moon.longitude + nakshatraAdjust) : null;
    if (moon) mark(sbcCellOf(moon.longitude, nakshatraAdjust), 'janma');
    if (moon) mark(SBC_SIGN_CELLS[moon.sign], 'moonSign');
    mark(SBC_SIGN_CELLS[chart.ascendant.sign], 'lagnaSign');

    const tithi = moon && sun ? tithiOf(sun.longitude, moon.longitude) : null;
    if (tithi) mark(SBC_TITHI_CELLS[tithi.group], 'tithi');

    // The weekday of the birth as the Vedic day counts it (from sunrise).
    const debug = chart.debug;
    const parsed = debug?.inputDateTime ? /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(debug.inputDateTime) : null;
    const weekday = parsed
      ? vedicWeekday({ year: Number(parsed[1]), month: Number(parsed[2]), day: Number(parsed[3]) }, Number(parsed[4]) + Number(parsed[5]) / 60 + Number(parsed[6]) / 3600, debug?.sunriseLocalHours)
      : null;
    const vara = weekday === null ? null : weekdayGroup(weekday);
    if (vara) mark(SBC_TITHI_CELLS[vara], 'vara');

    // The letter of the name.
    const nameSquares = sbcLetterSquares(nameText);
    for (const square of nameSquares) mark(square, 'name');

    // The points of the birth the chakra is read for, and which of them each graha's lines reach.
    const points: SbcPoint[] = [];
    if (moon) points.push({ id: 'janma', position: sbcCellOf(moon.longitude, nakshatraAdjust) }, { id: 'moonSign', position: SBC_SIGN_CELLS[moon.sign] });
    if (moon) {
      const base = janmaNakshatra(moon.longitude, nakshatraAdjust);
      for (const item of SBC_SPECIAL_NAKSHATRAS) {
        if (item.count === 10 || item.count === 15) points.push({ id: item.count === 10 ? 'karma' : 'abhisheka', position: SBC_NAKSHATRA_CELLS[NAKSHATRA_NAMES[specialNakshatraIndex(base, item.count)]] });
      }
    }
    points.push({ id: 'lagnaSign', position: SBC_SIGN_CELLS[chart.ascendant.sign] });
    if (tithi) points.push({ id: 'tithi', position: SBC_TITHI_CELLS[tithi.group] });
    if (vara) points.push({ id: 'vara', position: SBC_TITHI_CELLS[vara] });
    for (const square of nameSquares) points.push({ id: 'name', position: square });
    const pierced = entries
      .map(entry => ({ entry, hits: sbcPierces(vedha.get(entry.id)?.lines ?? [], points) }))
      .filter(item => item.hits.length > 0);

    // The lattā: the nakṣatra each graha kicks (Phaladīpikā 26.42–47), and whether it is the birth nakṣatra or has a graha in it.
    const janmaIndex = moon ? janmaNakshatra(moon.longitude, nakshatraAdjust) : null;
    const star27 = (longitude: number) => Math.min(26, Math.floor((((longitude + nakshatraAdjust) % 360) + 360) % 360 / NAKSHATRA_SIZE));
    const latta = entries.flatMap(entry => {
      if (entry.name === 'Asc' || (entry.name === 'Ketu' && !ketuLatta)) return [];
      const rule = entry.name === 'Ketu' ? LATTA.Rahu : LATTA[entry.name as TransitGraha];
      const kicked = entry.name === 'Ketu' ? (star27(entry.longitude) - 8 + 27) % 27 : lattaNakshatra(entry.name as TransitGraha, entry.longitude + nakshatraAdjust);
      if (kicked === null || !rule) return [];
      const nakshatra = NAKSHATRA_NAMES[kicked];
      const position = SBC_NAKSHATRA_CELLS[nakshatra];
      const kickerPada = padaOfLongitude(entry.longitude + nakshatraAdjust);
      // With the pada chosen, the Janma is struck only when the birth Moon stands in the pada with the number of the kicker's pada.
      const moonPada = moon ? padaOfLongitude(moon.longitude + nakshatraAdjust) : null;
      let special = janmaIndex === null ? null : specialOf(janmaIndex, kicked);
      if (special === 'Janma' && kickPart === 'pada' && moonPada !== kickerPada) special = null;
      return [{
        entry, nakshatra, position, onJanma: special === 'Janma', special, kickerPada,
        star: NAKSHATRA_NAMES[star27(entry.longitude)], rule,
        occupants: entries.filter(other => other.id !== entry.id && keyOf(other.position) === keyOf(position)),
      }];
    });
    const kickedBy = new Map<string, typeof latta>();
    for (const item of latta) kickedBy.set(keyOf(item.position), [...(kickedBy.get(keyOf(item.position)) ?? []), item]);

    return { entries, marks, vedha, roles, janma, janmaIndex, tithi, weekday, vara, nameSquares, pierced, points, latta, kickedBy };
  }, [chart, transitPlanets, showTransit, nakshatraAdjust, moon, sun, code, nameText, ketuLatta, kickPart]);

  // The transits at the target moment over each natal graha, whether or not the transit overlay is on.
  const natalRows = useMemo(() => {
    const place = (planet: PlanetData) => ({ name: planet.name, longitude: planet.longitude });
    return transitsOverNatal(
      chart.planets.filter(item => GRAHAS.includes(item.name)).map(place),
      transitPlanets.filter(item => GRAHAS.includes(item.name)).map(place),
      nakshatraAdjust,
      ketuLatta,
      kickPart,
    );
  }, [chart, transitPlanets, nakshatraAdjust, ketuLatta, kickPart]);

  const selected = selectedId ? model.vedha.get(selectedId) ?? null : null;
  const selectedEntry = selectedId ? model.entries.find(entry => entry.id === selectedId) ?? null : null;
  const targetKeys = new Set((selected?.lines ?? []).map(line => keyOf(line.target)));
  // The squares the lines only cross, between the graha's square and the nakṣatras they end on.
  const crossedKeys = new Set((selected?.lines ?? []).flatMap(line => line.path.map(keyOf)).filter(key => !targetKeys.has(key)));

  const chip = (on: boolean) =>
    `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on
      ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600'
      : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;

  const renderCell = (cell: SbcCell, r: number, col: number) => {
    const key = `${r}-${col}`;
    const x = col * 100;
    const y = r * 100;
    const roles = model.roles.get(key) ?? [];
    const marks = model.marks.get(key) ?? [];
    const longest = Math.max(0, ...marks.map(item => item.label.length + (item.retrograde ? 1 : 0)));
    const layout = sbcMarkLayout(marks.length, longest);
    const lines: Mark[][] = [];
    for (let index = 0; index < marks.length; index += layout.perLine) lines.push(marks.slice(index, index + layout.perLine));
    const top = 40;

    return (
      <g key={key} data-sbc-cell={key} data-sbc-kind={cell.kind} data-sbc-label={cell.label}>
        <rect x={x} y={y} width={100} height={100} className={`${roles.length ? ROLE_FILL[roles[0]] : 'fill-white dark:fill-zinc-900'} stroke-zinc-400 dark:stroke-zinc-600`} strokeWidth={1.5} />
        {crossedKeys.has(key) && <rect data-sbc-vedha="crossed" x={x} y={y} width={100} height={100} className="fill-rose-400/20 dark:fill-rose-300/15" pointerEvents="none" />}
        {roles.length > 0 && <rect data-sbc-roles={roles.join(' ')} x={x + 4} y={y + 4} width={92} height={92} fill="none" className={ROLE_EDGE[roles[roles.length - 1]]} strokeWidth={4} />}
        {targetKeys.has(key) && <rect data-sbc-vedha="target" x={x + 9} y={y + 9} width={82} height={82} fill="none" className="stroke-rose-600 dark:stroke-rose-400" strokeWidth={5} />}
        {selectedEntry && keyOf(selectedEntry.position) === key && <rect data-sbc-vedha="source" x={x + 2} y={y + 2} width={96} height={96} fill="none" className="stroke-zinc-900 dark:stroke-zinc-100" strokeWidth={3} />}
        {showLatta && model.kickedBy.has(key) && <rect data-sbc-latta-square={key} x={x + 6} y={y + 6} width={88} height={88} fill="none" strokeDasharray="8 6" className="stroke-amber-600 dark:stroke-amber-400" strokeWidth={3} pointerEvents="none" />}
        {showLatta && model.kickedBy.has(key) && (
          <text x={x + 50} y={y + 93} textAnchor="middle" fontSize={15} fontWeight={700} className="fill-amber-700 dark:fill-amber-400" pointerEvents="none">
            ↯{model.kickedBy.get(key)!.map(item => `${item.entry.label}${item.entry.transit ? '↗' : ''}`).join(' ')}
          </text>
        )}
        {cell.kind === 'nakshatra' ? (
          <text x={x + 50} y={y + 26} textAnchor="middle" fontSize={20} fontWeight={600} className={KIND_TEXT.nakshatra}>{cell.label}</text>
        ) : cell.kind === 'tithi' ? (
          <>
            <text x={x + 50} y={y + 44} textAnchor="middle" fontSize={20} fontWeight={600} className={KIND_TEXT.tithi}>{cell.label}</text>
            <text x={x + 50} y={y + 68} textAnchor="middle" fontSize={15} className="fill-teal-700 dark:fill-teal-400">
              {(cell.weekdays ?? []).map(day => WEEKDAYS_SHORT[language][day]).join(' ')}
            </text>
          </>
        ) : (
          <text x={x + 50} y={y + 60} textAnchor="middle" fontSize={26} className={KIND_TEXT[cell.kind]}>{cell.label}</text>
        )}
        {lines.map((line, lineIndex) => line.map((item, index) => (
          <text
            key={`${item.transit ? 't' : 'n'}-${item.name}`}
            data-sbc-planet={item.name}
            data-sbc-transit={item.transit ? 'true' : undefined}
            x={x + (100 / (line.length + 1)) * (index + 1)}
            y={y + top + layout.lineHeight * (lineIndex + 0.85)}
            textAnchor="middle"
            fontSize={layout.size}
            fontWeight={700}
            fontStyle={item.retrograde ? 'italic' : 'normal'}
            className={item.transit ? 'fill-violet-600 dark:fill-violet-400' : item.name === 'Asc' ? 'fill-emerald-700 dark:fill-green-400' : 'fill-red-700 dark:fill-red-400'}
          >
            {item.label}{item.retrograde ? '℞' : ''}
          </text>
        )))}
      </g>
    );
  };

  const swatch = (role: Role) => <svg width="12" height="12" className="inline-block align-[-2px]" aria-hidden="true"><rect x="1" y="1" width="10" height="10" className={`${ROLE_FILL[role]} ${ROLE_EDGE[role]}`} strokeWidth={2} /></svg>;
  const paksha = model.tithi ? (model.tithi.tithi <= 15 ? 'Shukla' : 'Krishna') : '';
  const tithiNumber = model.tithi ? ((model.tithi.tithi - 1) % 15) + 1 : 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Sarvatobhadra chakra')}</div>
        <p className="mt-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('The 28 nakshatras (with Abhijit) round the edge, the vowels, consonants and signs inside and the tithi groups with the weekdays in the middle. Every graha stands in the square of its nakshatra.')}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <button type="button" aria-pressed={showTransit} disabled={transitPlanets.length === 0} onClick={() => setShowTransit(value => !value)} className={`${chip(showTransit)} disabled:opacity-40`}>
          {t('Transit')}
        </button>
        <button type="button" aria-pressed={showLatta} onClick={() => setShowLatta(value => !value)} className={chip(showLatta)} data-sbc="latta-toggle">
          {t('Latta')}
        </button>
      </div>

      <div className="space-y-1" data-sbc="vedha-choice">
        {[false, true].map(transit => {
          const row = model.entries.filter(entry => entry.transit === transit);
          if (row.length === 0) return null;
          return (
            <div key={String(transit)} className="flex flex-wrap items-center gap-1">
              <span className="mr-1 w-24 shrink-0 text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{t('Vedha')} · {t(transit ? 'transit' : 'natal')}</span>
              {row.map(entry => (
                <button key={entry.id} type="button" aria-pressed={selectedId === entry.id} data-sbc-choice={entry.id} onClick={() => setSelectedId(current => (current === entry.id ? null : entry.id))} className={chip(selectedId === entry.id)}>
                  {entry.label}
                </button>
              ))}
            </div>
          );
        })}
      </div>

      <label className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
        <span>{t('Name syllable (optional)')}</span>
        <input
          value={nameText}
          onChange={(event) => setNameText(event.target.value)}
          aria-label={t('name syllable')}
          placeholder="ch, kh, a …"
          autoCapitalize="none"
          className="w-24 rounded border border-zinc-300 bg-white px-1.5 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800"
        />
        {nameText.trim() !== '' && model.nameSquares.length === 0 && <span className="text-rose-500">{t('No square has that letter')}</span>}
      </label>

      <div className="mx-auto w-full max-w-[640px]">
        <svg viewBox="-2 -2 904 904" role="img" aria-label={t('Sarvatobhadra chakra')} data-sbc="chart" className="h-auto w-full font-mono">
          {SBC_GRID.map((row, r) => row.map((cell, col) => renderCell(cell, r, col)))}
          {selected && selectedEntry && selected.lines.map((line) => (
            <line
              key={keyOf(line.target)}
              data-sbc-vedha-line={line.direction}
              x1={centre(selectedEntry.position).x} y1={centre(selectedEntry.position).y}
              x2={centre(line.target).x} y2={centre(line.target).y}
              strokeWidth={4} strokeDasharray="10 8" strokeLinecap="round" pointerEvents="none"
              className="stroke-rose-500/70 dark:stroke-rose-400/70"
            />
          ))}
        </svg>
      </div>

      <ul className="space-y-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300" data-sbc="legend">
        {model.janma && <li>{swatch('janma')} {t('Janma nakshatra')}: <span className="font-bold">{model.janma}</span> <span className="text-zinc-400 dark:text-zinc-500">({grahaFullName('Moon')})</span></li>}
        {moon && <li>{swatch('moonSign')} {t('Moon sign')}: <span className="font-bold">{SIGN_ABBR[moon.sign - 1]}</span></li>}
        <li>{swatch('lagnaSign')} {t('Lagna sign')}: <span className="font-bold">{SIGN_ABBR[chart.ascendant.sign - 1]}</span> <span className="text-zinc-400 dark:text-zinc-500">({formatDms(chart.ascendant.degree)})</span></li>
        {model.tithi && <li>{swatch('tithi')} {t('Birth tithi')}: <span className="font-bold">{paksha} {tithiNumber}</span> · {model.tithi.group}</li>}
        {model.nameSquares.length > 0 && <li>{swatch('name')} {t('Name syllable')}: <span className="font-bold">{nameText.trim().toLowerCase()}</span></li>}
        {model.vara && model.weekday !== null && <li>{swatch('vara')} {t('Birth day')}: <span className="font-bold">{WEEKDAYS[language][model.weekday]}</span> · {model.vara}</li>}
      </ul>

      <div data-sbc="vedha">
        <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Vedha')}</div>
        <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('A graha has vedha on the nakshatra straight across the chart from its own and on the two nakshatras on the diagonals from it. Choose a graha above to draw its lines; a nakshatra with grahas in it is pierced.')}
        </p>
        <ul className="space-y-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
          {model.entries.filter(entry => model.vedha.has(entry.id)).map(entry => {
            const info = model.vedha.get(entry.id)!;
            const here = SBC_GRID[entry.position[0]][entry.position[1]];
            return (
              <li key={entry.id} data-sbc-vedha-from={entry.id} className={entry.transit ? 'text-violet-700 dark:text-violet-300' : ''}>
                <span className="font-bold">{entry.label}{entry.transit ? ` (${t('transit')})` : ''}</span>
                <span className="text-zinc-400 dark:text-zinc-500"> {here.label}</span> →{' '}
                {info.lines.map((line, index) => {
                  const target = SBC_GRID[line.target[0]][line.target[1]];
                  const occupants = info.occupants.get(keyOf(line.target)) ?? [];
                  return (
                    <span key={keyOf(line.target)} data-sbc-vedha-target={target.label} title={t(line.direction === 'across' ? 'across' : 'diagonal')}>
                      {index > 0 && ' · '}
                      <span className={occupants.length ? 'font-bold' : ''}>{target.label}</span>
                      {occupants.length > 0 && <span className="text-red-700 dark:text-red-400"> [{occupants.map(other => `${other.label}${other.transit ? '↗' : ''}`).join(' ')}]</span>}
                    </span>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </div>

      <div data-sbc="pierced">
        <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Birth points pierced')}</div>
        <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('The Moon’s nakshatra, the Moon’s sign, the Lagna’s sign, the birth tithi and weekday and the syllable of the name that a graha has vedha on: at the end of a line, or crossed by it. A transiting graha is marked ↗.')}
        </p>
        {model.pierced.length === 0 ? (
          <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{t('No graha pierces any of them.')}</p>
        ) : (
          <ul className="space-y-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
            {model.pierced.map(({ entry, hits }) => (
              <li key={entry.id} data-sbc-pierced-from={entry.id} className={entry.transit ? 'text-violet-700 dark:text-violet-300' : ''}>
                <span className="font-bold">{entry.label}{entry.transit ? '↗' : ''}</span>
                <span className="text-zinc-400 dark:text-zinc-500"> {SBC_GRID[entry.position[0]][entry.position[1]].label}</span> →{' '}
                {hits.map((hit, index) => (
                  <span key={`${hit.point.id}-${hit.point.position.join('-')}`} data-sbc-pierced-point={hit.point.id} data-sbc-pierced-at={hit.at}>
                    {index > 0 && ' · '}
                    {t(SBC_POINT_LABELS[hit.point.id])} <span className="text-zinc-400 dark:text-zinc-500">({t(hit.at === 'end' ? 'line end' : 'crossed')})</span>
                  </span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {model.janmaIndex !== null && (
        <div data-sbc="specials">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Special nakshatras (from Janma)')}</div>
          <table className="w-full max-w-md border-collapse text-left font-mono text-[10px] text-zinc-600 dark:text-zinc-300">
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Special nakshatra')}</th>
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Star')}</th>
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Count from Janma')}</th>
              </tr>
            </thead>
            <tbody>
              {SBC_SPECIAL_NAKSHATRAS.map(item => (
                <tr key={item.name} data-sbc-special={item.name} className={(SBC_KEY_SPECIALS as readonly string[]).includes(item.name) ? 'bg-amber-50 dark:bg-amber-950/30' : ''}>
                  <th scope="row" className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{item.name}</th>
                  <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{NAKSHATRA_NAMES[specialNakshatraIndex(model.janmaIndex!, item.count)]}</td>
                  <td className="border-b border-zinc-100 p-1.5 tabular-nums dark:border-zinc-800">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div data-sbc="latta">
        <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Latta')}</div>
        <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('The lattā is the kick of a graha: it falls on the nakshatra 12 on from the Sun, 3 from Mars, 6 from Jupiter and 8 from Saturn, and 5 before Venus, 7 before Mercury, 9 before Rahu and 22 before the Moon, counting its own as 1 (Phaladipika 26.42–47). Ketu has none. Press Latta above to mark the squares; ↯ is the kicker, ↗ a transiting graha. A kick on the birth nakshatra is the one the text warns of; a graha standing in the square kicked is struck with it.')}
        </p>
        <div className="mb-1 flex flex-wrap gap-1">
          <button type="button" aria-pressed={kickPart === 'nakshatra'} onClick={() => setKickPart('nakshatra')} className={chip(kickPart === 'nakshatra')} data-sbc="kick-nakshatra">{t('the whole nakshatra')}</button>
          <button type="button" aria-pressed={kickPart === 'pada'} onClick={() => setKickPart('pada')} className={chip(kickPart === 'pada')} data-sbc="kick-pada">{t('only the pada of the kicker')}</button>
          <button type="button" aria-pressed={ketuLatta} onClick={() => setKetuLatta(value => !value)} className={chip(ketuLatta)} data-sbc="latta-ketu">{t('Ketu 9 behind (Sarvatobhadra variant)')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-left font-mono text-[10px] text-zinc-600 dark:text-zinc-300" data-sbc-latta-table>
            <thead>
              <tr className="text-zinc-500 dark:text-zinc-400">
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Graha')}</th>
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Kick')}</th>
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Transit star')}</th>
                <th scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t('Latta falls on')}</th>
              </tr>
            </thead>
            <tbody>
              {model.latta.map(({ entry, nakshatra, onJanma, special, star, rule, occupants, kickerPada }) => {
                const red = onJanma || (special !== null && SBC_KEY_SPECIALS.includes(special));
                return (
                  <tr key={entry.id} data-sbc-latta-from={entry.id} data-sbc-latta-on={nakshatra} data-sbc-latta-special={special ?? undefined} data-sbc-latta-janma={onJanma ? 'true' : undefined} className={entry.transit ? 'text-violet-700 dark:text-violet-300' : ''}>
                    <th scope="row" className="border-b border-zinc-100 p-1.5 font-bold dark:border-zinc-800">{entry.label}{entry.transit ? '↗' : ''}</th>
                    <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{rule.count} {t(rule.direction === 1 ? 'ahead' : 'behind')}{entry.name === 'Ketu' ? '*' : ''}</td>
                    <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{star}</td>
                    <td className={`border-b border-zinc-100 p-1.5 dark:border-zinc-800 ${red ? 'text-rose-600 dark:text-rose-400' : ''}`}>
                      <span className="font-bold">{nakshatra}</span>{kickPart === 'pada' && <span> {t('pada')} {kickerPada}</span>}
                      {special && <span> ← {special}</span>}
                      {onJanma && LATTA_RESULT[entry.name as TransitGraha] ? <span> ✗ {t(LATTA_RESULT[entry.name as TransitGraha]!)}</span> : null}
                      {occupants.length > 0 && <span className="text-red-700 dark:text-red-400"> [{occupants.map(other => `${other.label}${other.transit ? '↗' : ''}`).join(' ')}]</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">{t('The name after ← is the nakshatra of the birth chart the kick lands on, counted from the Moon’s (Janma, Jāti, Karma, Abhiṣeka, Saṅghātika, Sāmudāyika, Naidhana); red when it is the Janma, the Karma or the Abhiṣeka. *Ketu has no lattā in the verses; 9 behind is the Sarvatobhadra variant.')}</p>
      </div>

      {transitPlanets.length > 0 && (
        <div data-sbc="natal-transits">
          <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Transits over natal planets')}</div>
          <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
            {t('For each natal graha: the transiting grahas in its nakshatra (conjunction), with vedha on it (a line of the chakra ends on its nakshatra), aspecting its sign (their own aspects), and the ones whose lattā falls on it. Benefics are green and malefics red, the lattā by the nature of the kicker. The verdict is supported when only benefics reach it, afflicted when only malefics, mixed when both and clear when none; it is read from the examples of another program, not from a classic (docs/sarvatobhadra-periods.md). Set the transit date above.')}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left font-mono text-[10px] text-zinc-600 dark:text-zinc-300" data-sbc-natal-table>
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400">
                  {['Natal graha', 'Nakshatra', 'Transit on it', 'Vedha', 'Other aspects', 'Latta', 'Verdict'].map(label => (
                    <th key={label} scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{t(label)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {natalRows.map(row => {
                  const hits = (names: string[]) => names.length === 0
                    ? '—'
                    : names.map((name, index) => <span key={name} className={BENEFIC_GRAHAS.includes(name) ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{index > 0 && ' '}{code(name)}</span>);
                  return (
                    <tr key={row.natal} data-sbc-natal={row.natal} data-sbc-natal-verdict={row.verdict}>
                      <th scope="row" className="border-b border-zinc-100 p-1.5 font-bold dark:border-zinc-800">{code(row.natal)}</th>
                      <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{NAKSHATRA_NAMES[row.star]}</td>
                      <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{hits(row.conjunction)}</td>
                      <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{hits(row.vedha)}</td>
                      <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{hits(row.aspects)}</td>
                      <td className="border-b border-zinc-100 p-1.5 dark:border-zinc-800">{hits(row.latta)}</td>
                      <td className={`border-b border-zinc-100 p-1.5 font-bold dark:border-zinc-800 ${VERDICT_CLASS[row.verdict]}`}>{t(row.verdict)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {targetDate && (
        <SarvatobhadraPeriods points={model.points} janma={model.janmaIndex} janmaPada={moon ? padaOfLongitude(moon.longitude + nakshatraAdjust) : null} kickPart={kickPart} nakshatraAdjust={nakshatraAdjust} targetDate={targetDate} calculationSettings={calculationSettings} />
      )}

      <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
        {t('Abhijit is the stretch from 6°40′ to 10°53′20″ of Capricorn; the nakshatras follow the nakshatra zodiac of Settings. The weekday counts from sunrise.')}
      </p>
    </div>
  );
}
