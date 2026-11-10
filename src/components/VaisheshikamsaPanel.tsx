'use client';

import { useState } from 'react';
import type { ChartData } from '@/types';
import type { BalaOptions } from '@/lib/balaOptions';
import { VIMSOPAKA_SCHEMES, type SchemeKey } from '@/lib/vargaMatrix';
import {
  BHEDAKADI, KIMSHUKADI, PARIJATADI, VAISHESHIKA_SCHEMES, VAISHESHIKA_VERSES, calculateVaisheshikamsa, schemeVargas,
  type VaisheshikaCell, type VaisheshikaName, type VaisheshikaReading, type VaisheshikaSpoiler,
} from '@/lib/vaisheshikamsa';
import { SIGN_NAMES } from '@/lib/signs';
import { useT } from '@/lib/i18n';
import { BODY_CELL, Heading, NAME_CELL, ROW, ScrollTable, VALUE_CELL } from './balaShared';

const READINGS: { key: VaisheshikaReading; label: string }[] = [
  { key: 'own', label: 'Exaltation, mūlatrikoṇa and own sign' },
  { key: 'full', label: 'Also the lords of the kendras from the Āruḍha' },
];
const SPOILER_TEXT: Record<VaisheshikaSpoiler, string> = { combust: 'combust', defeated: 'defeated in a war', debilitated: 'debilitated', weak: 'Ṣaḍbala under the required' };
const NAME_TABLES: { command: string; title: string; names: readonly VaisheshikaName[] }[] = [
  { command: 'vaisheshikamsa.names.kimshukadi', title: 'Ṣaḍvarga and Saptavarga (6.43–44); Mukuṭa is of the Saptavarga only.', names: KIMSHUKADI },
  { command: 'vaisheshikamsa.names.parijatadi', title: 'Daśavarga (6.45–47).', names: PARIJATADI },
  { command: 'vaisheshikamsa.names.bhedakadi', title: 'Ṣoḍaśavarga (6.48–51).', names: BHEDAKADI },
];
const ALL_VARGAS = schemeVargas('shodasavarga');
const GOOD_CELL = 'bg-emerald-50 dark:bg-emerald-950/35 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/70';
const PLAIN_CELL = 'text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800';

/** E: the exaltation sign; O: an own sign; K: a sign of a lord of a kendra from the Āruḍha. */
const cellMark = (cell: VaisheshikaCell) => (cell.dignity === 'exalted' ? 'E' : cell.dignity === 'own' ? 'O' : cell.kendraLord ? 'K' : '');

/**
 * The names of the good vargas of the grahas (BPHS 6.42-53, the Vaiśeṣikāṁśas): for the chart, how many good vargas each
 * graha has in the four schemes and what the count is called; the vargas one by one; and the tables of the names and the
 * verses in Sanskrit.
 */
export default function VaisheshikamsaPanel({ chart, options }: { chart: ChartData; options?: BalaOptions }) {
  const t = useT();
  const [reading, setReading] = useState<VaisheshikaReading>('own');
  const result = calculateVaisheshikamsa(chart, reading, options);

  return (
    <div className="min-w-0 space-y-5" data-testid="vaisheshikamsa">
      <div className="space-y-2">
        <div className="inline-flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50" role="group" aria-label={t('The good vargas of 6.52')}>
          {READINGS.map(item => (
            <button
              key={item.key}
              type="button"
              aria-pressed={reading === item.key}
              onClick={() => setReading(item.key)}
              className={`rounded-md px-2.5 py-1 text-[10px] font-mono ${reading === item.key ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-700 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}`}
            >
              {t(item.label)}
            </button>
          ))}
        </div>
        <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
          {t('BPHS 6.52 takes as good the vargas of the exaltation, the mūlatrikoṇa and the own sign, and those of the lords of the kendras from the Āruḍha. The first part is the usual count. With the second part nearly every varga counts, so it is a choice and not the count shown first.')}
          {result.arudhaSign !== null && <> {t('Āruḍha Lagna')}: {SIGN_NAMES[result.arudhaSign - 1]}; {t('the lords of its kendras')}: {result.kendraLords.join(', ')}.</>}
        </div>
      </div>

      <div className="space-y-2">
        <Heading command="vaisheshikamsa">{t('How many good vargas each graha has in the six, the seven, the ten and the sixteen vargas, and the name of the count by the Sanskrit of BPHS 6.43–51. One good varga, or none, has no name. The last column names what 6.53 says destroys the yoga. Rahu, Ketu and the Lagna are left out.')}</Heading>
        <ScrollTable minWidth="min-w-[860px]" headers={[t('Planet'), ...VAISHESHIKA_SCHEMES.map(key => VIMSOPAKA_SCHEMES[key].label), t('Spoiled by (6.53)')]}>
          {result.rows.map(row => (
            <tr key={row.planet} className={ROW}>
              <td className={NAME_CELL}>{row.planet}</td>
              {VAISHESHIKA_SCHEMES.map((scheme: SchemeKey) => {
                const name = row.names[scheme];
                return (
                  <td key={scheme} className={VALUE_CELL}>
                    <span className="text-zinc-500 dark:text-zinc-400">{row.counts[scheme]} / {schemeVargas(scheme).length}</span>
                    {name && <> <span className="font-bold text-amber-700 dark:text-amber-300">{name.name}</span> <span lang="sa" className="text-zinc-600 dark:text-zinc-300">{name.devanagari}</span></>}
                  </td>
                );
              })}
              <td className={`${BODY_CELL} ${row.spoilers.length ? 'text-red-700 dark:text-red-300' : 'text-zinc-400 dark:text-zinc-600'}`}>
                {row.spoilers.length ? row.spoilers.map(item => t(SPOILER_TEXT[item])).join(', ') : '—'}
              </td>
            </tr>
          ))}
        </ScrollTable>
        <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
          {t('Not judged: the Śayana and the other states of 6.53 (the verse does not say which of the twelve). Weak is read as a Ṣaḍbala under the required. In the first count the horā has a sign of the Sun and the Moon only and the triṁśāṁśa none of theirs, so not every name can be reached.')}
        </div>
      </div>

      <div className="space-y-2">
        <Heading command="vaisheshikamsa.vargas">{t('The sign of each graha in the sixteen vargas of Parāśara. E: its exaltation sign, O: a sign of its own, K: a sign of a lord of a kendra from the Āruḍha. The green ones are counted.')}</Heading>
        <ScrollTable minWidth="min-w-[900px]" headers={[t('Planet'), ...ALL_VARGAS]}>
          {result.rows.map(row => (
            <tr key={row.planet} className={ROW}>
              <td className={NAME_CELL}>{row.planet}</td>
              {ALL_VARGAS.map(key => {
                const cell = row.vargas[key];
                const mark = cellMark(cell);
                return (
                  <td key={key} className={`p-2 border whitespace-nowrap ${cell.good ? GOOD_CELL : PLAIN_CELL}`}>
                    <span className={cell.good ? 'font-bold' : ''}>{cell.sign}</span>
                    {mark && <span className="ml-1 text-[9px] opacity-75">{mark}</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </ScrollTable>
      </div>

      {NAME_TABLES.map(table => (
        <div key={table.command} className="space-y-2">
          <Heading command={table.command}>{t(table.title)}</Heading>
          <ScrollTable minWidth="min-w-[640px]" headers={[t('Good vargas'), 'संस्कृतम्', 'IAST', t('The word of the verse'), t('Verse'), t('Meaning')]}>
            {table.names.map(name => (
              <tr key={name.count} className={ROW}>
                <td className={VALUE_CELL}>{name.count}</td>
                <td lang="sa" className={`${BODY_CELL} text-sm text-zinc-800 dark:text-zinc-100`}>{name.devanagari}</td>
                <td className={NAME_CELL}>{name.name}</td>
                <td className={`${VALUE_CELL} italic`}>{name.numeral}</td>
                <td className={VALUE_CELL}>6.{name.verse}</td>
                <td className={VALUE_CELL}>{t(name.meaning)}</td>
              </tr>
            ))}
          </ScrollTable>
        </div>
      ))}

      <details className="rounded-lg border border-zinc-200 dark:border-zinc-700" data-testid="vaisheshikamsa-verses">
        <summary className="cursor-pointer select-none px-3 py-2.5 text-xs font-mono text-zinc-600 dark:text-zinc-300">{t('The verses: BPHS 6.42–53 in Sanskrit')}</summary>
        <div className="space-y-3 border-t border-zinc-200 px-3 py-3 text-xs font-mono dark:border-zinc-700">
          {VAISHESHIKA_VERSES.map(verse => (
            <div key={verse.verse}>
              <div className="text-zinc-700 dark:text-zinc-200">6.{verse.verse}: {verse.gloss}</div>
              <div lang="sa" className="mt-1 text-sm text-zinc-800 dark:text-zinc-100">{verse.sanskrit[0]}</div>
              <div lang="sa" className="text-sm text-zinc-800 dark:text-zinc-100">{verse.sanskrit[1]}</div>
              <div className="italic text-zinc-500 dark:text-zinc-400">{verse.iast[0]}</div>
              <div className="italic text-zinc-500 dark:text-zinc-400">{verse.iast[1]}</div>
              {verse.note && <div className="text-[10px] text-zinc-400 dark:text-zinc-600">{verse.note}</div>}
            </div>
          ))}
          <div className="text-[10px] text-zinc-400 dark:text-zinc-600">{t('The text of sanskritdocuments.org and enjoylearningsanskrit.com, read against the printed edition of Devacandra Jhā (Chaukhamba). The word vaiśeṣikāṁśa is not in these verses: it is the name other books give to these counts.')}</div>
        </div>
      </details>
    </div>
  );
}
