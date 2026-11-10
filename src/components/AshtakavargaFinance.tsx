'use client';

import type { ChartData } from '@/types';
import type { AshtakavargaSystem } from '@/lib/ashtakavarga';
import { LAGNA_LIMIT, LOSS_HOUSES, LOSS_LIMIT, WEALTH_HOUSES, WEALTH_LIMIT, buildFinance, type BinduClass, type FinanceComparison, type FinanceGraha } from '@/lib/ashtakavargaFinance';
import { SIGN_ABBR } from '@/lib/signs';
import { fill, useT } from '@/lib/i18n';

// A simple reading of money from the Aṣṭakavarga, after a modern lesson (ashtakavargaFinance.ts): two comparisons of houses and two sums of the Sarvāṣṭakavarga, and the
// grahas of money by the bindus of their own Bhinnāṣṭakavarga. Not a rule of BPHS.

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;
const YES = 'text-emerald-600 dark:text-emerald-400';
const NO = 'text-red-600 dark:text-red-400';
const KIND_CLASS: Record<BinduClass, string> = { many: YES, average: 'text-zinc-700 dark:text-zinc-200', few: NO };
const KIND_TEXT: Record<BinduClass, string> = { many: 'many', average: 'average', few: 'few' };

const COMPARISON: Record<FinanceComparison['key'], { title: string; yes: string; no: string }> = {
  lagna12: { title: 'The self against the losses', yes: 'The Lagna has more: the native comes out ahead.', no: 'The 12th has as many or more: the losses weigh more than the self.' },
  income12: { title: 'Income against expenses', yes: 'The 11th has more: the income is larger than the expenses.', no: 'The 12th has as many or more: the expenses reach the income.' },
  saving11: { title: 'Saving against earning', yes: 'The 2nd has more: what is earned is kept and grows.', no: 'The 11th has as many or more: the native earns but does not save as much.' },
};
const LEAK: Record<number, string> = {
  6: 'lawsuits, debts and sudden illness',
  8: 'sudden losses, the spouse’s family, long illness and disputes',
  12: 'failed investments, expenses abroad and luxury',
};
const ROLE: Record<FinanceGraha['roles'][number], string> = { karaka: 'kāraka', lord2: 'lord of the 2nd', lord11: 'lord of the 11th' };
const KARAKA_OF: Partial<Record<string, string>> = { Jupiter: 'wealth', Venus: 'luxury and the flow of money', Mars: 'land and fixed property' };

export function FinanceView({ chart, system }: { chart: ChartData; system: AshtakavargaSystem }) {
  const t = useT();
  const finance = buildFinance(chart, system);
  const of = (house: number) => finance.houses[house - 1];
  const sumText = (houses: readonly number[]) => houses.map(of).join(' + ');
  return (
    <div className="space-y-5" data-finance>
      <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
        {t('A simple reading of money from the Sarvāṣṭakavarga of the houses, after a modern lesson on the Aṣṭakavarga and finances. It is a teacher’s method, not a rule of BPHS (BPHS 72 is under Effects); the limits 28, 164 and 76 are the lesson’s.')}
      </p>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('First rule: houses compared')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-finance-compare>
            <thead>
              <tr>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Compared')}</th>
                <th scope="col" className={HEAD}>{t('Houses')}</th>
                <th scope="col" className={HEAD}>{t('Bindus')}</th>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Reads')}</th>
              </tr>
            </thead>
            <tbody>
              {finance.comparisons.map(item => {
                // The Lagna must also have more than 28 to be ahead.
                const holds = item.key === 'lagna12' ? finance.lagnaAhead : item.holds;
                const text = item.key === 'lagna12' && item.holds && !finance.lagnaAhead ? 'The Lagna has more than the 12th but not more than 28: the lead is not sure.' : holds ? COMPARISON[item.key].yes : COMPARISON[item.key].no;
                return (
                  <tr key={item.key} data-finance-row={item.key} data-finance-holds={holds} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`text-left font-semibold ${CELL}`}>{t(COMPARISON[item.key].title)}</th>
                    <td className={`${CELL} tabular-nums`}>{item.left.house} : {item.right.house}</td>
                    <td className={`${CELL} font-bold tabular-nums ${holds ? YES : NO}`}>{item.left.bindus} : {item.right.bindus}</td>
                    <td className={`text-left ${CELL} ${holds ? YES : NO}`}>{t(text)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{fill(t('The Lagna is ahead when it has more bindus than the 12th and more than {limit}.'), { limit: LAGNA_LIMIT })}</p>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('Second rule: the sums')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-finance-sums>
            <thead>
              <tr>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Sum')}</th>
                <th scope="col" className={HEAD}>{t('Houses')}</th>
                <th scope="col" className={HEAD}>{t('Bindus')}</th>
                <th scope="col" className={HEAD}>{t('Limit')}</th>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Reads')}</th>
              </tr>
            </thead>
            <tbody>
              <tr data-finance-sum="wealth" className="text-zinc-700 dark:text-zinc-200">
                <th scope="row" className={`text-left font-semibold ${CELL}`}>{t('The houses of wealth')}</th>
                <td className={`${CELL} tabular-nums`}>{WEALTH_HOUSES.join(', ')}</td>
                <td className={`${CELL} tabular-nums`}>{sumText(WEALTH_HOUSES)} = <span className={`font-bold ${finance.wealthPromise ? YES : NO}`}>{finance.wealthSum}</span></td>
                <td className={`${CELL} tabular-nums`}>&gt; {WEALTH_LIMIT}</td>
                <td className={`text-left ${CELL} ${finance.wealthPromise ? YES : NO}`}>{t(finance.wealthPromise ? 'Over the limit: a promise of money and a steady flow of it.' : 'Not over the limit: the lesson’s promise of a steady flow is not there.')}</td>
              </tr>
              <tr data-finance-sum="loss" className="text-zinc-700 dark:text-zinc-200">
                <th scope="row" className={`text-left font-semibold ${CELL}`}>{t('The houses of loss')}</th>
                <td className={`${CELL} tabular-nums`}>{LOSS_HOUSES.join(', ')}</td>
                <td className={`${CELL} tabular-nums`}>{sumText(LOSS_HOUSES)} = <span className={`font-bold ${finance.lossHeavy ? NO : YES}`}>{finance.lossSum}</span></td>
                <td className={`${CELL} tabular-nums`}>&gt; {LOSS_LIMIT}</td>
                <td className={`text-left ${CELL} ${finance.lossHeavy ? NO : YES}`}>{t(finance.lossHeavy ? 'Over the limit: the expenses are large and can swallow the income.' : 'Not over the limit: the expenses stay in bounds.')}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300" data-finance-leak={finance.leak.join(',')}>
          <span className="font-semibold">{t('Where the money goes')}:</span>{' '}
          {finance.leak.map(house => `${fill(t('the {house}th house ({bindus})'), { house, bindus: of(house) })}: ${t(LEAK[house])}`).join('; ')}.
        </div>
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">{t('Of the 6th, the 8th and the 12th, the one with the most bindus shows where the money goes; the lesson reads it when the expenses are large.')}</p>
      </section>

      <section className="space-y-2">
        <h4 className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('The grahas of money in their own Aṣṭakavarga')}</h4>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-finance-grahas>
            <thead>
              <tr>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Graha')}</th>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Read as')}</th>
                <th scope="col" className={HEAD}>{t('Sign')}</th>
                <th scope="col" className={HEAD}>{t('House')}</th>
                <th scope="col" className={HEAD}>{t('Bindus')}</th>
                <th scope="col" className={`text-left ${HEAD}`}>{t('State')}</th>
              </tr>
            </thead>
            <tbody>
              {finance.grahas.map(graha => (
                <tr key={graha.planet} data-finance-graha={graha.planet} className="text-zinc-700 dark:text-zinc-200">
                  <th scope="row" className={`text-left font-semibold ${CELL}`}>{graha.planet}</th>
                  <td className={`text-left ${CELL}`}>{graha.roles.map(role => (role === 'karaka' ? `${t(ROLE[role])}: ${t(KARAKA_OF[graha.planet] ?? '')}` : t(ROLE[role]))).join(' · ')}</td>
                  <td className={CELL}>{SIGN_ABBR[graha.sign - 1]}</td>
                  <td className={`${CELL} tabular-nums`}>{graha.house}</td>
                  <td className={`${CELL} tabular-nums ${KIND_CLASS[graha.kind]}`}><span className="font-bold">{graha.bindus}</span> / 8 · {t(KIND_TEXT[graha.kind])}</td>
                  <td className={`text-left ${CELL}`}>
                    {[graha.dignity ? t(graha.dignity === 'own' ? 'own sign' : graha.dignity) : null, graha.combust ? t('combust') : null].filter(Boolean).join(', ') || '—'}
                    {graha.kind === 'many' && (graha.dignity === 'debilitated' || graha.combust) && <span className={`ml-1 ${YES}`}>· {t('the bindus outweigh it')}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
          {t('The bindus of the sign a graha stands in, in its own Bhinnāṣṭakavarga (8 at most). The lesson: with many bindus a graha gives material gain even when debilitated or combust; its example has 7 as strong and 4 as average. The classes are taken here: 5 or more many, 4 average, 3 or fewer few. The 5th and the 9th house, which the lesson names as houses of fortune, are in neither rule.')}
        </p>
      </section>
    </div>
  );
}
