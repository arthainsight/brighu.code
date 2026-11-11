'use client';

import { useMemo, useState } from 'react';
import type { ChartData } from '@/types';
import { TRUE_SIGN_DIVISIONS, TRUE_SIGN_TOTAL, TRUE_SIGN_WEIGHTS, trueSigns, type TrueSignBody } from '@/lib/trueSigns';
import { SIGN_ABBR, SIGN_NAMES } from '@/lib/signs';
import { VARGA_NAMES } from '@/lib/vargaChart';
import { fill, useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

// True signs (trueSigns.ts), after a video lesson on a modern True Signs report: the signs the grahas take in six divisions, weighted. Not a rule of a classic.

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;
const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;
const EXTRA = ['Lagna', 'Rahu', 'Ketu'] as const;

function Bars({ share, marker }: { share: number[]; marker: string }) {
  const t = useT();
  const rows = share.map((value, sign) => ({ sign, value })).filter(row => row.value > 0).sort((a, b) => b.value - a.value || a.sign - b.sign);
  const top = rows[0]?.value ?? 1;
  return (
    <ol className="space-y-1" data-true-signs-bars={marker}>
      {rows.map(row => (
        <li key={row.sign} className="flex items-center gap-2 font-mono text-xs" data-true-sign={row.sign + 1} data-true-sign-percent={(row.value * 100).toFixed(1)}>
          <span className="w-24 shrink-0 text-zinc-700 dark:text-zinc-200" title={t(SIGN_NAMES[row.sign])}>{SIGN_ABBR[row.sign]} · {t(SIGN_NAMES[row.sign])}</span>
          <span className="h-4 min-w-0 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
            <span className="block h-full rounded bg-emerald-500 dark:bg-emerald-600" style={{ width: `${(row.value / top) * 100}%` }} />
          </span>
          <span className="w-14 shrink-0 text-right tabular-nums text-zinc-600 dark:text-zinc-300">{(row.value * 100).toFixed(1)} %</span>
        </li>
      ))}
    </ol>
  );
}

export default function TrueSignsPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const { name: graha } = useGrahaNames();
  const [included, setIncluded] = useState<string[]>([...GRAHAS, ...EXTRA]);
  const [detail, setDetail] = useState<string>('Venus');
  const bodies = useMemo<Record<string, TrueSignBody>>(() => {
    const all: Record<string, TrueSignBody> = { Lagna: { name: 'Lagna', longitude: chart.ascendant.longitude } };
    for (const planet of chart.planets) all[planet.name] = { name: planet.name, longitude: planet.longitude };
    return all;
  }, [chart]);
  const result = useMemo(() => trueSigns([...GRAHAS, ...EXTRA].filter(name => included.includes(name) && bodies[name]).map(name => bodies[name])), [bodies, included]);
  const detailPlacement = result.placements.find(item => item.name === detail) ?? result.placements[0];
  const chip = (on: boolean) => `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;
  const label = (name: string) => (name === 'Lagna' ? t('Lagna') : graha(name));
  const toggle = (name: string) => setIncluded(current => (current.includes(name) ? current.filter(item => item !== name) : [...current, name]));

  return (
    <div className="min-w-0 space-y-5" data-true-signs="panel">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('True signs')}</div>
        <p className="mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {fill(t('The signs the bodies take in six divisions, D1, D9, D7, D12, D10 and D16, counted together with the weights {weights} (out of {total}). The overall balance is the mean of the bodies with a weight for each: the Lagna 1, the Moon 0.75, the Sun 0.6 and the other grahas, Rāhu and Ketu 0.5. After a modern True Signs report: the weights were found from the figures of charts shown in videos and given by the user (docs/true-signs.md), and this is not a rule of a classic. The divisions are the Parāśara ones. The report’s own longitudes are tropical (set the ayanāṁśa to none) and with the true node (the node setting).'), { weights: TRUE_SIGN_DIVISIONS.map(division => `D${division} ${TRUE_SIGN_WEIGHTS[division]}`).join(', '), total: TRUE_SIGN_TOTAL })}
        </p>
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label={t('Grahas counted')}>
        {[...GRAHAS, ...EXTRA].map(name => (
          <button key={name} type="button" aria-pressed={included.includes(name)} onClick={() => toggle(name)} className={chip(included.includes(name))}>{label(name)}</button>
        ))}
      </div>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('Overall balance of signs')}</h4>
        {result.placements.length > 0 ? <Bars share={result.overall} marker="overall" /> : <p className="text-[10px] font-mono text-zinc-400">{t('Pick at least one graha.')}</p>}
      </section>

      {detailPlacement && (
        <section className="space-y-2">
          <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('Balance of signs of one graha')}</h4>
          <div className="flex flex-wrap gap-1">
            {result.placements.map(item => (
              <button key={item.name} type="button" aria-pressed={item.name === detailPlacement.name} onClick={() => setDetail(item.name)} className={chip(item.name === detailPlacement.name)}>{label(item.name)}</button>
            ))}
          </div>
          <Bars share={detailPlacement.share} marker={detailPlacement.name} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-center font-mono text-xs" data-true-signs-table={detailPlacement.name}>
              <thead>
                <tr>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Division')}</th>
                  <th scope="col" className={HEAD}>{t('Weight')}</th>
                  <th scope="col" className={HEAD}>{t('Sign')}</th>
                </tr>
              </thead>
              <tbody>
                {TRUE_SIGN_DIVISIONS.map(division => (
                  <tr key={division} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`text-left font-semibold ${CELL}`}>D{division} · {VARGA_NAMES[division]}</th>
                    <td className={`${CELL} tabular-nums`}>{TRUE_SIGN_WEIGHTS[division]} / {TRUE_SIGN_TOTAL}</td>
                    <td className={CELL}>{SIGN_ABBR[detailPlacement.signs[division] - 1]} · {t(SIGN_NAMES[detailPlacement.signs[division] - 1])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
