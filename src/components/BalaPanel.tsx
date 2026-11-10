'use client';

import { useState } from 'react';
import type { ChartData } from '@/types';
import { useT } from '@/lib/i18n';
import { useBalaOptions } from '@/hooks/useBalaOptions';
import BalaOptionsPanel from './BalaOptionsPanel';
import VimsopakaPanel from './VimsopakaPanel';
import VaisheshikamsaPanel from './VaisheshikamsaPanel';
import ShadbalaPanel from './ShadbalaPanel';
import BhavaBalaPanel from './BhavaBalaPanel';

type BalaView = 'shadbala' | 'bhava' | 'vimsopaka' | 'vaisheshika';

const TABS: { key: BalaView; label: string }[] = [
  { key: 'shadbala', label: 'Ṣaḍbala' },
  { key: 'bhava', label: 'Bhāva Bala' },
  { key: 'vimsopaka', label: 'Vimśopaka' },
  { key: 'vaisheshika', label: 'Vaiśeṣikāṁśa' },
];

/** The strengths of the grahas and the houses: Ṣaḍbala, Bhāva Bala and Vimśopaka Bala, each with its diagram and table, and the names of the good vargas (Vaiśeṣikāṁśa). */
export default function BalaPanel({ chart, birthDatetime = '' }: { chart: ChartData | null | undefined; birthDatetime?: string }) {
  const t = useT();
  const [view, setView] = useState<BalaView>('shadbala');
  const { options, update, reset } = useBalaOptions();
  if (!chart) return <div className="flex h-40 items-center justify-center px-4 text-center font-mono text-xs text-zinc-400 dark:text-zinc-600">{t('Calculate a chart first.')}</div>;

  return (
    <div className="min-w-0 space-y-4">
      <div className="inline-flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800/50">
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setView(tab.key)}
            className={`rounded-md px-2.5 py-1 text-[10px] font-mono ${view === tab.key ? 'bg-white text-emerald-700 shadow-sm dark:bg-zinc-700 dark:text-green-400' : 'text-zinc-500 dark:text-zinc-400'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* The Vaiśeṣikāṁśa has its one choice in its own view; the Ṣaḍbala choices reach it only through the weak graha of 6.53. */}
      {view !== 'vaisheshika' && <BalaOptionsPanel view={view} options={options} onChange={update} onReset={reset} />}
      {view === 'shadbala' && <ShadbalaPanel chart={chart} options={options} />}
      {view === 'bhava' && <BhavaBalaPanel chart={chart} options={options} />}
      {view === 'vimsopaka' && <VimsopakaPanel chart={chart} options={options} />}
      {view === 'vaisheshika' && <VaisheshikamsaPanel chart={chart} options={options} birthDatetime={birthDatetime} />}
    </div>
  );
}
