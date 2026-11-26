'use client';

import type { ChartData } from '@/types';
import { VELA_RESULTS, VELA_SOURCE, VELA_UNCONFIRMED, velaOfBirth, velaSkyOfChart, type Guna, type VelaMethod, type VelaResult } from '@/lib/vela';
import { fill, useT } from '@/lib/i18n';

// The Vela of birth, Sattva, Rajas or Tamas (vela.ts): after Jātakapārijāta 9.123–125. The length of a half-yāma, the start of the count and the change of the weekday are not
// settled by the text, so both lengths are shown and the page says what is unconfirmed (docs/jataka-parijata-vela-sources.md).

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;
const GUNA_CLASS: Record<Guna, string> = {
  Sattva: 'text-emerald-600 dark:text-emerald-400',
  Rajas: 'text-amber-600 dark:text-amber-400',
  Tamas: 'text-rose-600 dark:text-rose-400',
};
const METHOD_LABEL: Record<VelaMethod, string> = {
  fixed: 'An hour and a half from sunrise (Sastri’s note)',
  proportional: 'An eighth of the day and an eighth of the night (Mishra; as Parāśara’s eighths)',
};

/** Hours on a line (negative the day before, past 24 the day after) as HH:MM:SS, with a mark for the other day. */
function clock(hours: number): string {
  const total = Math.round(hours * 3600);
  const day = Math.floor(total / 86_400);
  const within = total - day * 86_400;
  const text = [Math.floor(within / 3600), Math.floor((within % 3600) / 60), within % 60].map(value => String(value).padStart(2, '0')).join(':');
  return day === 0 ? text : `${text} (${day > 0 ? '+' : ''}${day})`;
}
const minutesText = (hours: number) => {
  const minutes = Math.round(hours * 60);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;
};

export default function VelaPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const debug = chart.debug;
  const input = velaSkyOfChart(debug);
  const results = input?.sky ? velaOfBirth(input.sky) : [];
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!input?.sky) {
    return <p className="text-[10px] font-mono text-zinc-400" data-vela="none">{t('The sunrise and sunset of the birth are missing from this chart (the Sun does not rise and set here, or the chart is an old save); calculate it again.')}</p>;
  }
  const agree = results.length === 2 && results[0].part.guna === results[1].part.guna;
  const day = results[0]?.day;

  return (
    <div className="min-w-0 space-y-4" data-vela="panel">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Vela')}</div>
        <p className="mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('The Vela of birth, Sattva, Rajas or Tamas: the weekday has 16 half-yāmas (ardha-yāma), and the Velas go Tamas, Sattva, Rajas, Tamas … in one unbroken cycle from the first half-yāma of Sunday, which is Tamas. It is not the Vara (the weekday), the Hora (the planetary hour), the Kāla (the time of day) or the Tithi.')}
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[11px] font-mono text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200" data-vela="unconfirmed">
        <div className="font-bold">{t('Not confirmed by the classical text')}</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {VELA_UNCONFIRMED.map(point => <li key={point}>{t(point)}</li>)}
        </ul>
        <p className="mt-1">{t('So the result is not shown as the text’s own; the two lengths are given side by side, and where they agree the Vela is the same by either.')}</p>
      </div>

      <div className="space-y-0.5 font-mono text-[11px] text-zinc-600 dark:text-zinc-300" data-vela="inputs">
        <div className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Taken from the chart')}</div>
        <div>{t('Birth')}: {input.date} · {t('time zone')} UTC{(debug?.utcOffset ?? 0) >= 0 ? '+' : ''}{debug?.utcOffset} · {debug?.latitude?.toFixed(4)}, {debug?.longitude?.toFixed(4)}</div>
        <div>{t('Sunrise')} {clock(input.sky.sunrise)} · {t('sunset')} {clock(input.sky.sunset)} · {t('next sunrise')} {clock(input.sky.nextSunrise)} · {t('previous sunrise')} {clock(input.sky.previousSunrise)} · {t('previous sunset')} {clock(input.sky.previousSunset)}</div>
        <div data-vela-weekday={day?.weekday}>{t('Weekday of the day the birth is in (sunrise to sunrise)')}: <span className="font-bold">{t(weekdays[day?.weekday ?? 0])}</span>{input.sky.birth < input.sky.sunrise && ` (${t('before sunrise: the day before')})`}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-left font-mono text-xs" data-vela="table">
          <thead>
            <tr>
              <th scope="col" className={HEAD}>{t('Method')}</th>
              <th scope="col" className={HEAD}>{t('Vela')}</th>
              <th scope="col" className={HEAD}>{t('Half-yāma')}</th>
              <th scope="col" className={HEAD}>{t('Begins')}</th>
              <th scope="col" className={HEAD}>{t('Ends')}</th>
              <th scope="col" className={HEAD}>{t('The birth in it')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map(result => (
              <tr key={result.method} data-vela-method={result.method} data-vela-guna={result.part.guna} data-vela-segment={result.part.segment} className="text-zinc-700 dark:text-zinc-200">
                <th scope="row" className={`${CELL} font-normal`}>{t(METHOD_LABEL[result.method])}</th>
                <td className={`${CELL} font-bold ${GUNA_CLASS[result.part.guna]}`}>{result.part.guna}</td>
                <td className={`${CELL} tabular-nums`}>{result.part.segment} / 16 · {t(result.part.night ? 'night' : 'day')}</td>
                <td className={`${CELL} tabular-nums`}>{clock(result.part.start)}</td>
                <td className={`${CELL} tabular-nums`}>{clock(result.part.end)}</td>
                <td className={CELL}>{fill(t('{elapsed} after the start, {share} % of the half-yāma ({left} left)'), { elapsed: minutesText(result.elapsed), share: Math.round(result.fraction * 100), left: minutesText(result.part.end - result.part.start - result.elapsed) })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400" data-vela-agree={agree ? 'true' : 'false'}>
        {agree ? fill(t('Both lengths give the {guna} Vela.'), { guna: results[0].part.guna }) : t('The two lengths give a different Vela for this birth; the text does not say which is meant.')}
      </p>

      {[...new Set(results.map(result => result.part.guna))].map(guna => (
        <div key={guna} className="rounded-md border border-zinc-200 p-3 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-300" data-vela-reading={guna}>
          <div className={`font-semibold ${GUNA_CLASS[guna]}`}>{guna} Vela · {VELA_RESULTS[guna].verse}</div>
          <div className="mt-1" lang="sa">{VELA_RESULTS[guna].sanskrit}</div>
          <div className="mt-1">{t(VELA_RESULTS[guna].reading)}</div>
        </div>
      ))}
      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{t('These are the traditional astrological readings of the text, not scientific assessments of a person.')} {t('Source')}: {VELA_SOURCE}.</p>

      {results.map(result => <Parts key={result.method} result={result} label={METHOD_LABEL[result.method]} />)}
    </div>
  );
}

/** The sixteen half-yāmas of the day by a method, the one of the birth marked. */
function Parts({ result, label }: { result: VelaResult; label: string }) {
  const t = useT();
  return (
    <details className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400" data-vela-parts={result.method}>
      <summary className="cursor-pointer">{t('The 16 half-yāmas')} · {t(label)}</summary>
      <table className="mt-1 border-collapse text-left">
        <tbody>
          {result.parts.map(part => (
            <tr key={part.segment} className={part.segment === result.part.segment ? 'font-bold text-zinc-800 dark:text-zinc-100' : ''}>
              <td className="pr-2 tabular-nums">{part.segment}</td>
              <td className={`pr-2 ${GUNA_CLASS[part.guna]}`}>{part.guna}</td>
              <td className="pr-2 tabular-nums">{clock(part.start)} – {clock(part.end)}</td>
              <td>{part.segment === result.part.segment ? `◀ ${t('birth')}` : ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
