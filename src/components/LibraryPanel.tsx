'use client';

import type { CalculationSettings } from '@/types';
import type { SavedChartData } from '@/lib/savedCharts';
import { useT } from '@/lib/i18n';
import { useState } from 'react';
import ResearchPanel from './ResearchPanel';
import CompatibilityPanel from './CompatibilityPanel';

interface Props {
  calculationSettings?: CalculationSettings;
  /** Opens a saved chart in the app (from a search result). */
  onOpenChart?: (id: string, name: string, data: SavedChartData) => void;
}

/** The Library workspace provides a dedicated home for cross-chart research. */
export default function LibraryPanel({ calculationSettings, onOpenChart }: Props) {
  const t = useT();
  const [section, setSection] = useState<'research' | 'compatibility'>('research');
  const chip = (active: boolean) => `rounded border px-3 py-1.5 text-xs ${active ? 'border-violet-500 bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300' : 'border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300'}`;

  return (
    <section className="min-w-0 space-y-4" aria-label={t('LIBRARY')} data-library-workspace>
      <header className="space-y-1 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
          {t('LIBRARY')}
        </p>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
          {section === 'research' ? t('Research') : t('Compatibility')}
        </h1>
        <p className="max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
          {t('Study recurring patterns across saved charts and life events.')}
        </p>
      </header>
      <div className="flex gap-2" role="group" aria-label={t('Library sections')}>
        <button type="button" aria-pressed={section === 'research'} onClick={() => setSection('research')} className={chip(section === 'research')}>{t('Research')}</button>
        <button type="button" aria-pressed={section === 'compatibility'} onClick={() => setSection('compatibility')} className={chip(section === 'compatibility')}>{t('Compatibility')}</button>
      </div>
      {section === 'research' ? <ResearchPanel calculationSettings={calculationSettings} onOpenChart={onOpenChart} /> : <CompatibilityPanel calculationSettings={calculationSettings} />}
    </section>
  );
}
