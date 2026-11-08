'use client';

import type { ChartData } from '@/types';
import { SIGN_ABBR } from '@/lib/signs';
import { compassPoint, rightAscensionText, signedAngleText } from '@/lib/planetaryDataFormat';
import { useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

/** A longitude as "Cn 10°05′20″". */
function point(longitude: number): string {
  const inSign = longitude % 30;
  const degrees = Math.floor(inSign);
  const minutes = Math.floor((inSign - degrees) * 60);
  const seconds = Math.floor(((inSign - degrees) * 60 - minutes) * 60);
  return `${SIGN_ABBR[Math.floor(longitude / 30)]} ${degrees}°${String(minutes).padStart(2, '0')}′${String(seconds).padStart(2, '0')}″`;
}

/** The planetary data: where each body stands in the sky at the moment and the place of the chart. */
export default function PlanetaryDataPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const { name: grahaName } = useGrahaNames();
  const cell = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
  const planets = chart.planets;
  const missing = planets.every(planet => !planet.data);

  return (
    <div className="min-w-0 space-y-3">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Planetary data')}</div>
        <p className="mt-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('Right ascension and declination of the date, the ecliptic latitude, the distance from the Earth, and the azimuth (from the north through the east) and altitude (no refraction) at the place of the chart. The elongation is the angle from the Sun; the magnitude is smaller the brighter the body is, and the disc is its apparent diameter. The nodes are points on the ecliptic.')}
        </p>
      </div>
      {missing ? (
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-600">{t('This chart was calculated before the planetary data were kept; calculate it again.')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] border-collapse text-center font-mono text-xs" data-planetary="table">
            <thead>
              <tr className="bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                <th className={cell}>{t('Graha')}</th>
                <th className={cell}>{t('Longitude')}</th>
                <th className={cell}>{t('Right ascension')}</th>
                <th className={cell}>{t('Declination')}</th>
                <th className={cell}>{t('Latitude')}</th>
                <th className={cell}>{t('Distance (AU)')}</th>
                <th className={cell}>{t('Azimuth')}</th>
                <th className={cell}>{t('Altitude')}</th>
                <th className={cell}>{t('Elongation')}</th>
                <th className={cell}>{t('Magnitude')}</th>
                <th className={cell}>{t('Disc (″)')}</th>
                <th className={cell}>{t('Speed (°/day)')}</th>
              </tr>
            </thead>
            <tbody>
              {planets.map(planet => {
                const data = planet.data;
                return (
                  <tr key={planet.name} data-graha={planet.name} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`${cell} text-left font-semibold`}>{grahaName(planet.name)}{planet.isRetrograde ? ' ℞' : ''}</th>
                    <td className={cell}>{point(planet.longitude)}</td>
                    <td className={cell}>{data ? rightAscensionText(data.rightAscension) : '—'}</td>
                    <td className={cell}>{data ? signedAngleText(data.declination) : '—'}</td>
                    <td className={cell}>{data ? signedAngleText(data.eclipticLatitude) : '—'}</td>
                    <td className={cell}>{data?.distance !== undefined ? data.distance.toFixed(5) : '—'}</td>
                    <td className={cell}>{data ? `${data.azimuth.toFixed(2)}° ${compassPoint(data.azimuth)}` : '—'}</td>
                    <td className={`${cell} ${data && data.altitude < 0 ? 'text-zinc-400 dark:text-zinc-500' : ''}`}>{data ? signedAngleText(data.altitude) : '—'}</td>
                    <td className={cell}>{data?.elongation !== undefined ? `${data.elongation.toFixed(2)}°` : '—'}</td>
                    <td className={cell}>{data?.magnitude !== undefined ? data.magnitude.toFixed(2) : '—'}</td>
                    <td className={cell}>{data?.diameter !== undefined ? data.diameter.toFixed(2) : '—'}</td>
                    <td className={cell}>{planet.speed !== undefined ? planet.speed.toFixed(4) : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
