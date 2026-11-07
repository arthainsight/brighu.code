'use client';

import { useMemo, useState } from 'react';
import type { CalculationSettings, ChartData } from '@/types';
import { loadSavedCharts, type SavedChart } from '@/lib/savedCharts';
import { chartRequestUrl } from '@/lib/research/studyData';
import {
  ashtakoota, kujaBalance, kujaDosha, type Ashtakoota, type GanaTable, type KujaDosha, type KutaKey, type VashyaTable,
} from '@/lib/ashtakoota';
import { useT } from '@/lib/i18n';

const POINTS = ['Moon', 'Lagna', 'Sun', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'] as const;
type Point = typeof POINTS[number];

const KUTA_LABEL: Record<KutaKey, { name: string; meaning: string }> = {
  varna: { name: 'Varna', meaning: 'Spiritual development and ego; the boy’s varna must not be lower' },
  vashya: { name: 'Vashya', meaning: 'Mutual attraction and control' },
  tara: { name: 'Tara', meaning: 'Health and well-being; the stars counted both ways' },
  yoni: { name: 'Yoni', meaning: 'Physical and sexual compatibility' },
  maitri: { name: 'Graha Maitri', meaning: 'Mental affinity: the lords of the two Moon signs' },
  gana: { name: 'Gana', meaning: 'Temperament: Deva, Manushya, Rakshasa' },
  bhakoot: { name: 'Bhakoot', meaning: 'Emotional bond and family welfare; 2/12, 5/9 and 6/8 are the dosha' },
  nadi: { name: 'Nadi', meaning: 'Health and progeny; the same Nadi is the dosha' },
};

/** The sign and longitude of a point of a chart, or null when the chart lacks it. */
function longitudeOf(chart: ChartData, point: Point): number | null {
  if (point === 'Lagna') return chart.ascendant.longitude;
  return chart.planets.find(planet => planet.name === point)?.longitude ?? null;
}

function kujaOf(chart: ChartData): KujaDosha | null {
  const sign = (name: string) => chart.planets.find(planet => planet.name === name)?.sign;
  const [moon, venus, mars] = [sign('Moon'), sign('Venus'), sign('Mars')];
  if (moon === undefined || venus === undefined || mars === undefined) return null;
  return kujaDosha({ lagna: chart.ascendant.sign, moon, venus, mars });
}

/** Reads a verdict band for a total: the bands in common use (below 18 not advised, 18 to 24 acceptable, 25 to 32 good, 33 and over excellent). */
function band(total: number): string {
  if (total < 18) return 'below 18: not advised by the common reading';
  if (total < 25) return '18 to 24: acceptable';
  if (total < 33) return '25 to 32: good';
  return '33 and over: excellent';
}

interface Outcome {
  match: Ashtakoota;
  boyName: string;
  girlName: string;
  kuja: { boy: KujaDosha; girl: KujaDosha } | null;
  point: Point;
}

/**
 * The matching of two saved charts: the Ashtakoota of the Moons (or of the Lagnas, or of another point of the two charts, as Kala shows), the four extra
 * matchings and the Kuja dosha of each. The first chart is the boy, the second the girl, because the tables are not symmetric.
 */
export default function CompatibilityPanel({ calculationSettings, charts: given }: { calculationSettings?: CalculationSettings; charts?: SavedChart[] }) {
  const t = useT();
  const charts = useMemo(() => given ?? loadSavedCharts(), [given]);
  const [boyId, setBoyId] = useState(charts[0]?.id ?? '');
  const [girlId, setGirlId] = useState(charts[1]?.id ?? charts[0]?.id ?? '');
  const [point, setPoint] = useState<Point>('Moon');
  const [table, setTable] = useState<VashyaTable>('saravali');
  const [ganaTable, setGanaTable] = useState<GanaTable>('muhurta');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const selectClass = 'rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200';
  const cell = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';

  async function run() {
    const boy = charts.find(chart => chart.id === boyId);
    const girl = charts.find(chart => chart.id === girlId);
    if (!boy || !girl) return;
    setRunning(true); setError(''); setOutcome(null);
    try {
      const [boyChart, girlChart] = await Promise.all([boy, girl].map(async saved => {
        const url = chartRequestUrl(saved.chartData, calculationSettings);
        if (!url) throw new Error(`${saved.name}: ${t('the chart has not enough birth data to calculate')}`);
        const response = await fetch(url);
        const json = await response.json();
        if (!response.ok || json.error) throw new Error(`${saved.name}: ${json.error ?? 'Chart request failed'}`);
        return json as ChartData;
      }));
      const boyLongitude = longitudeOf(boyChart, point);
      const girlLongitude = longitudeOf(girlChart, point);
      if (boyLongitude === null || girlLongitude === null) throw new Error(t('the chart lacks that point'));
      const boyKuja = kujaOf(boyChart);
      const girlKuja = kujaOf(girlChart);
      setOutcome({
        match: ashtakoota(boyLongitude, girlLongitude, { vashyaTable: table, ganaTable }),
        boyName: boy.name,
        girlName: girl.name,
        kuja: boyKuja && girlKuja ? { boy: boyKuja, girl: girlKuja } : null,
        point,
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setRunning(false);
    }
  }

  if (charts.length === 0) {
    return <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400" data-compat="empty">{t('Save at least one chart (and a second one for the other person) to match them.')}</p>;
  }

  const verdictOf = (value: boolean) => (value ? t('passed') : t('not passed'));

  return (
    <section className="space-y-4 rounded-lg border border-violet-200 p-3 dark:border-violet-900" data-compat="panel" aria-label={t('compatibility')}>
      <div>
        <h3 className="text-[11px] font-mono uppercase tracking-widest text-violet-700 dark:text-violet-300">{t('Compatibility · Ashtakoota')}</h3>
        <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
          {t('The eight kutas (36 points) of the Moons of two saved charts, the four extra matchings and the Kuja dosha of each. The first chart is the boy and the second the girl, because the tables are not symmetric. The eight kutas are checked against Muhurta Chintamani 6.21–6.34; see docs/ashtakoota-sources.md.')}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1 text-[10px] font-mono text-zinc-500">{t('boy (groom)')}
          <select aria-label={t('boy (groom)')} value={boyId} onChange={event => setBoyId(event.target.value)} className={`${selectClass} block`}>
            {charts.map(chart => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-mono text-zinc-500">{t('girl (bride)')}
          <select aria-label={t('girl (bride)')} value={girlId} onChange={event => setGirlId(event.target.value)} className={`${selectClass} block`}>
            {charts.map(chart => <option key={chart.id} value={chart.id}>{chart.name}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-mono text-zinc-500">{t('matched by the')}
          <select aria-label={t('matched by the')} value={point} onChange={event => setPoint(event.target.value as Point)} className={`${selectClass} block`}>
            {POINTS.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-mono text-zinc-500">{t('Vashya table')}
          <select aria-label={t('Vashya table')} value={table} onChange={event => setTable(event.target.value as VashyaTable)} className={`${selectClass} block`}>
            <option value="saravali">saravali.de</option>
            <option value="astroyogi">astroyogi.com</option>
          </select>
        </label>
        <label className="space-y-1 text-[10px] font-mono text-zinc-500">{t('Gana table')}
          <select aria-label={t('Gana table')} value={ganaTable} onChange={event => setGanaTable(event.target.value as GanaTable)} className={`${selectClass} block`}>
            <option value="muhurta">{t('Muhurta Chintamani')}</option>
            <option value="common">{t('common (PyJHora)')}</option>
          </select>
        </label>
        <button type="button" disabled={running || !boyId || !girlId} onClick={run} className="rounded bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {running ? t('matching…') : t('Match')}
        </button>
      </div>

      {error && <div className="text-xs font-mono text-red-600 dark:text-red-400" role="alert">{error}</div>}

      {outcome && (
        <div className="space-y-4" data-compat="result">
          <div className="space-y-1">
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100" data-compat="total">
              {outcome.match.total} / 36
            </div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
              {outcome.boyName} ({outcome.point}: {outcome.match.boy.nakshatra}.{outcome.match.boy.pada}) · {outcome.girlName} ({outcome.point}: {outcome.match.girl.nakshatra}.{outcome.match.girl.pada}) · {t(band(outcome.match.total))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-compat="kutas">
              <thead>
                <tr className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  <th className={`${cell} text-left`}>{t('Kuta')}</th>
                  <th className={cell}>{t('boy')}</th>
                  <th className={cell}>{t('girl')}</th>
                  <th className={cell}>{t('points')}</th>
                  <th className={`${cell} text-left`}>{t('what it reads')}</th>
                </tr>
              </thead>
              <tbody>
                {outcome.match.kutas.map(kuta => (
                  <tr key={kuta.key} data-kuta={kuta.key} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`${cell} text-left font-semibold`}>{KUTA_LABEL[kuta.key].name}</th>
                    <td className={cell}>{kuta.boy}</td>
                    <td className={cell}>{kuta.girl}</td>
                    <td className={`${cell} font-semibold ${kuta.points === 0 ? 'text-red-600 dark:text-red-400' : kuta.points === kuta.max ? 'text-emerald-700 dark:text-emerald-400' : ''}`}>{kuta.points} / {kuta.max}</td>
                    <td className={`${cell} text-left text-[10px] text-zinc-500 dark:text-zinc-400`}>{t(KUTA_LABEL[kuta.key].meaning)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold text-zinc-800 dark:text-zinc-100">
                  <th scope="row" className={`${cell} text-left`}>{t('Total')}</th>
                  <td className={cell} colSpan={2} />
                  <td className={cell}>{outcome.match.total} / 36</td>
                  <td className={cell} />
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400" data-compat="vashya-other">
            {t('Vashya by the other table')} ({outcome.match.vashyaOther.table === 'astroyogi' ? 'astroyogi.com' : 'saravali.de'}): {outcome.match.vashyaOther.points} / 2
            {' · '}{t('Gana by the other table')} ({outcome.match.ganaOther.table === 'muhurta' ? t('Muhurta Chintamani') : t('common (PyJHora)')}): {outcome.match.ganaOther.points} / 6
          </p>

          {(outcome.match.doshas.nadi || outcome.match.doshas.bhakoot || outcome.match.doshas.gana) && (
            <div className="space-y-1" data-compat="doshas">
              {outcome.match.doshas.nadi && <p className="text-[11px] font-mono text-red-600 dark:text-red-400">{t('Nadi dosha: both have the same Nadi.')}</p>}
              {outcome.match.doshas.bhakoot && <p className="text-[11px] font-mono text-red-600 dark:text-red-400">{t('Bhakoot dosha: the Moon signs stand 2/12, 5/9 or 6/8 from each other.')}</p>}
              {outcome.match.doshas.gana && <p className="text-[11px] font-mono text-red-600 dark:text-red-400">{t('Gana dosha: the Ganas do not suit (0 points).')}</p>}
              <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{t('The classical cancellations of these doshas differ from text to text and are not applied.')}</p>
            </div>
          )}

          <table className="w-full max-w-md border-collapse text-center font-mono text-xs" data-compat="extras">
            <thead>
              <tr className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"><th className={`${cell} text-left`}>{t('Extra matching')}</th><th className={cell}>{t('result')}</th></tr>
            </thead>
            <tbody className="text-zinc-700 dark:text-zinc-200">
              <tr data-extra="mahendra"><th scope="row" className={`${cell} text-left`}>Mahendra</th><td className={cell}>{verdictOf(outcome.match.extras.mahendra)}</td></tr>
              <tr data-extra="vedha"><th scope="row" className={`${cell} text-left`}>Vedha</th><td className={cell}>{verdictOf(outcome.match.extras.vedha)}</td></tr>
              <tr data-extra="rajju"><th scope="row" className={`${cell} text-left`}>Rajju</th><td className={cell}>{verdictOf(outcome.match.extras.rajju)}</td></tr>
              <tr data-extra="stri-dirgha"><th scope="row" className={`${cell} text-left`}>Stri Dirgha</th><td className={cell}>{verdictOf(outcome.match.extras.striDirgha)}</td></tr>
            </tbody>
          </table>

          <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{t('Mahendra, Vedha, Rajju and Stri Dirgha are of the Southern tradition; Muhurta Chintamani does not have them.')}</p>

          {outcome.kuja && (
            <div className="space-y-1" data-compat="kuja">
              <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Kuja dosha (Mars in the 1st, 2nd, 4th, 7th, 8th or 12th)')}</div>
              {[[outcome.boyName, outcome.kuja.boy], [outcome.girlName, outcome.kuja.girl]].map(([name, dosha]) => (
                <p key={name as string} className="text-[11px] font-mono text-zinc-700 dark:text-zinc-200">
                  {name as string}: {t('Mars from the Lagna')} {(dosha as KujaDosha).fromLagna}, {t('from the Moon')} {(dosha as KujaDosha).fromMoon} · {(dosha as KujaDosha).any ? t('Kuja dosha') : t('no Kuja dosha')}
                </p>
              ))}
              <p className="text-[11px] font-mono font-semibold text-zinc-700 dark:text-zinc-200">
                {{ none: t('Neither has the Kuja dosha.'), balanced: t('Both have the Kuja dosha: the common reading counts them as balancing each other.'), 'one-sided': t('Only one has the Kuja dosha: the common reading counts this as a mismatch.') }[kujaBalance(outcome.kuja.boy, outcome.kuja.girl)]}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
