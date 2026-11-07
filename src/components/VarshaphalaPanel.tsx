'use client';

import { useState } from 'react';
import type { CalculationSettings, ChartData, ChartDisplaySettings, ChartStyle } from '@/types';
// Types only: the route does the ephemeris work.
import type { OfficeBearer, PanchaVargiyaBala } from '@/lib/varshaphala';
import type { DvadashavargiyaBala, HarshaBala } from '@/lib/tajikaBala';
import { formatDegree } from '@/lib/formatDegree';
import StyledChart from './StyledChart';
import {
  AnnualDashaList,
  AnnualPlaceControl,
  AnnualPlanetTable,
  Row,
  YearStepper,
  annualChartProps,
  buildAnnualParams,
  fmtLocal,
  fmtOffset,
  referenceJd,
  useAnnualFetch,
  type AnnualPlace,
  type LocalMahadasha,
  type LocalParts,
} from './annualShared';
import { SIGN_ABBR } from '@/lib/signs';
import VarshaPeriodPanel from './VarshaPeriodPanel';

import { fill, useLanguage, useT } from '@/lib/i18n';
import { ordinal } from '@/lib/ordinal';
type VpResponse = {
  year: number;
  local: LocalParts;
  tzOffset: number;
  completedAge: number;
  dayYear: boolean;
  natalAscSign: number;
  muntha: { sign: number; house: number };
  officeBearers: OfficeBearer[];
  yearLord: string;
  reason: string;
  bala: PanchaVargiyaBala[];
  dvadashavargiya: DvadashavargiyaBala[];
  harsha: HarshaBala[];
  dasha: LocalMahadasha[];
  patyamshi: LocalMahadasha[];
  next: { year: number; local: LocalParts; tzOffset: number };
  chart: ChartData;
};

type Props = {
  chart: ChartData;
  birthDatetime: string;
  targetDate?: string;
  ianaTimezone?: string;
  calculationSettings?: CalculationSettings;
  chartStyle: ChartStyle;
  chartDisplaySettings: ChartDisplaySettings;
  nakshatraAdjust?: number;
  place: AnnualPlace;
  onPlaceChange: (place: AnnualPlace) => void;
};

const ASPECT_LABEL: Record<string, string> = {
  conjunction: 'conjunct', sextile: 'sextile ✓', trine: 'trine ✓', square: 'square', opposition: 'opposition',
};

const fixed = (n: number) => n.toFixed(2);

export default function VarshaphalaPanel({
  chart,
  birthDatetime,
  targetDate,
  ianaTimezone,
  calculationSettings,
  chartStyle,
  chartDisplaySettings,
  nakshatraAdjust = 0,
  place,
  onPlaceChange,
}: Props) {
  const t = useT();
  const language = useLanguage();
  // The server sends the reason in English; the count is the only variable part.
  const reasonText = (reason: string) => {
    const count = /of the (\d+) office bearers/.exec(reason)?.[1];
    return count
      ? fill(t('Strongest by Pañcavargīya Bala of the {count} office bearers aspecting the annual lagna.'), { count })
      : t(reason);
  };
  const [year, setYear] = useState<number | null>(null);
  const [showNatal, setShowNatal] = useState(false);

  const query = buildAnnualParams({ chart, birthDatetime, ianaTimezone, calculationSettings, place, year, targetDate });
  const { data: shown, error, loading } = useAnnualFetch<VpResponse>('/api/varshaphala', query);

  if (!query) {
    return <div className="text-xs font-mono text-zinc-400 dark:text-zinc-600">{t('Birth date and place are needed for Varṣaphala.')}</div>;
  }

  return (
    <div className="space-y-3 min-w-0">
      <div>
        <div className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">{t('Varṣaphala — Tājika annual chart')}</div>
        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mt-1">
          {t('Cast for the moment the Sun returns to its natal sidereal longitude. Muntha moves one sign a year from the natal lagna; the lord of the year is chosen from the five office bearers. Rules after P.V.R. Narasimha Rao, chapters 28–30.')}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <YearStepper shownYear={shown?.year} year={year} onChange={setYear} />
        <label className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          <input type="checkbox" checked={showNatal} onChange={(e) => setShowNatal(e.target.checked)} />
          {t('natal overlay')}
        </label>
        {loading && <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">{t('calculating…')}</span>}
      </div>

      <AnnualPlaceControl place={place} onChange={onPlaceChange} />

      {error && <div className="text-xs font-mono text-red-600 dark:text-red-400">{error}</div>}

      {shown && (
        <div className={`space-y-3 ${loading ? 'opacity-60' : ''}`}>
          <StyledChart style={chartStyle} {...annualChartProps(shown.chart, chart, showNatal, chartDisplaySettings, nakshatraAdjust)} />

          <div className="space-y-2">
            <Row label={t('begins')} value={`${fmtLocal(shown.local)} (${fmtOffset(shown.tzOffset)}) · ${shown.dayYear ? t('day') : t('night')}`} />
            <Row label={t('ends')} value={`${fmtLocal(shown.next.local)} (${fmtOffset(shown.next.tzOffset)})`} />
            <Row label={t('year')} value={fill(t('{age} completed · {ordinal} year running'), { age: shown.completedAge, ordinal: ordinal(shown.completedAge + 1, language) })} />
            <Row label="lagna" value={`${SIGN_ABBR[shown.chart.ascendant.sign - 1]} ${formatDegree(shown.chart.ascendant.degree, 'minute')}`} />
            <Row label="muntha" value={`${SIGN_ABBR[shown.muntha.sign - 1]} · ${fill(t('house {house} of the annual chart'), { house: shown.muntha.house })}`} />
            <Row label={t('year lord')} value={`${shown.yearLord} — ${reasonText(shown.reason)}`} />
          </div>

          <div className="overflow-x-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">{t('Pañcādhikārī — office bearers')}</div>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  <th className="py-1 pr-3 font-normal">graha</th>
                  <th className="py-1 pr-3 font-normal">{t('office')}</th>
                  <th className="py-1 pr-3 font-normal">{t('on lagna')}</th>
                  <th className="py-1 font-normal">bala</th>
                </tr>
              </thead>
              <tbody className="text-zinc-700 dark:text-zinc-300">
                {shown.officeBearers.map((o) => (
                  <tr key={o.planet} className={`border-t border-zinc-100 dark:border-zinc-800 ${o.planet === shown.yearLord ? 'text-emerald-700 dark:text-green-400 font-semibold' : ''}`}>
                    <td className="py-1 pr-3">{o.planet}</td>
                    <td className="py-1 pr-3">{o.roles.join(', ')}</td>
                    <td className="py-1 pr-3">{o.aspectOnLagna ? t(ASPECT_LABEL[o.aspectOnLagna]) : '—'}</td>
                    <td className="py-1 tabular-nums">{fixed(o.bala)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">Pañcavargīya Bala</div>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  <th className="py-1 pr-2 font-normal">graha</th>
                  <th className="py-1 pr-2 font-normal">kṣetra</th>
                  <th className="py-1 pr-2 font-normal">uccha</th>
                  <th className="py-1 pr-2 font-normal">hadda</th>
                  <th className="py-1 pr-2 font-normal">D3</th>
                  <th className="py-1 pr-2 font-normal">D9</th>
                  <th className="py-1 font-normal">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-zinc-700 dark:text-zinc-300">
                {shown.bala.map((b) => (
                  <tr key={b.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1 pr-2">{b.planet}</td>
                    <td className="py-1 pr-2">{fixed(b.kshetra)}</td>
                    <td className="py-1 pr-2">{fixed(b.uchcha)}</td>
                    <td className="py-1 pr-2">{fixed(b.hadda)}</td>
                    <td className="py-1 pr-2">{fixed(b.drekkana)}</td>
                    <td className="py-1 pr-2">{fixed(b.navamsa)}</td>
                    <td className="py-1 font-semibold">{fixed(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto" data-tajika="dvadashavargiya">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">Dvādaśavargīya Bala</div>
            <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
              {t('The ruler of each of the twelve divisions the graha stands in (domicile, hora, decan, fourth, fifth, sixth, seventh, eighth, ninth, tenth, eleventh and twelfth part), good (+) when it is the graha itself, a friend, a benefic or the graha is exalted there, evil (−) when it is an enemy, a malefic or the graha is fallen there. The total is the good divisions less the evil ones.')}
            </p>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  <th className="py-1 pr-2 font-normal">graha</th>
                  {['D1', 'Hora', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'].map((label) => <th key={label} className="py-1 pr-1 font-normal">{label}</th>)}
                  <th className="py-1 pr-2 font-normal">+</th>
                  <th className="py-1 pr-2 font-normal">−</th>
                  <th className="py-1 font-normal">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-zinc-700 dark:text-zinc-300">
                {shown.dvadashavargiya.map((row) => (
                  <tr key={row.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1 pr-2">{row.planet}</td>
                    {row.divisions.map((division) => (
                      <td
                        key={division.key}
                        title={[...division.good.map((reason) => `+ ${reason}`), ...division.evil.map((reason) => `− ${reason}`)].join(', ') || '—'}
                        className={`py-1 pr-1 ${division.good.length && !division.evil.length ? 'text-emerald-700 dark:text-green-400' : division.evil.length && !division.good.length ? 'text-red-600 dark:text-red-400' : ''}`}
                      >
                        {division.ruler.slice(0, 2)}
                      </td>
                    ))}
                    <td className="py-1 pr-2">{row.good}</td>
                    <td className="py-1 pr-2">{row.evil}</td>
                    <td className="py-1 font-semibold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto" data-tajika="harsha">
            <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600 mb-1">Harṣa Bala</div>
            <p className="mb-1 text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
              {t('Five points for each of four places of joy: the house of joy of the graha (Sun 9th, Moon 3rd, Mars 6th, Mercury 1st, Jupiter 11th, Venus 5th, Saturn 12th), its own sign or exaltation, the houses by threes from the lagna (the female grahas in 1–3 and 7–9, the male in 4–6 and 10–12) and the day for a male graha or the night for a female one. At most 20.')}
            </p>
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                  <th className="py-1 pr-2 font-normal">graha</th>
                  <th className="py-1 pr-2 font-normal">{t('house')}</th>
                  <th className="py-1 pr-2 font-normal">{t('own / exalted')}</th>
                  <th className="py-1 pr-2 font-normal">{t('threes')}</th>
                  <th className="py-1 pr-2 font-normal">{t('day / night')}</th>
                  <th className="py-1 font-normal">{t('total')}</th>
                </tr>
              </thead>
              <tbody className="tabular-nums text-zinc-700 dark:text-zinc-300">
                {shown.harsha.map((row) => (
                  <tr key={row.planet} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="py-1 pr-2">{row.planet}</td>
                    <td className="py-1 pr-2">{row.sthana}</td>
                    <td className="py-1 pr-2">{row.svagriha}</td>
                    <td className="py-1 pr-2">{row.trika}</td>
                    <td className="py-1 pr-2">{row.dinaRatri}</td>
                    <td className="py-1 font-semibold">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AnnualDashaList
            title={t('Pātyāṁśī daśā')}
            note={t('The daśā of the Tājika Nīlakaṇṭhī itself (Varṣatantra, verses 1–3): the Lagna and the grahas by their degrees in their signs, from the smallest; each takes the part of the year that its degrees less those of the one before it are of the greatest degrees. The running period at the target date is highlighted.')}
            dasha={shown.patyamshi}
            referenceJd={referenceJd(targetDate, shown.tzOffset)}
          />

          <AnnualDashaList
            title="Mudda daśā (Varṣa Vimśottarī)"
            note={t('Vimśottarī compressed into this year, entered from the natal nakṣatra advanced one lord per completed year (a daśā of the commentary of Mahīdhara, not of Nīlakaṇṭha). The running period at the target date is highlighted.')}
            dasha={shown.dasha}
            referenceJd={referenceJd(targetDate, shown.tzOffset)}
          />

          <AnnualPlanetTable annual={shown.chart} natal={chart} showOuterPlanets={chartDisplaySettings.showOuterPlanets} />

          <VarshaPeriodPanel
            chart={chart}
            birthDatetime={birthDatetime}
            targetDate={targetDate}
            ianaTimezone={ianaTimezone}
            calculationSettings={calculationSettings}
            chartStyle={chartStyle}
            chartDisplaySettings={chartDisplaySettings}
            nakshatraAdjust={nakshatraAdjust}
            place={place}
            onPlaceChange={onPlaceChange}
            year={shown.year}
          />
        </div>
      )}
    </div>
  );
}
