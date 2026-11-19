'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SavedChartData } from '@/lib/savedCharts';
import { importSavedCharts } from '@/lib/savedCharts';
import { getTodayString } from '@/lib/dateInput';
import { newId } from '@/lib/ids';
import { occupationGroups, occupationLabel, personChartData, readOgdb, readZipText, type OgdbPerson, type OgdbReadStats } from '@/lib/ogdb';
import { clearOgdb, loadOgdb, ogdbStorageAvailable, replaceOgdb } from '@/lib/ogdbStore';
import { fill, useT } from '@/lib/i18n';

// The Open Gauquelin Database in the LIBRARY (ogdb.ts): the user's own copy of the CSV is read in the browser and kept in IndexedDB; the occupations are the groups.

const PAGE = 50;
const SAVE_LIMIT = 500;
const CELL = 'border-b border-zinc-100 p-1.5 dark:border-zinc-800';

interface Props {
  onOpenChart?: (id: string, name: string, data: SavedChartData) => void;
}

export default function GauquelinPanel({ onOpenChart }: Props) {
  const t = useT();
  const [people, setPeople] = useState<OgdbPerson[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [stats, setStats] = useState<OgdbReadStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [occupation, setOccupation] = useState('');
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);

  useEffect(() => {
    let alive = true;
    (ogdbStorageAvailable() ? loadOgdb() : Promise.resolve([] as OgdbPerson[]))
      .then(list => { if (alive) setPeople(list); })
      .catch(() => { if (alive) setError(t('The browser would not open its storage.')); })
      .finally(() => { if (alive) setLoaded(true); });
    return () => { alive = false; };
  }, [t]);

  const groups = useMemo(() => occupationGroups(people), [people]);
  const selected = useMemo(() => {
    const text = query.trim().toLowerCase();
    return people
      .filter(person => (!occupation || person.occupations.includes(occupation)) && (!text || person.name.toLowerCase().includes(text) || person.place.toLowerCase().includes(text)))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [people, occupation, query]);

  const readFile = useCallback(async (file: File) => {
    setBusy(true); setError(''); setMessage('');
    try {
      const isZip = /\.zip$/i.test(file.name);
      const text = isZip ? await readZipText(await file.arrayBuffer()) : await file.text();
      const read = readOgdb(text);
      if (read.people.length === 0) throw new Error(t('No person with a birth moment and a place was found in the file.'));
      await replaceOgdb(read.people);
      setPeople(read.people); setStats(read.stats); setOccupation(''); setQuery(''); setShown(PAGE);
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : String(problem));
    } finally {
      setBusy(false);
    }
  }, [t]);

  const keep = (list: OgdbPerson[], group: string) => {
    const now = new Date().toISOString();
    const today = getTodayString();
    const charts = list.map(person => ({ id: newId(), name: person.name, client: group ? `OGDB ${occupationLabel(group)}` : 'OGDB', createdAt: now, updatedAt: now, chartData: personChartData(person, today) }));
    try {
      const added = importSavedCharts(JSON.stringify({ exportedAt: now, charts }));
      setMessage(fill(t('{count} charts saved to the saved charts.'), { count: added }));
    } catch {
      setError(t('The browser has no room for them; save a smaller group.'));
    }
  };

  const chip = (on: boolean) => `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;

  return (
    <div className="min-w-0 space-y-4" data-gauquelin="panel">
      <div className="space-y-1">
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('The Open Gauquelin Database (opengauquelin.org): about 25 000 people with a birth time, born 1572–1959, mostly in France, in professional groups. Download ogdb-time.csv.zip from the site and choose it here; it is read in this browser and kept in its storage, nothing is sent anywhere. The site’s content is under GPL, FDL and CC-BY-SA-4; the data come from the Gauquelins’ books, Müller, Ertel and CURA v5, and the licence of the data itself is not stated on the site (docs/open-gauquelin.md). Birth times in France are rounded to the hour until the 1920s.')}
        </p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs dark:border-zinc-600">
          <span>{busy ? t('Reading…') : people.length ? t('Replace the file') : t('Choose the file')}</span>
          <input type="file" accept=".zip,.csv,text/csv,application/zip" className="sr-only" data-gauquelin="file" disabled={busy} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; if (file) void readFile(file); }} />
        </label>
        {people.length > 0 && (
          <button type="button" className="ml-2 rounded-md border border-zinc-300 px-3 py-1.5 text-xs text-zinc-500 dark:border-zinc-600" onClick={() => { void clearOgdb().then(() => { setPeople([]); setStats(null); setOccupation(''); }); }}>
            {t('Remove the loaded data')}
          </button>
        )}
      </div>

      {error && <p className="text-xs font-mono text-rose-600 dark:text-rose-400" data-gauquelin="error">{error}</p>}
      {message && <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400" data-gauquelin="message">{message}</p>}
      {stats && (
        <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400" data-gauquelin="stats">
          {fill(t('{people} people of {rows} rows. Left out: {noDate} without a date, {noZone} without a time zone, {noPlace} without a place. {approx} have a place that is a guess (the longitude turned or taken from another entry of the same place).'), { people: stats.people, rows: stats.rows, noDate: stats.noDate, noZone: stats.noZone, noPlace: stats.noPlace, approx: stats.approx })}
        </p>
      )}

      {loaded && people.length === 0 && !busy && !error && <p className="text-xs font-mono text-zinc-400" data-gauquelin="empty">{t('Nothing loaded yet.')}</p>}

      {people.length > 0 && (
        <>
          <div data-gauquelin="groups">
            <div className="mb-1 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Occupation groups')}</div>
            <div className="flex flex-wrap gap-1">
              <button type="button" aria-pressed={occupation === ''} onClick={() => { setOccupation(''); setShown(PAGE); }} className={chip(occupation === '')}>{t('all')} {people.length}</button>
              {groups.map(group => (
                <button key={group.occupation} type="button" aria-pressed={occupation === group.occupation} data-gauquelin-group={group.occupation} onClick={() => { setOccupation(group.occupation); setShown(PAGE); }} className={chip(occupation === group.occupation)}>
                  {occupationLabel(group.occupation)} {group.count}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input value={query} onChange={event => { setQuery(event.target.value); setShown(PAGE); }} aria-label={t('search by name or place')} placeholder={t('name or place')} className="w-48 rounded border border-zinc-300 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800" />
            <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400" data-gauquelin-count={selected.length}>{fill(t('{count} people'), { count: selected.length })}</span>
            <button type="button" className={chip(false)} disabled={selected.length === 0 || selected.length > SAVE_LIMIT} title={selected.length > SAVE_LIMIT ? fill(t('Choose a group of {limit} or fewer to save it.'), { limit: SAVE_LIMIT }) : ''} onClick={() => keep(selected, occupation)} data-gauquelin="save-group">
              {t('Save these to my charts')}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left font-mono text-[10px] text-zinc-600 dark:text-zinc-300" data-gauquelin="table">
              <thead>
                <tr className="text-zinc-500 dark:text-zinc-400">
                  {['Name', 'Occupation', 'Born', 'Place', ''].map(label => <th key={label} scope="col" className="border-b border-zinc-200 p-1.5 dark:border-zinc-700">{label ? t(label) : ''}</th>)}
                </tr>
              </thead>
              <tbody>
                {selected.slice(0, shown).map(person => (
                  <tr key={person.id} data-gauquelin-person={person.id}>
                    <th scope="row" className={`${CELL} font-semibold`}>{person.name}</th>
                    <td className={CELL}>{person.occupations.map(occupationLabel).join(', ')}</td>
                    <td className={`${CELL} tabular-nums`}>{person.birth.slice(0, 10)} {person.birth.slice(11, 13)}:{person.birth.slice(14, 16)}</td>
                    <td className={CELL}>{person.place}{person.country ? `, ${person.country}` : ''}{person.approx ? ' ≈' : ''}</td>
                    <td className={`${CELL} whitespace-nowrap`}>
                      {onOpenChart && <button type="button" className="mr-1 underline" onClick={() => onOpenChart(newId(), person.name, personChartData(person, getTodayString()))}>{t('Open')}</button>}
                      <button type="button" className="underline" onClick={() => keep([person], '')}>{t('Save')}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selected.length > shown && <button type="button" className={chip(false)} onClick={() => setShown(value => value + PAGE)}>{fill(t('Show {count} more'), { count: Math.min(PAGE, selected.length - shown) })}</button>}
        </>
      )}
    </div>
  );
}
