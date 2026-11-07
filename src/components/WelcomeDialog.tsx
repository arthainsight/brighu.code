'use client';

import { useEffect, useRef } from 'react';
import { APP_VERSION } from '@/lib/config';
import { CHANGELOG } from '@/lib/changelog';
import { recentUpdates } from '@/lib/welcome';
import { useT } from '@/lib/i18n';

/** How many of the changes of the newest version the window lists; the rest are in the updates of Settings. */
const SHOWN_CHANGES = 6;

interface Props {
  /** Whether the visitor has still to say if the page may look up the place they open it from. */
  askPlace: boolean;
  /** Whether there are updates the visitor has not seen. */
  showUpdates: boolean;
  onAllowPlace: () => void;
  onDeclinePlace: () => void;
  /** Closes the window without an answer (the question comes again next time). */
  onClose: () => void;
}

/**
 * The window the page opens with. It asks whether the page may work out the visitor's approximate place from the address of
 * their request, to open the chart there (nothing is looked up before a yes), and lists the latest updates.
 */
export default function WelcomeDialog({ askPlace, showUpdates, onAllowPlace, onDeclinePlace, onClose }: Props) {
  const t = useT();
  const first = useRef<HTMLButtonElement>(null);
  const updates = showUpdates ? recentUpdates(CHANGELOG) : null;

  useEffect(() => {
    first.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const primary = 'rounded bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700';
  const secondary = 'rounded border border-zinc-300 px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center" data-welcome>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="max-h-[88vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-4 text-zinc-800 shadow-xl dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <h2 id="welcome-title" className="text-sm font-semibold">{t('Welcome to bhrigu.code')}</h2>

        {askPlace && (
          <section className="space-y-2" data-welcome="place">
            <h3 className="text-xs font-semibold">{t('Open the chart where you are?')}</h3>
            <p className="text-[11px] text-zinc-600 dark:text-zinc-300">
              {t('The page can work out your approximate place (a town, not an address) from the internet address of your request, with the help of its hosting platform, and open the chart of this moment there. Nothing is stored and the address goes to no other service. The place can be wrong (a VPN, a company or a mobile network) and is in the birth data form to change. Without it the chart opens at Porvoo. You can change this in Settings.')}
            </p>
            <div className="flex flex-wrap gap-2">
              <button ref={first} type="button" onClick={onAllowPlace} className={primary}>{t('Yes, use my place')}</button>
              <button type="button" onClick={onDeclinePlace} className={secondary}>{t('No, use Porvoo')}</button>
            </div>
          </section>
        )}

        {updates && (
          <section className="space-y-2" data-welcome="updates">
            <h3 className="text-xs font-semibold">{t("What's new")} · {updates.version}{updates.title ? ` · ${updates.title}` : ''}</h3>
            <ul className="space-y-1">
              {updates.changes.slice(0, SHOWN_CHANGES).map(change => (
                <li key={change} className="flex gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
                  <span className="select-none text-zinc-300 dark:text-zinc-600">—</span>
                  <span>{change}</span>
                </li>
              ))}
            </ul>
            {updates.changes.length > SHOWN_CHANGES && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{t('The rest, and the earlier versions, are in Settings → updates.')}</p>
            )}
            {updates.earlier.length > 0 && (
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {t('Earlier')}: {updates.earlier.map(item => `${item.version}${item.title ? ` ${item.title}` : ''}`).join(' · ')}
              </p>
            )}
          </section>
        )}

        <div className="flex justify-end">
          <button ref={askPlace ? undefined : first} type="button" onClick={onClose} className={askPlace ? secondary : primary}>
            {askPlace ? t('Decide later') : t('Close')}
          </button>
        </div>
        <p className="text-[9px] text-zinc-400 dark:text-zinc-500">{APP_VERSION}</p>
      </div>
    </div>
  );
}
