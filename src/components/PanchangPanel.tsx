'use client';

import { ChartData } from '@/types';
import { calculatePanchang, PanchangResult } from '@/lib/panchang';

import { useT } from '@/lib/i18n';

interface Props {
  chart: ChartData;
  birthDatetime: string;
  utcOffsetHours: number;
  ayanamsaName: string;
  nakshatraAdjust?: number;
  /** The chart is one with grahas or the Lagna moved by hand: the panchāṅga is read from it as it stands. */
  edited?: boolean;
  /** Whether the rows are shown, and the switch for it. */
  open?: boolean;
  onToggle?: () => void;
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-2" data-panchang-row={label}>
      <span className="w-28 shrink-0 text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
        {label}
      </span>
      <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300">
        {value ?? '—'}
      </span>
    </div>
  );
}

function PanchangRows({ p }: { p: PanchangResult }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Row label="vara"      value={`${p.vara} · ${p.varaLord}${p.beforeSunrise ? ` (${t('before sunrise')})` : ''}`} />
        <Row label="tithi"     value={`${p.tithi} (${p.tithiNumber}) · ${p.paksha}`} />
        <Row label="nakshatra" value={`${p.nakshatra} · Pada ${p.nakshatraPada}`} />
        <Row label="karana"    value={p.karana} />
        <Row label="yoga"      value={p.yoga} />
        <Row label="hora"      value={p.hora} />
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
        <Row label={t('sunrise')}    value={p.sunrise} />
        <Row label={t('sunset')}     value={p.sunset} />
        <Row label={t('solar noon')} value={p.solarNoon} />
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
        <Row label="ayanamsa" value={p.ayanamsa} />
        <Row label="masa"     value={p.masa} />
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2" data-panchang="sankalpa">
        <Row label="samvatsara" value={p.samvatsara} />
        <Row label="ayana"      value={p.ayana} />
        <Row label="ritu"       value={p.ritu} />
        <Row label="paksha"     value={`${p.paksha} (${p.paksha === 'Shukla' ? t('waxing') : t('waning')})`} />
        <Row label="kala"       value={p.kala === null ? null : p.kalaMeaning ? `${p.kala} · ${t(p.kalaMeaning)}` : p.kala} />
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2" data-panchang="left">
        <Row label="tithi left"     value={`${p.left.tithi.toFixed(2)} %`} />
        <Row label="nakshatra left" value={`${p.left.nakshatra.toFixed(2)} %`} />
        <Row label="yoga left"      value={`${p.left.yoga.toFixed(2)} %`} />
        <Row label="karana left"    value={`${p.left.karana.toFixed(2)} %`} />
      </div>

      {p.jhora && <JhoraRows jhora={p.jhora} />}
    </div>
  );
}

const horaText = (hora: { lord: string; number: number; from: string; to: string; fiveSign: string; fiveInferred: boolean }, t: (text: string) => string) =>
  `${hora.lord} (${hora.number} / 24, ${hora.from.slice(0, 8)}–${hora.to.slice(0, 8)}) · ${t('5 min sign')}: ${t(hora.fiveSign)}${hora.fiveInferred ? ` (${t('inferred')})` : ''}`;

/** The fields of Jagannatha Hora's panchanga, each its own system and kept apart from the app's own Hora, Kāla and sunrise above (docs/panchanga-record.md). */
function JhoraRows({ jhora }: { jhora: NonNullable<PanchangResult['jhora']> }) {
  const t = useT();
  return (
    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2" data-panchang="jhora">
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 dark:text-zinc-600">{t('Jagannatha Hora’s fields')}</div>
      <p className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">{t('Each field here follows Jagannatha Hora’s own rule and is not the same as the field of a similar name above: the sunrise is the centre of the Sun’s disc without refraction, the Hora Lord is equal hours, the Hora above is day and night in twelfths, and the Kala above is a five-fold day. The rules are read from JHora’s outputs, not from its manual.')}</p>
      <Row label="jhora weekday"      value={jhora.vedicWeekday} />
      <Row label="jhora sunrise"      value={jhora.sunrise} />
      <Row label="jhora sunset"       value={jhora.sunset} />
      <Row label="janma ghatis"       value={jhora.janmaGhatis.toFixed(4)} />
      <Row label="sidereal time"      value={jhora.siderealTime} />
      <Row label="hora lord"          value={horaText(jhora.horaLord, t)} />
      <Row label="mahakala hora"      value={`${horaText(jhora.mahakalaHora, t)} · LMT ${jhora.mahakalaHora.lmt}`} />
      <Row label="kaala lord"         value={jhora.kaalaLord ? `${jhora.kaalaLord.lord} (${jhora.kaalaLord.part} / 8, ${jhora.kaalaLord.from.slice(0, 8)}–${jhora.kaalaLord.to.slice(0, 8)})` : t('not given by night')} />
      <Row label="kaala (mahakala)"   value={jhora.kaalaLordMahakala ? `${jhora.kaalaLordMahakala.lord} (${jhora.kaalaLordMahakala.part} / 8) · ${t('unconfirmed')}` : t('not given by night')} />
    </div>
  );
}

export default function PanchangPanel({ chart, birthDatetime, utcOffsetHours, ayanamsaName, nakshatraAdjust = 0, edited = false, open = true, onToggle }: Props) {
  const t = useT();
  if (!chart) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-400 dark:text-zinc-600 text-xs font-mono text-center px-4">
        {t('Calculate a chart to see Panchang')}
      </div>
    );
  }

  const p = calculatePanchang(chart, birthDatetime, utcOffsetHours, ayanamsaName, nakshatraAdjust);

  return (
    <div className="space-y-4" data-panchang>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-xs font-mono text-zinc-500 dark:text-zinc-500">&gt; panchang</div>
          {open && (
            <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-600 mt-1">
              {t('times shown in local birth timezone · vāra and horā counted from sunrise')}
            </div>
          )}
          {edited && (
            <div className="mt-1 text-[10px] font-mono text-amber-700 dark:text-amber-400" data-panchang-edited>
              {t('of the edited chart: tithi, nakṣatra, karaṇa and yoga follow the grahas where they have been moved; vāra, horā, masa and the times are those of the real moment')}
            </div>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-label={open ? t('hide the panchang') : t('show the panchang')}
            className="shrink-0 rounded border border-zinc-200 px-1.5 py-0.5 text-[9px] text-zinc-500 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            {open ? '−' : '+'}
          </button>
        )}
      </div>
      {open && <PanchangRows p={p} />}
    </div>
  );
}
