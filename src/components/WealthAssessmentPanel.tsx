'use client';

import { useMemo } from 'react';
import type { ChartData } from '@/types';
import { buildShadbalaRows } from '@/lib/shadbala';
import { SEVEN, type SevenGraha } from '@/lib/topicCore';
import { assessWealth, type DhanaYoga, type Earning, type HouseStrength, type HoraRow, type TopicContext, type YogaKey, type YogaStatus } from '@/lib/wealthAssessment';
import { SIGN_ABBR } from '@/lib/signs';
import { fill, useT } from '@/lib/i18n';
import { useGrahaNames } from '@/lib/grahaNames';

// A reading of self-earned wealth in three steps and a confirmation (wealthAssessment.ts), after a modern teacher's article. A method, not a rule of one text.

const CELL = 'border border-zinc-200 dark:border-zinc-700 px-2 py-1.5';
const HEAD = `${CELL} font-semibold text-zinc-500 dark:text-zinc-400`;
const YES = 'text-emerald-600 dark:text-emerald-400';
const NO = 'text-red-600 dark:text-red-400';
const MUTED = 'text-zinc-400 dark:text-zinc-500';
const NOTE = 'text-[10px] font-mono text-zinc-400 dark:text-zinc-500';
const H4 = 'text-xs font-semibold text-zinc-700 dark:text-zinc-200';

const strongCell = (value: boolean | null) => (value === null ? ['?', MUTED] : value ? ['✓', YES] : ['✗', NO]) as [string, string];
const YOGA_TITLE: Record<YogaKey, string> = {
  lord2lord5: 'The lords of the 2nd and the 5th related',
  lord2lord11: 'The lords of the 2nd and the 11th related',
  lord5in5lord9in9: 'The 5th lord in or aspecting the 5th, the 9th lord the 9th',
  lord2in2lord11in11: 'The 2nd lord in or aspecting the 2nd, the 11th lord the 11th',
};
const YOGA_STATUS: Record<YogaStatus, [string, string]> = {
  present: ['present', YES],
  diluted: ['present, lowered by Jupiter as a lord of 6, 8 or 12', YES],
  broken: ['formed but almost cancelled by a lord of 6, 8 or 12', NO],
  absent: ['not formed', MUTED],
};
const HOW: Record<string, string> = { 'one graha rules both': 'one graha rules both', 'exchange of signs': 'exchange of signs', conjunction: 'conjunction', 'mutual aspect': 'mutual aspect' };
const EARNING: Record<Earning, string> = {
  both: 'The 2nd and the 11th are both strong: money is earned and kept, and assets are built.',
  earns: 'The 11th is strong and the 2nd is not: good at earning money, less at accumulating it and building assets.',
  keeps: 'The 2nd is strong and the 11th is not: helped by family assets (jewellery and the like) and good at saving and using what there is, less at earning.',
  neither: 'Neither the 2nd nor the 11th is strong: money comes with effort and does not stay easily.',
  unknown: 'The strength of the 2nd or the 11th lord is not known.',
};

function Mark({ value }: { value: boolean | null }) {
  const [sign, color] = strongCell(value);
  return <span className={`font-bold ${color}`}>{sign}</span>;
}

export default function WealthAssessmentPanel({ chart }: { chart: ChartData }) {
  const t = useT();
  const { name: graha } = useGrahaNames();
  const context = useMemo<TopicContext>(() => {
    const ratio: Partial<Record<SevenGraha, number>> = {};
    for (const row of buildShadbalaRows(chart)) if ((SEVEN as readonly string[]).includes(row.planet)) ratio[row.planet as SevenGraha] = row.ratio;
    return {
      ascendantSign: chart.ascendant.sign,
      ascendantLongitude: chart.ascendant.longitude,
      ratio,
      planets: chart.planets.map(planet => ({ name: planet.name, sign: planet.sign, degree: planet.degree, longitude: planet.longitude, isRetrograde: planet.isRetrograde })),
    };
  }, [chart]);
  const result = useMemo(() => assessWealth(context), [context]);
  const { step1, hora, houses, yogas, lagnaLord, comforts, moon } = result;
  const ord = (n: number) => fill(t('the {n}th'), { n });

  const horaVerdict = (row: HoraRow) => {
    if (row.verdict === 'neutral') return [t('neither helps nor hinders'), MUTED];
    if (row.verdict === 'hinders') return [t('hinders: the reverse place'), NO];
    if (row.strong === false) return [t('helps, but is weak: a promise only'), 'text-amber-600 dark:text-amber-400'];
    return [row.strong === null ? t('helps') : t('helps, and is strong enough to deliver'), YES];
  };
  const houseRow = (item: HouseStrength) => (
    <tr key={item.house} data-wealth-house={item.house} className="text-zinc-700 dark:text-zinc-200">
      <th scope="row" className={`text-left font-semibold ${CELL}`}>{item.house}</th>
      <td className={CELL}>{graha(item.lord)}{item.lordHouse ? ` (${item.lordHouse})` : ''}</td>
      <td className={CELL}><Mark value={item.lordStrong} /></td>
      <td className={CELL}><Mark value={item.lordJoins} /></td>
      <td className={CELL}><Mark value={item.jupiterAspects} /></td>
      <td className={CELL}><Mark value={item.strong} /></td>
    </tr>
  );
  const housesTable = (rows: HouseStrength[], marker: string) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-center font-mono text-xs" data-wealth-houses={marker}>
        <thead>
          <tr>
            <th scope="col" className={`text-left ${HEAD}`}>{t('House')}</th>
            <th scope="col" className={HEAD}>{t('Lord (in house)')}</th>
            <th scope="col" className={HEAD}>{t('Lord strong')}</th>
            <th scope="col" className={HEAD}>{t('Lord in or aspecting it')}</th>
            <th scope="col" className={HEAD}>{t('Jupiter aspects it')}</th>
            <th scope="col" className={HEAD}>{t('House strong')}</th>
          </tr>
        </thead>
        <tbody>{rows.map(houseRow)}</tbody>
      </table>
    </div>
  );
  // "5:in" is the lord of the 5th in its own house, "9:aspects" the lord of the 9th aspecting it.
  const placed = (how: string) => {
    const [house, kind] = how.split(':');
    return `${fill(t('lord of the {n}th'), { n: house })} ${t(kind === 'in' ? 'in its house' : 'aspects its house')}`;
  };
  const yogaTable = (items: DhanaYoga[], marker: string) => (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse font-mono text-xs" data-wealth-yogas={marker}>
        <thead>
          <tr>
            <th scope="col" className={`text-left ${HEAD}`}>{t('Pattern')}</th>
            <th scope="col" className={`text-left ${HEAD}`}>{t('Reads')}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(yoga => {
            const [status, color] = YOGA_STATUS[yoga.status];
            return (
              <tr key={yoga.key} data-wealth-yoga={yoga.key} data-wealth-yoga-status={yoga.status} className="align-top text-zinc-700 dark:text-zinc-200">
                <th scope="row" className={`text-left font-semibold ${CELL}`}>{t(YOGA_TITLE[yoga.key])}</th>
                <td className={`${CELL} ${color}`}>
                  {t(status)}
                  {yoga.formed && yoga.how.length > 0 && <span className="text-zinc-500 dark:text-zinc-400"> · {yoga.how.map(how => (HOW[how] ? t(HOW[how]) : placed(how))).join(', ')}</span>}
                  {yoga.spoilers.length > 0 && <span className="text-zinc-500 dark:text-zinc-400"> · {t('joined by')} {yoga.spoilers.map(item => `${graha(item.graha)} (${fill(t('lord of the {n}th'), { n: item.house })})`).join(', ')}</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-w-0 space-y-6" data-wealth="panel">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Wealth assessment')}</div>
        <p className={`mt-1 ${NOTE}`}>
          {t('A reading of self-earned wealth in three steps and a confirmation, after a modern teacher’s article. It is a method and not a rule of one text: what rests on a verse says which (the Bṛhajjātaka and the Phaladīpikā for steps 1 and 2, BPHS 7 for the horā); the rest is the teacher’s reading. “Strong” is the Ṣaḍbala of the graha at or over what it needs; aspects are by whole signs. The sources and what could be checked are in docs/wealth-assessment-sources.md.')}
        </p>
      </div>

      <section className="space-y-2" data-wealth-step="1">
        <h4 className={H4}>{t('Step 1: the Moon from the Sun')}</h4>
        {step1 ? (
          <div className="space-y-1 font-mono text-xs text-zinc-700 dark:text-zinc-200" data-wealth-sunmoon={step1.kind} data-wealth-sunmoon-house={step1.house}>
            <div>{fill(t('The Moon is in the {n}th house from the Sun: {kind}.'), { n: step1.house, kind: t(step1.kind === 'kendra' ? 'a kendra' : step1.kind === 'panaphara' ? 'a paṇapara' : 'an āpoklima') })}</div>
            <div className={step1.kind === 'apoklima' ? YES : step1.kind === 'kendra' ? NO : ''}>
              {t(step1.kind === 'kendra'
                ? 'Modesty, money, knowledge, intelligence and skill earned by oneself are below the average; the ego is the main obstacle to earning.'
                : step1.kind === 'panaphara'
                  ? 'Average; the ego is not the main obstacle, willingness to learn is.'
                  : 'Good modesty and a greater potential to earn by one’s own knowledge and intelligence; open to the ideas that create wealth.')}
              {step1.best && <> {t('The 6th and the 9th are the best of the four, the Moon being farthest from the Sun.')}</>}
            </div>
            {step1.kind === 'kendra' && (
              <div className={step1.lagnaLordOvercomes ? YES : MUTED} data-wealth-exception={String(step1.lagnaLordOvercomes)}>
                {step1.lagnaLordOvercomes === null
                  ? t('The exception (the Lagna lord stronger than the Sun and the Moon, with a benefic aspect) cannot be judged.')
                  : step1.lagnaLordOvercomes
                    ? t('The exception holds: the Lagna lord is stronger than the Sun and the Moon and a benefic aspects it.')
                    : t('The exception does not hold: the Lagna lord is not both stronger than the Sun and the Moon and aspected by a benefic.')}
              </div>
            )}
          </div>
        ) : <p className={NOTE}>{t('The Sun or the Moon is missing from the chart.')}</p>}
        <p className={NOTE}>{t('Bṛhajjātaka 13.1: the Moon in a kendra, a paṇapara or an āpoklima from the Sun. The stress on what is earned by oneself is the teacher’s reading of the compound.')}</p>
      </section>

      <section className="space-y-2" data-wealth-step="2">
        <h4 className={H4}>{t('Step 2: the horā')}</h4>
        <p className={NOTE}>{t('A horā is half a sign of 15° and is the Sun’s (Leo) or the Moon’s (Cancer) and no other sign: in odd signs the first half is the Sun’s, in even signs the Moon’s (BPHS 7.5–6). So there is no horā chart of twelve houses, only this table of the grahas in Leo or in Cancer.')}</p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-wealth-hora>
            <thead>
              <tr>
                <th scope="col" className={`text-left ${HEAD}`}>{t('Graha')}</th>
                <th scope="col" className={HEAD}>{t('Sign')}</th>
                <th scope="col" className={HEAD}>{t('Horā')}</th>
                <th scope="col" className={HEAD}>{t('Nature')}</th>
                <th scope="col" className={`text-left ${HEAD}`}>{t('For money')}</th>
              </tr>
            </thead>
            <tbody>
              {hora.map(row => {
                const [text, color] = horaVerdict(row);
                return (
                  <tr key={row.name} data-wealth-hora-row={row.name} data-wealth-hora-owner={row.owner} data-wealth-hora-verdict={row.verdict} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`text-left font-semibold ${CELL}`}>{graha(row.name)}</th>
                    <td className={`${CELL} tabular-nums`}>{SIGN_ABBR[row.sign - 1]} {row.degree.toFixed(1)}° {t(row.odd ? '(odd)' : '(even)')}</td>
                    <td className={CELL}>{row.owner === 'sun' ? t('Sun’s (Leo)') : t('Moon’s (Cancer)')}</td>
                    <td className={CELL}>{t(row.nature === 'both' ? 'both' : row.nature)}</td>
                    <td className={`text-left ${CELL} ${color}`}>{text}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className={NOTE}>{t('Phaladīpikā 3.12: malefics (Sun, Mars, Saturn) in the Sun’s horā of an odd sign give strength, wealth and a hard hand: status, victory and competition. Benefics (Moon, Mercury, Jupiter, Venus) in the Moon’s horā of an even sign give comfort, manners and pleasant speech: sustenance and luxury. Mercury helps in either. The reverse places (the teacher’s reading) hinder. A weak graha only promises.')}</p>
        {result.recurring.length > 0 && (
          <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400" data-wealth-recurring={result.recurring.map(item => item.name).join(',')}>
            {t('Helped by the horā and a lord of the money houses or Jupiter as well:')} {result.recurring.map(item => graha(item.name)).join(', ')}. {t('A graha that shows in both steps raises the potential.')}
          </p>
        )}
      </section>

      <section className="space-y-3" data-wealth-step="3">
        <h4 className={H4}>{t('Step 3: the houses of money and the pattern of the dhana yogas')}</h4>
        {housesTable([houses[2], houses[11], houses[9], houses[5]], 'lagna')}
        <p className={NOTE}>{t('A house is strong when its lord is strong and it has an aspect from its lord or from Jupiter (the kāraka of the 2nd and the 11th). The 2nd and the 11th are the money; the 9th (favour of those who hold the resources) and the 5th (merit and enjoyment) support them.')}</p>
        <p className={`font-mono text-xs text-zinc-700 dark:text-zinc-200`} data-wealth-earning={result.earning}>{t(EARNING[result.earning])}</p>
        {yogaTable(yogas, 'lagna')}
        <p className={NOTE}>{t('The pattern of Bhāvārtharatnākara’s dhana yoga: a relationship (an exchange of signs, a conjunction or a mutual aspect) between the lords of 2 and 5, or 2 and 11; or the 5th and the 9th lords each in or aspecting their own house; or the 2nd and the 11th. The lords of 6, 8 and 12 joining or aspecting the grahas of a relationship spoil it; Jupiter, the kāraka, only lowers it. Joining is read here as a conjunction with, or an aspect on, either graha.')}</p>
        {result.singleMoneyLord && (
          <div className="font-mono text-xs text-zinc-700 dark:text-zinc-200" data-wealth-single>
            {fill(t('{graha} rules both the 2nd and the 11th: it must be strong, its dispositor strong, and it must join the lord of the 5th or the 9th.'), { graha: graha(result.singleMoneyLord.graha) })}{' '}
            <Mark value={result.singleMoneyLord.strong} /> {t('strong')} · <Mark value={result.singleMoneyLord.dispositorStrong} /> {t('dispositor strong')} · <Mark value={result.singleMoneyLord.joinsTrikona} /> {t('joins the 5th or 9th lord')}
          </div>
        )}
        <div className="space-y-1 font-mono text-xs text-zinc-700 dark:text-zinc-200" data-wealth-lagnalord>
          <div className="font-semibold">{t('The Lagna and its lord')}</div>
          <div>
            {fill(t('{graha}, lord of the Lagna, in {house}.'), { graha: graha(lagnaLord.lord), house: lagnaLord.house ? ord(lagnaLord.house) : '?' })}{' '}
            <Mark value={lagnaLord.strong} /> {t('strong')} · <Mark value={lagnaLord.goodSign} /> {t('in a good sign')} · <Mark value={lagnaLord.house === null ? null : !lagnaLord.inDusthana} /> {t('not in the 6th, 8th or 12th')} · <Mark value={lagnaLord.sunDistance === null ? null : !lagnaLord.nearSun} /> {t('over 10° from the Sun')}
            {lagnaLord.sunDistance !== null && <> ({lagnaLord.sunDistance.toFixed(1)}°)</>}
          </div>
          <div>
            {lagnaLord.dispositor && <>{fill(t('Its dispositor {graha}'), { graha: graha(lagnaLord.dispositor) })}: <Mark value={lagnaLord.dispositorStrong} /> {t('strong')}.</>}{' '}
            {t('A strong Lagna lord shows own effort and the strength to overcome obstacles; without it the yogas seldom work, and the 9th is leaned on.')}
          </div>
          <div data-wealth-jupiter>
            {t('Jupiter')}: <Mark value={result.jupiter.strong} /> {t('strong')}{result.jupiter.house ? `, ${ord(result.jupiter.house)}` : ''}
            {result.jupiter.hora && <> · {t('horā')}: {t(result.jupiter.hora === 'helps' ? 'helps' : result.jupiter.hora === 'hinders' ? 'hinders' : 'neither helps nor hinders')}</>}
          </div>
        </div>
      </section>

      <section className="space-y-3" data-wealth-step="confirm">
        <h4 className={H4}>{t('Confirmation')}</h4>
        <div className="space-y-2">
          <div className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('From the Moon: the experience of the mind')}</div>
          {moon ? (
            <>
              {housesTable([moon.second, moon.eleventh], 'moon')}
              {yogaTable(moon.yogas, 'moon')}
              <p className={NOTE}>{t('The same houses and the same pattern counted from the Moon’s sign. The yogas from the Moon work well when the Moon is strong.')} {t('The Moon')}: <Mark value={moon.moonStrong} /> {t('strong')}.</p>
            </>
          ) : <p className={NOTE}>{t('The Moon is missing from the chart.')}</p>}
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t('The grahas of money in the vargas')}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-center font-mono text-xs" data-wealth-vargas>
              <thead>
                <tr>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Graha')}</th>
                  <th scope="col" className={`text-left ${HEAD}`}>{t('Read as')}</th>
                  {[9, 3, 2, 12, 30].map(division => <th key={division} scope="col" className={HEAD}>D{division}</th>)}
                  <th scope="col" className={HEAD}>{t('Good')}</th>
                </tr>
              </thead>
              <tbody>
                {result.money.map(item => (
                  <tr key={item.name} data-wealth-varga-row={item.name} className="text-zinc-700 dark:text-zinc-200">
                    <th scope="row" className={`text-left font-semibold ${CELL}`}>{graha(item.name)}{item.vargottama && <span className={`ml-1 ${YES}`} title={t('vargottama')}>⟳</span>}</th>
                    <td className={`text-left ${CELL}`}>{item.reasons.map(reason => t(reason === 'lagnaLord' ? 'lord of the Lagna' : reason === 'lord2' ? 'lord of the 2nd' : reason === 'lord11' ? 'lord of the 11th' : reason === 'jupiter' ? 'kāraka Jupiter' : 'helped by the horā')).join(' · ')}</td>
                    {item.vargas.map(place => (
                      <td key={place.division} className={`${CELL} ${place.good === true ? YES : place.good === false ? NO : ''}`} data-wealth-varga={`${item.name}-${place.division}`} data-wealth-varga-good={String(place.good)}>{SIGN_ABBR[place.sign - 1]}</td>
                    ))}
                    <td className={`${CELL} font-bold tabular-nums`}>{item.goodCount} / 5</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={NOTE}>{t('The signs these grahas occupy in D9, D3, D2, D12 and D30. Green: the graha’s own sign, its exaltation or a natural friend’s sign; red: its debilitation or an enemy’s sign. A graha in a good sign in the vargas (D9 and D3 most) can deliver and not only promise. ⟳ marks a vargottama graha (the same sign in D1 and D9, not debilitated). The lords of those varga signs should not be weak in the rāśi.')}</p>
        </div>

        <div className="space-y-1 font-mono text-xs text-zinc-700 dark:text-zinc-200" data-wealth-comforts>
          <div className="font-semibold">{t('Comfort, status and ease')}</div>
          {comforts.navamsaLord && <div>{fill(t('The lord of the rising navāṁśa ({sign}) is {graha}'), { sign: SIGN_ABBR[comforts.navamsaLord.sign - 1], graha: graha(comforts.navamsaLord.lord) })}: <Mark value={comforts.navamsaLord.strong} /> {t('strong in the rāśi; then comforts are good even with below-average wealth.')}</div>}
          {comforts.drekkanaLord && <div>{fill(t('The lord of the rising drekkāṇa ({sign}) is {graha}'), { sign: SIGN_ABBR[comforts.drekkanaLord.sign - 1], graha: graha(comforts.drekkanaLord.lord) })}: <Mark value={comforts.drekkanaLord.strong} /> {t('strong in the rāśi; then status and respect come with less effort.')}</div>}
          <div>
            {t('In the 3rd, 6th, 10th and 11th (upachaya)')}: {t('benefics')}: {comforts.upachayaBenefics.map(graha).join(', ') || '—'} · {t('malefics')}: {comforts.upachayaMalefics.map(graha).join(', ') || '—'}.{' '}
            <span className={NOTE}>{t('Benefics there bring it with ease; malefics make one work hard and win the obstacles, and if they are the strong money grahas they do very well at it.')}</span>
          </div>
        </div>
      </section>

      <section className="space-y-1" data-wealth-tally>
        <h4 className={H4}>{t('The checks together')}</h4>
        <p className="font-mono text-xs text-zinc-700 dark:text-zinc-200">
          <span className={YES}>{result.tally.supports} {t('for')}</span> · <span className={NO}>{result.tally.hinders} {t('against')}</span> · <span className={MUTED}>{result.tally.open} {t('not judged')}</span>
        </p>
        <p className={NOTE}>{t('The Moon from the Sun, the Lagna lord (strength, sign, house, the Sun’s distance), the 2nd and the 11th, Jupiter (strength and horā), the four dhana patterns and the 2nd and the 11th from the Moon. The count is the app’s and not the text’s: the article says most charts are average, and the amount of wealth rests on the strength and dignity of the money grahas, which a count does not weigh.')}</p>
      </section>
    </div>
  );
}
