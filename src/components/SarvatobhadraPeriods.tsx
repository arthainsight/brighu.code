'use client';

import { useMemo, useState } from 'react';
import type { CalculationSettings } from '@/types';
import { SBC_POINT_LABELS, type SbcPoint } from '@/lib/sarvatobhadra';
import { grahaStretches, impactWindows, type Quality, type Stretch } from '@/lib/sarvatobhadraPeriods';
import type { LongitudeSeries } from '@/lib/transitHits';
import { signChangesUrl } from '@/lib/apiParams';
import { pad2 } from '@/lib/dateFormat';
import { fill, useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';
import { useDebouncedJson } from '@/hooks/useDebouncedJson';

// Good and difficult periods of the Sarvatobhadra chakra (sarvatobhadraPeriods.ts): when a transiting graha's lines of vedha reach a point of the birth, and
// when its lattā falls on the birth nakṣatra, from the target date on. The weights and the windows are choices made here, named on the page.

const BODIES = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
const RANGES = [{ label: '3 mo', days: 92 }, { label: '12 mo', days: 366 }, { label: '3 yr', days: 3 * 366 }];
const FIRST_ROWS = 15;
type Loaded = { start: number; series: Record<string, { step: number; longitudes: number[] }> };
type Filter = 'all' | Quality;

const dateText = (time: number) => {
  const d = new Date(time);
  return `${pad2(d.getUTCDate())}.${pad2(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`;
};
const timeText = (time: number) => {
  const d = new Date(time);
  return `${dateText(time)} ${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
};
const qualityClass = (quality: Quality) => (quality === 'good' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400');

export default function SarvatobhadraPeriods({ points, janma, nakshatraAdjust, targetDate, calculationSettings }: {
  points: SbcPoint[];
  janma: number | null;
  nakshatraAdjust: number;
  targetDate: string;
  calculationSettings?: CalculationSettings;
}) {
  const t = useT();
  const { code } = useGrahaNames();
  const [days, setDays] = useState(366);
  const [withMoon, setWithMoon] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [showAll, setShowAll] = useState(false);
  const bodies = BODIES.filter(body => withMoon || body !== 'Moon');
  const { data, error, loading } = useDebouncedJson<Loaded>(signChangesUrl(targetDate, days, bodies, calculationSettings));

  const result = useMemo(() => {
    if (!data) return null;
    const stretches: Stretch[] = [];
    for (const body of bodies) {
      const s = data.series[body];
      if (!s) continue;
      const series: LongitudeSeries = { start: data.start, step: s.step, longitudes: s.longitudes };
      stretches.push(...grahaStretches(body, series, points, janma, nakshatraAdjust));
    }
    stretches.sort((a, b) => a.start - b.start);
    // The Moon crosses a square in a day or so: it stays in the list of stretches, but the windows of days are made without it.
    const windows = impactWindows(stretches.filter(item => item.body !== 'Moon'), data.start, days);
    return { stretches, windows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, points, janma, nakshatraAdjust, withMoon]);

  const windows = (result?.windows ?? []).filter(item => filter === 'all' || item.quality === filter);
  const stretches = (result?.stretches ?? []).filter(item => filter === 'all' || (item.score > 0 ? 'good' : 'difficult') === filter);
  const shownStretches = showAll ? stretches : stretches.slice(0, FIRST_ROWS);
  const chip = (on: boolean) =>
    `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on
      ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600'
      : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;

  const describe = (item: Stretch) => (
    <>
      <span className="font-bold">{code(item.body)}</span> <span className="text-zinc-400 dark:text-zinc-500">{item.nakshatra}</span>
      {item.hits.length > 0 && <> → {item.hits.map(hit => t(SBC_POINT_LABELS[hit.point.id])).filter((label, index, all) => all.indexOf(label) === index).join(', ')}</>}
      {item.latta?.onJanma && <span className="text-rose-600 dark:text-rose-400"> ↯ {t('lattā on the birth nakshatra')}</span>}
    </>
  );

  return (
    <div className="space-y-2" data-sbc="periods">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Good and difficult periods')}</div>
      <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
        {fill(t('From the target date on: while a transiting graha stands in a nakshatra, its vedha reaches the points of the birth that the chart marks (the Moon’s nakshatra, the Moon’s sign, the Lagna’s sign, the tithi, the weekday and the syllable of the name). A benefic (Moon, Mercury, Jupiter, Venus) reaching them is good, a malefic (Sun, Mars, Saturn, Rahu, Ketu) difficult, and the lattā of any graha on the birth nakshatra is difficult. The weights ({weights}) and the windows of whole days are choices made here, not a rule of a classic (docs/sarvatobhadra-periods.md).'), { weights: '3·2·2·1·1·1, 3' })}
      </p>
      <div className="flex flex-wrap gap-1">
        {RANGES.map(range => (
          <button key={range.days} type="button" aria-pressed={days === range.days} onClick={() => { setDays(range.days); setShowAll(false); }} className={chip(days === range.days)}>{t(range.label)}</button>
        ))}
        <span className="mx-1 self-stretch border-l border-zinc-200 dark:border-zinc-700" />
        {(['all', 'good', 'difficult'] as const).map(item => (
          <button key={item} type="button" aria-pressed={filter === item} onClick={() => { setFilter(item); setShowAll(false); }} className={chip(filter === item)} data-sbc-periods-filter={item}>
            {t(item === 'all' ? 'all' : item === 'good' ? 'good' : 'difficult')}
          </button>
        ))}
        <button type="button" aria-pressed={withMoon} onClick={() => setWithMoon(value => !value)} className={chip(withMoon)}>{t('with the Moon')}</button>
      </div>

      {loading && <p className="text-[10px] font-mono text-zinc-400">{t('Calculating…')}</p>}
      {error && <p className="text-[10px] font-mono text-rose-500">{error}</p>}
      {result && (
        <>
          <div data-sbc-periods="windows">
            <div className="mb-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{t('Windows of days')}</div>
            {windows.length === 0 ? (
              <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{t('No such period in this time.')}</p>
            ) : (
              <ul className="space-y-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
                {windows.map(window => (
                  <li key={`${window.from}-${window.quality}`} data-sbc-window={window.quality} data-sbc-window-from={window.from}>
                    <span className={`font-bold ${qualityClass(window.quality)}`}>{window.quality === 'good' ? '▲' : '▼'} {dateText(window.from)} – {dateText(window.to - 1)}</span>
                    <span className="text-zinc-400 dark:text-zinc-500"> · {Math.round((window.to - window.from) / 86_400_000)} {t('days')} · {window.peak > 0 ? '+' : ''}{window.peak}</span>
                    <div className="pl-3">{window.causes.slice(0, 4).map((item, index) => <span key={`${item.body}-${item.start}`}>{index > 0 && ' · '}{describe(item)}</span>)}{window.causes.length > 4 && ` +${window.causes.length - 4}`}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div data-sbc-periods="stretches">
            <div className="mb-1 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{t('By graha')}</div>
            <ul className="space-y-0.5 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
              {shownStretches.map(item => (
                <li key={`${item.body}-${item.start}`} data-sbc-stretch={item.score > 0 ? 'good' : 'difficult'}>
                  <span className={`font-bold ${qualityClass(item.score > 0 ? 'good' : 'difficult')}`}>{item.score > 0 ? '▲' : '▼'}</span> {item.body === 'Moon' ? timeText(item.start) : dateText(item.start)} – {item.body === 'Moon' ? timeText(item.end) : dateText(item.end)} · {describe(item)}
                </li>
              ))}
            </ul>
            {stretches.length > FIRST_ROWS && (
              <button type="button" onClick={() => setShowAll(value => !value)} className={`mt-1 ${chip(false)}`}>{showAll ? t('first rows only') : fill(t('all {count}'), { count: stretches.length })}</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
