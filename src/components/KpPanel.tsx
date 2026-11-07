'use client';

import { useMemo } from 'react';
import type { ChartData } from '@/types';
import { bhavaOf, bhavasFromCusps } from '@/lib/bhavaChalit';
import { kpLords } from '@/lib/kp';
import { SIGN_ABBR } from '@/lib/signs';
import { useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

const GRAHAS = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const KRISHNAMURTI_TOLERANCE = 1 / 3600;

/** A longitude as "Cn 10°05′20″". */
function point(longitude: number): string {
  const inSign = longitude % 30;
  const degrees = Math.floor(inSign);
  const minutes = Math.floor((inSign - degrees) * 60);
  const seconds = Math.floor(((inSign - degrees) * 60 - minutes) * 60);
  return `${SIGN_ABBR[Math.floor(longitude / 30)]} ${degrees}°${String(minutes).padStart(2, '0')}′${String(seconds).padStart(2, '0')}″`;
}

/**
 * Krishnamurti Paddhati: the twelve Placidus cusps, each with the lords of its sign, star, sub and sub-sub, and the grahas with
 * theirs and the house the cusps put them in.
 */
export default function KpPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const { name: grahaName } = useGrahaNames();
  const cusps = chart.houseCusps?.placidus;
  const bhavas = useMemo(() => (cusps ? bhavasFromCusps(cusps) : null), [cusps]);
  const cell = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
  const krishnamurti = chart.debug?.ayanamsas?.krishnamurti;
  const otherAyanamsa = krishnamurti !== undefined && chart.debug && Math.abs(chart.debug.ayanamsa - krishnamurti) > KRISHNAMURTI_TOLERANCE;
  const header = (
    <tr className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
      <th className={cell}>{t('Cusp')}</th>
      <th className={cell}>{t('Longitude')}</th>
      <th className={cell}>{t('Sign lord')}</th>
      <th className={cell}>{t('Star lord')}</th>
      <th className={cell}>{t('Sub lord')}</th>
      <th className={cell}>{t('Sub-sub lord')}</th>
    </tr>
  );

  return (
    <div className="min-w-0 space-y-4">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('KP · Krishnamurti Paddhati')}</div>
        <p className="mt-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('The Placidus cusps, each with the lords of its sign, star, sub and sub-sub (the nakshatra shared among the nine lords in Vimshottari proportion). A graha stands in the house whose cusp it has passed.')}
        </p>
        {otherAyanamsa && (
          <p className="mt-1 text-[10px] font-mono text-amber-600 dark:text-amber-400" data-kp="ayanamsa">
            {t('KP reads the Krishnamurti ayanamsa; this chart uses another one (Settings), so the cusps and the sub lords are not those of a KP table.')}
          </p>
        )}
      </div>

      {!cusps || !bhavas ? (
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">{t('This system has no cusps for this chart: it is not defined beyond the polar circles, or the chart was calculated before the cusps were kept; calculate it again.')}</p>
      ) : (
        <>
          <table className="w-full min-w-[520px] border-collapse text-center font-mono text-xs" data-kp="cusps">
            <thead>{header}</thead>
            <tbody>
              {cusps.map((cusp, index) => {
                const lords = kpLords(cusp);
                return (
                  <tr key={index} data-cusp={index + 1} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`${cell} font-semibold`}>{index + 1}</th>
                    <td className={cell}>{point(cusp)}</td>
                    <td className={cell}>{grahaName(lords.signLord)}</td>
                    <td className={cell}>{grahaName(lords.starLord)}</td>
                    <td className={`${cell} font-semibold`}>{grahaName(lords.subLord)}</td>
                    <td className={cell}>{grahaName(lords.subSubLord)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <table className="w-full min-w-[560px] border-collapse text-center font-mono text-xs" data-kp="grahas">
            <thead>
              <tr className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"><th className={cell}>{t('Graha')}</th><th className={cell}>{t('Longitude')}</th><th className={cell}>{t('Sign lord')}</th><th className={cell}>{t('Star lord')}</th><th className={cell}>{t('Sub lord')}</th><th className={cell}>{t('Sub-sub lord')}</th><th className={cell}>{t('House')}</th></tr>
            </thead>
            <tbody>
              {chart.planets.filter(planet => GRAHAS.includes(planet.name)).map(planet => {
                const lords = kpLords(planet.longitude);
                return (
                  <tr key={planet.name} data-graha={planet.name} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`${cell} text-left font-semibold`}>{grahaName(planet.name)}</th>
                    <td className={cell}>{point(planet.longitude)}</td>
                    <td className={cell}>{grahaName(lords.signLord)}</td>
                    <td className={cell}>{grahaName(lords.starLord)}</td>
                    <td className={`${cell} font-semibold`}>{grahaName(lords.subLord)}</td>
                    <td className={cell}>{grahaName(lords.subSubLord)}</td>
                    <td className={cell}>{bhavaOf(planet.longitude, bhavas)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
