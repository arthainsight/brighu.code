'use client';

import { useMemo, useState } from 'react';
import type { ChartData } from '@/types';
import { AVATARA_NOTES, avataraOfHour, clockText, horaLagnas, separation, type HoraLagnaPoint } from '@/lib/horaLagna';
import { formatDms, nakshatraAndPada } from '@/lib/specialSphutas';
import { SIGN_ABBR, SIGN_LORDS, SIGN_NAMES } from '@/lib/signs';
import { fill, useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

// Surya Hora Lagna and Lagna Hora Lagna, and the avatāra of the birth hour (horaLagna.ts): after a lesson, not a rule of BPHS; the page says so.

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;

type DayStart = 'clock' | 'sunrise';

export default function SuryaHoraLagnaPanel({ chart, nakshatraAdjust = 0 }: { chart: ChartData; nakshatraAdjust?: number }) {
  const t = useT();
  const { name: graha } = useGrahaNames();
  const [dayStart, setDayStart] = useState<DayStart>('clock');
  const timing = chart.specialSphutaTiming;
  const sun = chart.planets.find(planet => planet.name === 'Sun');

  const result = useMemo(
    () => (timing && sun ? horaLagnas(sun.longitude, chart.ascendant.longitude, timing.ishta / 2.5) : null),
    [chart, timing, sun],
  );
  if (!timing || !sun || !result) return <p className="text-[10px] font-mono text-zinc-400">{t('This chart has no sunrise to count from; calculate it again.')}</p>;

  const birthClock = timing.sunriseUsed + timing.ishta / 2.5;
  const avatara = avataraOfHour(birthClock, dayStart === 'clock' ? 6 : timing.sunriseUsed);
  const houseOf = (sign: number) => ((sign - chart.ascendant.sign + 12) % 12) + 1;
  const chip = (on: boolean) => `rounded-md border px-2.5 py-1.5 text-[10px] font-mono sm:px-2 sm:py-1 ${on ? 'border-emerald-500 bg-emerald-500 text-white dark:border-green-600 dark:bg-green-600' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700 dark:text-zinc-400'}`;

  const rows: { key: 'surya' | 'lagna'; point: HoraLagnaPoint; title: string; deity: string; wealth: string; lasts: string }[] = [
    { key: 'surya', point: result.surya, title: 'Surya HL (from the Sun)', deity: 'Kubera', wealth: 'Physical, material money: cash, cars, property.', lasts: 'Temporary: it ends with the life (sunset).' },
    { key: 'lagna', point: result.lagna, title: 'Lagna HL (from the Lagna)', deity: 'Ganesha & Shiva', wealth: 'Intellectual capital: deep knowledge, the occult, insight.', lasts: 'Lasting: it outlives death and passes to later lives when digested.' },
  ];

  return (
    <div className="min-w-0 space-y-4" data-hora-lagna="panel">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Surya Hora Lagna')}</div>
        <p className="mt-1 text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('The Hora Lagna counted from two starting points, each moved by the time from sunrise to birth at 30° an hour: from the Sun (the material wealth, Kubera) and from the Lagna (the intellectual wealth, Ganesha and Shiva). In a savya sign (Aries, Taurus, Gemini, Libra, Scorpio, Sagittarius) the arc is added, in an apasavya sign (Cancer, Leo, Virgo, Capricorn, Aquarius, Pisces) it is taken away. After a lesson, not a rule of BPHS (docs/hora-lagna.md); where the two meet, Ganesha wins: the intellectual wealth is the one that lasts.')}
        </p>
      </div>

      <div className="font-mono text-xs text-zinc-700 dark:text-zinc-200" data-hora-lagna-hours={result.hours.toFixed(4)}>
        {fill(t('Sunrise {sunrise}, birth {birth}: {hours} h from sunrise, an arc of {arc}°.'), {
          sunrise: clockText(timing.sunriseUsed), birth: clockText(birthClock), hours: result.hours.toFixed(3), arc: (result.hours * 30).toFixed(1),
        })}
        {timing.sunriseFallback && <span className="text-amber-700 dark:text-amber-400"> · {t('The Sun does not rise here on this day; 06:00 stands in for sunrise.')}</span>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-hora-lagna-table>
          <thead>
            <tr>
              <th scope="col" className={`text-left ${HEAD}`}>{t('Point')}</th>
              <th scope="col" className={HEAD}>{t('Starts from')}</th>
              <th scope="col" className={HEAD}>{t('Direction')}</th>
              <th scope="col" className={HEAD}>{t('Sign')}</th>
              <th scope="col" className={HEAD}>{t('Degree')}</th>
              <th scope="col" className={HEAD}>{t('House')}</th>
              <th scope="col" className={`text-left ${HEAD}`}>{t('Nakshatra')}</th>
              <th scope="col" className={HEAD}>{t('Lord')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, point, title, deity }) => {
              const nak = nakshatraAndPada(point.longitude, nakshatraAdjust);
              return (
                <tr key={key} className="text-zinc-700 dark:text-zinc-200" data-hora-lagna-row={key} data-hora-lagna-sign={point.sign} data-hora-lagna-longitude={point.longitude.toFixed(4)}>
                  <th scope="row" className={`text-left font-semibold ${CELL}`}>{t(title)} <span className="font-normal text-zinc-400">· {deity}</span></th>
                  <td className={CELL}>{SIGN_ABBR[point.startSign - 1]} {formatDms(point.startLongitude % 30)}</td>
                  <td className={CELL}>{point.direction === 'savya' ? `+ ${t('savya')}` : `− ${t('apasavya')}`}</td>
                  <td className={`${CELL} font-bold`}>{SIGN_ABBR[point.sign - 1]} · {t(SIGN_NAMES[point.sign - 1])}</td>
                  <td className={`${CELL} tabular-nums`}>{formatDms(point.degree)}</td>
                  <td className={`${CELL} tabular-nums`}>{houseOf(point.sign)}</td>
                  <td className={`text-left ${CELL}`}>{nak.nakshatra} {nak.pada}</td>
                  <td className={CELL}>{graha(SIGN_LORDS[point.sign - 1])}</td>
                </tr>
              );
            })}
            <tr className="text-zinc-500 dark:text-zinc-400" data-hora-lagna-row="standard" data-hora-lagna-sign={result.standard.sign}>
              <th scope="row" className={`text-left font-normal ${CELL}`}>{t('Standard Parashara HL (Sun + 30° an hour)')}</th>
              <td className={CELL}>{SIGN_ABBR[sun.sign - 1]} {formatDms(sun.degree)}</td>
              <td className={CELL}>+</td>
              <td className={CELL}>{SIGN_ABBR[result.standard.sign - 1]} · {t(SIGN_NAMES[result.standard.sign - 1])}</td>
              <td className={`${CELL} tabular-nums`}>{formatDms(result.standard.degree)}</td>
              <td className={`${CELL} tabular-nums`}>{houseOf(result.standard.sign)}</td>
              <td className={`text-left ${CELL}`}>{(() => { const nak = nakshatraAndPada(result.standard.longitude, nakshatraAdjust); return `${nak.nakshatra} ${nak.pada}`; })()}</td>
              <td className={CELL}>{graha(SIGN_LORDS[result.standard.sign - 1])}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500" data-hora-lagna-standard={result.suryaIsStandard ? 'same' : 'differs'}>
        {result.suryaIsStandard
          ? t('The Sun is in a savya sign, so the Surya HL is the standard Parashara Hora Lagna.')
          : fill(t('The Sun is in an apasavya sign, so the Surya HL goes backwards and lies {gap}° from the standard Hora Lagna.'), { gap: separation(result.surya.longitude, result.standard.longitude).toFixed(1) })}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {rows.map(({ key, title, deity, wealth, lasts }) => (
          <div key={key} className="rounded-md border border-zinc-200 p-3 font-mono text-[11px] text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            <div className="font-semibold text-zinc-700 dark:text-zinc-200">{t(title)} · {deity}</div>
            <div className="mt-1">{t(wealth)}</div>
            <div className="mt-1 text-zinc-400 dark:text-zinc-500">{t(lasts)}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2" data-hora-lagna-avatara={avatara.avatar}>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Protector of the birth hour')}</div>
        <div className="flex flex-wrap gap-1" role="group" aria-label={t('The day starts')}>
          <button type="button" aria-pressed={dayStart === 'clock'} onClick={() => setDayStart('clock')} className={chip(dayStart === 'clock')}>{t('06:00 (the lesson’s table)')}</button>
          <button type="button" aria-pressed={dayStart === 'sunrise'} onClick={() => setDayStart('sunrise')} className={chip(dayStart === 'sunrise')}>{t('The sunrise')} {clockText(timing.sunriseUsed)}</button>
        </div>
        <div className="font-mono text-xs text-zinc-700 dark:text-zinc-200">
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{avatara.avatar}</span>
          {' · '}{t(SIGN_NAMES[avatara.sign - 1])}{' · '}{fill(t('birth {birth}, in the hour {from}–{to}, with {companion}'), { birth: clockText(birthClock), from: clockText(avatara.window[0]), to: clockText(avatara.window[1]), companion: avatara.companion })}
        </div>
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{t(avatara.pair.role)}</p>
        {AVATARA_NOTES[avatara.avatar] && <p className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300">{t(AVATARA_NOTES[avatara.avatar])}</p>}
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('The 24 avatars of the Garuda Purana guard the hours of the day, two to a sign of two hours; the first named of a pair has the first hour. The lesson gives Parasurama once as 09:00–10:00 and once under Scorpio (20:00–22:00); the table is followed here.')}
        </p>
      </div>
    </div>
  );
}
