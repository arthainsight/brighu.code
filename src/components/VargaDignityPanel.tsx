'use client';

import { Fragment, useMemo, useState } from 'react';
import type { ChartData } from '@/types';
import { DIGNITY_SCORE, GOOD_DIGNITY, HOST_WEIGHT, vargaDignity, type DignityLevel } from '@/lib/vargaDignity';
import { VARGA_NAMES } from '@/lib/vargaChart';
import { SIGN_ABBR, SIGN_NAMES } from '@/lib/signs';
import { fill, useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

// Dignity in a divisional chart, the Navāṁśa first (vargaDignity.ts): after a teacher's lessons, with what was chosen named on the page. Not a rule of a classic.

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;
const DIVISIONS = [9, 1, 7, 10, 12, 16] as const;
const LEVEL_TEXT: Record<DignityLevel, string> = {
  exalted: 'exalted', own: 'own sign', adhimitra: 'great friend', mitra: 'friend', sama: 'neutral', shatru: 'enemy', adhishatru: 'great enemy', debilitated: 'fallen',
};
const scoreClass = (value: number) => (value >= GOOD_DIGNITY ? 'text-emerald-600 dark:text-emerald-400' : value >= 3 ? 'text-zinc-700 dark:text-zinc-200' : 'text-red-600 dark:text-red-400');

export default function VargaDignityPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const { name: graha } = useGrahaNames();
  const [division, setDivision] = useState<number>(9);
  const result = useMemo(
    () => vargaDignity(chart.planets.map(planet => ({ name: planet.name, longitude: planet.longitude })), chart.ascendant.longitude, division),
    [chart, division],
  );
  const chip = (on: boolean) => `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;

  return (
    <div className="min-w-0 space-y-4" data-varga-dignity="panel">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Dignity in a divisional chart')}</div>
        <p className="mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {fill(t('The dignity of each graha in the chosen division, from exalted (7) through own sign, great friend, friend, neutral, enemy and great enemy to fallen (0); the four upper states are read as good. The dignity is recursive: the host of the sign (its lord) lends part of its own effective dignity to the guest, {weight} of it, and so on down the chain. After a teacher’s lessons on dignity and the Navāṁśa, not a rule of a classic; the steps, the weight of the host, the dominance and the signs are choices made here (docs/varga-dignity.md). Conjunctions and aspects are not worked in.'), { weight: HOST_WEIGHT })}
        </p>
      </div>
      <div className="flex flex-wrap gap-1" role="group" aria-label={t('Division')}>
        {DIVISIONS.map(item => (
          <button key={item} type="button" aria-pressed={division === item} onClick={() => setDivision(item)} className={chip(division === item)}>D{item} · {VARGA_NAMES[item]}</button>
        ))}
      </div>

      {!result ? <p className="text-[10px] font-mono text-zinc-400">{t('A graha is missing from the chart.')}</p> : (
        <>
          <div className="space-y-1 font-mono text-xs text-zinc-700 dark:text-zinc-200" data-varga-dignity-average={result.average.toFixed(2)}>
            <div>
              {t('Average dignity')}: <span className={`font-bold ${scoreClass(result.average)}`}>{result.average.toFixed(2)}</span> / 7
              <span className="text-zinc-400 dark:text-zinc-500"> · {t('without the hosts')} {result.plainAverage.toFixed(2)}</span>
            </div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">{fill(t('The mean of the seven grahas. The Lagna of the division: {sign}.'), { sign: t(SIGN_NAMES[result.ascendantSign]) })}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-center font-mono text-xs" data-varga-dignity-table>
              <thead>
                <tr>
                  <th scope="col" className={HEAD}>#</th>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Graha')}</th>
                  <th scope="col" className={HEAD}>{t('Sign')}</th>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Dignity')}</th>
                  <th scope="col" className={HEAD}>{t('Score')}</th>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Host chain')}</th>
                  <th scope="col" className={HEAD}>{t('Effective')}</th>
                  <th scope="col" className={HEAD}>{t('Dominance')}</th>
                  <th scope="col" className={HEAD} />
                </tr>
              </thead>
              <tbody>
                {result.grahas.map((item, index) => (
                  <Fragment key={item.name}>
                    <tr data-varga-dignity-row={item.name} data-varga-dignity-symbol={item.symbol ?? 'none'} className="text-zinc-700 dark:text-zinc-200">
                      <td className={`${CELL} tabular-nums`}>{index + 1}</td>
                      <th scope="row" className={`text-left font-semibold ${CELL}`}>{graha(item.name)}</th>
                      <td className={CELL}>{SIGN_ABBR[item.sign]}</td>
                      <td className={`text-left ${CELL} ${scoreClass(item.score)}`}>{t(LEVEL_TEXT[item.level])}</td>
                      <td className={`${CELL} tabular-nums`}>{DIGNITY_SCORE[item.level]}</td>
                      <td className={`text-left ${CELL}`}>{result.chains[item.name].map(graha).join(' → ')}</td>
                      <td className={`${CELL} font-bold tabular-nums ${scoreClass(item.effective)}`}>{item.effective.toFixed(2)}</td>
                      <td className={`${CELL} tabular-nums`}>{item.dominance}</td>
                      <td className={`${CELL} text-base`} title={item.symbol === 'inverted' ? t('High dominance, low dignity: strong and troubled') : item.symbol === 'upright' ? t('Low dominance, good dignity: a resource seldom used') : ''}>{item.symbol === 'inverted' ? '∇' : item.symbol === 'upright' ? 'Δ' : ''}</td>
                    </tr>
                    {result.flags.includes(index) && (
                      <tr key={`${item.name}-flag`} data-varga-dignity-flag={index} className="text-amber-700 dark:text-amber-400">
                        <td colSpan={9} className={`${CELL} text-left`}>🚩 {t('A sharp turn from a benefic to a malefic (or back): slow down between these themes.')}</td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="space-y-0.5 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            <li>{t('The list is in the order of dominance: the number of the grahas and the Lagna in the tree of hosts under a graha, itself counted; ties by the effective dignity.')}</li>
            <li>∇ {t('high dominance (the upper three) with a low dignity (under 4): a strong motive that brings trouble.')}</li>
            <li>Δ {t('low dominance (the lower three) with a good dignity (4 and over): a resource that is seldom used.')}</li>
          </ul>
        </>
      )}
    </div>
  );
}
