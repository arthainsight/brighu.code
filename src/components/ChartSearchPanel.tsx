'use client';

import { useState } from 'react';
import type { CalculationSettings, ChartData } from '@/types';
import { chartRequestUrl, type ResearchSource } from '@/lib/research/studyData';
import { SEARCH_POINTS, searchCharts, type Criterion, type SearchHit, type SearchMode, type SearchPoint } from '@/lib/research/chartSearch';
import { NAKSHATRA_NAMES } from '@/lib/nakshatras';
import { SIGN_NAMES } from '@/lib/signs';
import { useT } from '@/lib/i18n';

type Props = { sources: readonly ResearchSource[]; initialSelected: ReadonlySet<string>; calculationSettings?: CalculationSettings };
type Kind = Criterion['kind'];

const KINDS: { kind: Kind; label: string }[] = [
  { kind: 'sign', label: 'is in the sign' },
  { kind: 'house', label: 'is in the house' },
  { kind: 'nakshatra', label: 'is in the nakṣatra' },
  { kind: 'together', label: 'is in the same sign as' },
  { kind: 'retrograde', label: 'is retrograde' },
];

const blank = (kind: Kind, point: SearchPoint = 'Moon'): Criterion => {
  switch (kind) {
    case 'sign': case 'house': case 'nakshatra': return { kind, point, value: 1 };
    case 'together': return { kind, point, other: point === 'Sun' ? 'Moon' : 'Sun' };
    case 'retrograde': return { kind, point: point === 'Moon' ? 'Saturn' : point };
  }
};

/**
 * The chart search: the saved charts that have a graha in a sign, a house (whole signs from the Lagna) or a nakṣatra, two grahas in one
 * sign, or a retrograde graha. The charts are calculated as the research calculates them, with the settings each was saved with.
 */
export default function ChartSearchPanel({ sources, initialSelected, calculationSettings }: Props) {
  const t = useT();
  const [selected, setSelected] = useState<Set<string>>(() => new Set(initialSelected.size ? initialSelected : sources.map(source => source.id)));
  const [criteria, setCriteria] = useState<Criterion[]>([blank('sign')]);
  const [mode, setMode] = useState<SearchMode>('all');
  const [text, setText] = useState('');
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  const chosen = sources.filter(source => selected.has(source.id));
  const update = (index: number, next: Criterion) => setCriteria(list => list.map((item, i) => (i === index ? next : item)));
  const selectClass = 'rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200';

  async function run() {
    setRunning(true); setError(''); setHits(null);
    try {
      const fetched = await Promise.all(chosen.map(async source => {
        const url = chartRequestUrl(source.saved, calculationSettings);
        if (!url) return null;
        const response = await fetch(url);
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(`${source.name}: ${json.error ?? 'Chart request failed'}`);
        return { id: source.id, name: source.name, client: source.client, chart: json as ChartData };
      }));
      const items = fetched.filter((item): item is NonNullable<typeof item> => item !== null);
      setSkipped(fetched.length - items.length);
      setHits(searchCharts(items, criteria, mode, text));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setRunning(false);
    }
  }

  const valueOptions = (criterion: Criterion) => {
    if (criterion.kind === 'sign') return SIGN_NAMES.map((name, index) => ({ value: index + 1, label: name }));
    if (criterion.kind === 'house') return Array.from({ length: 12 }, (_, index) => ({ value: index + 1, label: String(index + 1) }));
    if (criterion.kind === 'nakshatra') return NAKSHATRA_NAMES.map((name, index) => ({ value: index + 1, label: name }));
    return [];
  };

  const describe = (criterion: Criterion) => {
    const label = t(KINDS.find(item => item.kind === criterion.kind)!.label);
    if (criterion.kind === 'together') return `${criterion.point} ${label} ${criterion.other}`;
    if (criterion.kind === 'retrograde') return `${criterion.point} ${label}`;
    return `${criterion.point} ${label} ${valueOptions(criterion).find(option => option.value === criterion.value)?.label ?? ''}`;
  };

  return (
    <section className="space-y-4 rounded-lg border border-violet-200 p-3 dark:border-violet-900" data-research-chart-search>
      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-violet-700 dark:text-violet-300">{t('Chart search')}</h3>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{t('Find the saved charts that have a graha in a sign, a house or a nakṣatra, two grahas in one sign, or a retrograde graha. Houses count whole signs from the Lagna.')}</p>
      </div>

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{t('charts')}</span>
          <button type="button" onClick={() => setSelected(new Set(sources.map(item => item.id)))} className="rounded border px-2 py-1 text-[10px]">{t('all charts')}</button>
          <button type="button" onClick={() => setSelected(new Set())} className="rounded border px-2 py-1 text-[10px]">{t('none')}</button>
          <span className="text-[10px] text-zinc-400">{chosen.length} / {sources.length}</span>
        </div>
        <div className="grid gap-x-3 gap-y-1 sm:grid-cols-2">
          {sources.map(item => (
            <label key={item.id} className="flex min-h-8 items-center gap-2 text-[11px] font-mono text-zinc-700 dark:text-zinc-200">
              <input type="checkbox" checked={selected.has(item.id)} onChange={() => setSelected(current => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; })} className="h-4 w-4 accent-emerald-600" />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2" data-search="criteria">
        {criteria.map((criterion, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2" data-criterion={index}>
            <select aria-label={t('graha')} value={criterion.point} onChange={event => update(index, { ...criterion, point: event.target.value as SearchPoint } as Criterion)} className={selectClass}>
              {SEARCH_POINTS.map(point => <option key={point} value={point}>{point}</option>)}
            </select>
            <select aria-label={t('condition')} value={criterion.kind} onChange={event => update(index, blank(event.target.value as Kind, criterion.point))} className={selectClass}>
              {KINDS.map(item => <option key={item.kind} value={item.kind}>{t(item.label)}</option>)}
            </select>
            {criterion.kind === 'together' && (
              <select aria-label={t('other graha')} value={criterion.other} onChange={event => update(index, { ...criterion, other: event.target.value as SearchPoint })} className={selectClass}>
                {SEARCH_POINTS.filter(point => point !== criterion.point).map(point => <option key={point} value={point}>{point}</option>)}
              </select>
            )}
            {(criterion.kind === 'sign' || criterion.kind === 'house' || criterion.kind === 'nakshatra') && (
              <select aria-label={t('value')} value={criterion.value} onChange={event => update(index, { ...criterion, value: Number(event.target.value) })} className={selectClass}>
                {valueOptions(criterion).map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            )}
            <button type="button" aria-label={t('remove condition')} onClick={() => setCriteria(list => list.filter((_, i) => i !== index))} className="rounded border px-2 py-1 text-[10px]">×</button>
          </div>
        ))}
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setCriteria(list => [...list, blank('sign')])} className="rounded border px-2 py-1 text-[10px]">{t('+ condition')}</button>
          <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">{t('charts that meet')}
            <select value={mode} onChange={event => setMode(event.target.value as SearchMode)} className={selectClass}>
              <option value="all">{t('all conditions')}</option>
              <option value="any">{t('any condition')}</option>
            </select>
          </label>
          <label className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">{t('name or client')}
            <input value={text} onChange={event => setText(event.target.value)} className={`${selectClass} w-40`} />
          </label>
          <button type="button" disabled={running || chosen.length === 0} onClick={run} className="rounded bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{running ? t('searching…') : t('Search')}</button>
        </div>
      </div>

      {error && <div className="text-xs font-mono text-red-600 dark:text-red-400" role="alert">{error}</div>}
      {hits && (
        <div className="space-y-1" data-search="results" role="status">
          <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
            {hits.length} / {chosen.length - skipped} {t('charts found')}{skipped > 0 ? ` · ${skipped} ${t('charts without enough birth data skipped')}` : ''}
          </div>
          <ul className="space-y-1">
            {hits.map(hit => (
              <li key={hit.id} data-hit={hit.id} className="rounded border border-zinc-200 px-2 py-1.5 text-[11px] font-mono dark:border-zinc-700">
                <span className="font-semibold text-zinc-800 dark:text-zinc-100">{hit.name}</span>
                {hit.client && <span className="ml-2 text-zinc-400">{hit.client}</span>}
                {hit.met.length > 0 && <div className="text-zinc-500 dark:text-zinc-400">{hit.met.map(index => describe(criteria[index])).join(' · ')}</div>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
