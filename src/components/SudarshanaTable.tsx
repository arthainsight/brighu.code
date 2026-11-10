'use client';

import { useState } from 'react';
import type { ChartData } from '@/types';
import { NINE_GRAHAS, auspiciousness, computedGoodCounts, sudarshanaTable, type GoodCountRule, type LordState } from '@/lib/sudarshanaTable';
import { jhoraWeakGrahas, sayanadiStates } from '@/lib/vaisheshikamsa';
import { SIGN_ABBR } from '@/lib/signs';
import { useGrahaNames } from '@/lib/grahaNames';
import { useT } from '@/lib/i18n';

const STATE_LETTER: Record<LordState, string> = { exalted: 'E', moolatrikona: 'M', own: 'O', friendly: 'F', neutral: 'N', hostile: 'D' };
const STATE_LABEL: Record<LordState, string> = {
  exalted: 'exalted', moolatrikona: 'moolatrikona', own: 'own sign', friendly: 'friendly sign', neutral: 'neutral sign', hostile: 'enemy or debilitated',
};

const percent = (value: number) => (Math.round(value * 100) / 100).toFixed(2);

/**
 * The worksheet of the Sudarśana Chakra, one row per house number: the grahas in the three signs of the house, the average auspiciousness of them (V-AMSHA), the three lords and their
 * strength, the grahas that aspect the house, the Sarvāṣṭakavarga. The good counts of the grahas in the six divisional charts are the app's own Vaiśeṣikāṁśa count (BPHS 6.52); a count
 * typed in, as from Jagannatha Hora's Shadvarga view, takes its place.
 */
export default function SudarshanaTable({ chart, birthDatetime = '' }: { chart: ChartData; birthDatetime?: string }) {
  const t = useT();
  const { code } = useGrahaNames();
  const [typed, setGood] = useState<Record<string, number>>({});
  const [rule, setRule] = useState<GoodCountRule>('bphs');
  const computed = computedGoodCounts(chart, rule, rule === 'jhora' ? jhoraWeakGrahas(sayanadiStates(chart, birthDatetime)) : []);
  const good: Record<string, number | undefined> = { ...computed, ...typed };
  const rows = sudarshanaTable(chart, good);
  if (rows.length === 0) return null;
  const setCount = (name: string, raw: string) => setGood(current => {
    const next = { ...current };
    if (raw === '') delete next[name]; else next[name] = Number(raw);
    return next;
  });

  return (
    <div className="space-y-2" data-sud="table">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('The twelve houses of the Sudarshana chakra')}</div>
      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
        {t('A worksheet from a video on the Sudarshana chakra, not a rule of BPHS: for each house number, the grahas standing in its three signs, how strong the lords of the three signs are, the grahas that aspect it and the Sarvashtakavarga of the sign.')}
      </p>

      <div className="space-y-1" data-sud="good-counts">
        <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">{t('Good in the six divisional charts (0 to 6), for the V-AMSHA (Vaiśeṣikāṁśa) column. The first count is what BPHS 6.52 says for certain: the vargas in which the graha is in its exaltation or own sign; the nodes have no such sign and are left out of the average. The second is the count of Jagannatha Hora, which the worksheet copies: one reading of the unclear half of the verse, a kendra from the lord of the Āruḍha Lagna in the varga (ANALYSIS → Bala → Vaiśeṣikāṁśa explains it). A number typed in a box takes the place of the count; an empty box brings it back.')}</div>
        <label className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
          {t('counted')}
          <select value={rule} data-sud="good-rule" onChange={event => setRule(event.target.value as GoodCountRule)} className="rounded border border-zinc-300 bg-white px-1 py-0.5 dark:border-zinc-700 dark:bg-zinc-900">
            <option value="bphs">{t('BPHS 6.52: exaltation or own sign')}</option>
            <option value="jhora">{t('as Jagannatha Hora (the worksheet)')}</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {NINE_GRAHAS.map(name => (
            <label key={name} className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-600 dark:text-zinc-300">
              {code(name)}
              <input
                type="number" min={0} max={6} step={1} inputMode="numeric" value={typed[name] ?? ''} placeholder={typeof computed[name] === 'number' ? String(computed[name]) : '–'} data-sud-good={name}
                aria-label={`${name}: ${t('good in the six divisional charts')}`}
                onChange={event => setCount(name, event.target.value === '' ? '' : String(Math.min(6, Math.max(0, Math.round(Number(event.target.value))))))}
                className="w-10 rounded border border-zinc-300 bg-white px-1 py-0.5 text-center dark:border-zinc-700 dark:bg-zinc-900"
              />
              {typeof good[name] === 'number' && <span className="text-zinc-400 dark:text-zinc-500">{percent(auspiciousness(good[name]!))}%</span>}
            </label>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[11px] font-mono" data-sud="table-rows">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
              <th className="py-1 pr-3 font-normal">{t('house')}</th>
              <th className="py-1 pr-3 font-normal">{t('in the signs')}</th>
              <th className="py-1 pr-3 font-normal">V-AMSHA %</th>
              <th className="py-1 pr-3 font-normal">{t('lords of the three signs')}</th>
              <th className="py-1 pr-3 font-normal">{t('strength')} %</th>
              <th className="py-1 pr-3 font-normal">{t('aspects')}</th>
              <th className="py-1 font-normal">SAV</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.house} data-sud-table-row={row.house} className="border-t border-zinc-100 align-top dark:border-zinc-800">
                <td className="py-1 pr-3 font-bold">{row.house}</td>
                <td className="py-1 pr-3" data-sud-col="placement">
                  {row.occupants.length === 0 ? '—' : row.occupants.map((item, index) => (
                    <span key={index} className={item.benefic ? 'text-emerald-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>{index > 0 ? ' ' : ''}{code(item.name)}</span>
                  ))}
                </td>
                <td className="py-1 pr-3 tabular-nums" data-sud-col="vamsha">{row.vamsha === null ? '…' : percent(row.vamsha)}</td>
                <td className="py-1 pr-3 whitespace-nowrap" data-sud-col="lords">
                  {row.dispositors.map(item => (
                    <span key={item.ring} title={`${SIGN_ABBR[item.sign - 1]}: ${t(STATE_LABEL[item.state])} (${item.points})`} className="mr-1">{code(item.lord)}:{STATE_LETTER[item.state]}</span>
                  ))}
                  <span className="text-zinc-400 dark:text-zinc-500 tabular-nums">= {row.lordPoints}</span>
                </td>
                <td className="py-1 pr-3 tabular-nums" data-sud-col="strength">{percent(row.strength)}</td>
                <td className="py-1 pr-3" data-sud-col="aspects">
                  {row.aspects.benefic.length === 0 && row.aspects.malefic.length === 0 ? '—' : (
                    <>
                      {row.aspects.benefic.length > 0 && <span className="text-emerald-700 dark:text-green-400">B {row.aspects.benefic.map(name => code(name)).join(' ')}</span>}
                      {row.aspects.malefic.length > 0 && <span className="ml-1 text-red-600 dark:text-red-400">M {row.aspects.malefic.map(name => code(name)).join(' ')}</span>}
                    </>
                  )}
                </td>
                <td className="py-1 tabular-nums" data-sud-col="sav">{row.sav}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">
        {t('Strength: the lord of each of the three signs of the house by its own state (E exalted 1, M moolatrikona 0.75, O own sign 0.5, F friendly sign 0.25, N neutral 0.125, D enemy or debilitated 0), the sum over three. The friends are the natural ones. V-AMSHA: the average of the good counts, over six, of the grahas in the house; 50 for a house with none. B and M: Moon, Mercury, Jupiter and Venus are benefic, the others malefic. The aspects are Parashara’s. SAV is the Sarvashtakavarga of the sign counted from the Lagna. The worksheet’s Remarks (good, average, bad) are the author’s own judgment and are not computed.')}
      </p>
    </div>
  );
}
